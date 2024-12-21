import base64
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from database import Database
from auth import AuthService
import models
import functional
from asyncpg.exceptions import PostgresError
import os
import subprocess
from datetime import datetime

app = FastAPI()

BACKUP_DIR = "/backups"

origins = [
    "http://frontend:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Database(config_path="config.json")
auth_service = AuthService(config_path="config.json", db=db)
auth_scheme = HTTPBearer()

@app.on_event("startup")
async def startup():
    await db.connect()

    # подумать, как лучше это сделать
    async with db.pool.acquire() as conn:
        seller_exists = await db.get_seller(conn)
        
        if seller_exists:
            return
        nickname = "admin"
        password = "admin"
        hashed_password = auth_service._AuthService__hash_password(password)
        await db.insert_seller(conn, nickname, hashed_password)

@app.get("/products", response_model=models.ProductResponse)
async def get_products():
    async with db.pool.acquire() as conn:
        products = await db.get_products(conn)
        categories = await db.get_categories(conn)
        return functional.prepare_products(products, categories)
        
@app.post("/login", response_model=models.LoginResponse)
async def login(request: models.LoginRequest):
    async with db.pool.acquire() as conn:
        users = await db.get_user_by_email(conn, request.email)
        if not users:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        user = users[0]
        if not auth_service._AuthService__verify_password(request.password, user['user_hashed_password']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = auth_service._AuthService__create_jwt(user_id=user['user_id'], user_email=user['user_email'])
        return {"token": token}
    
@app.post("/seller/login", response_model=models.LoginResponse)
async def login(request: models.SellerLoginRequest):
    async with db.pool.acquire() as conn:
        sellers = await db.get_seller(conn)
        if not sellers:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        seller = sellers[0]
        if not auth_service._AuthService__verify_password(request.password, seller['hashed_password']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = auth_service._AuthService__create_jwt(user_id=seller['id'], user_email=seller['nickname'])
        return {"token": token}
    
@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: models.RegisterRequest):
    async with db.pool.acquire() as conn:
        existing_user = await db.get_user_by_email(conn, user.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        hashed_password = auth_service._AuthService__hash_password(user.password)
        await db.add_new_user(conn, user.email, hashed_password)
        return {"message": "User registered successfully"}
    
@app.get("/cart", response_model=models.CartResponse)
async def get_cart(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        token = credentials.credentials
        user = auth_service._AuthService__decode_token(token)  # Расшифровываем токен
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    async with db.pool.acquire() as conn:
        cart_items = await db.get_cart_items(conn, user_id=user['user_id'])
        return functional.prepare_cart(cart_items)
    
@app.delete("/cart/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item_from_cart(product_id: int, credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        token = credentials.credentials
        user = auth_service._AuthService__decode_token(token)  # Расшифровываем токен
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    async with db.pool.acquire() as conn:
        item = await db.get_cart_item_by_product(conn, user_id=user['user_id'], product_id=product_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found in cart")

        await db.delete_or_update_cart_product(conn, user['user_id'], product_id=product_id)
        return {"message": "Item removed from cart"}
    
@app.post("/cart/{product_id}", status_code=status.HTTP_201_CREATED)
async def add_item_to_cart(product_id: int, credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        token = credentials.credentials
        user = auth_service._AuthService__decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    async with db.pool.acquire() as conn:
        product = await db.get_product_by_id(conn, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        await db.add_item_to_cart(conn, user_id=user['user_id'], product_id=product_id)

        return {"message": "Item added to cart successfully"}
    
@app.get("/customer", response_model=models.CustomerInfo)
async def get_customer_info(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        token = credentials.credentials
        user = auth_service._AuthService__decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    async with db.pool.acquire() as conn:
        customer = await db.get_customer_data_by_id(conn, user_id=user['user_id'])
        return functional.create_customer_info(customer)
    
@app.post("/customer", response_model=models.CustomerInfo)
async def update_customer_info(
    customer_info: models.CustomerInfo,
    credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    try:
        token = credentials.credentials
        user = auth_service._AuthService__decode_token(token)
        user_id = user['user_id']
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    async with db.pool.acquire() as conn:
        current_customers = await db.get_customer_data_by_id(conn, user_id=user_id)
        if not current_customers:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        current_customer = dict(current_customers[0])

        update_data = customer_info.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field in current_customer and value is not None:
                current_customer[field] = value
        
        await db.update_customer_data_by_id(conn, user_id, models.CustomerInfo(**current_customer))

        updated_customer = await db.get_customer_data_by_id(conn, user_id=user_id)
        return functional.create_customer_info(updated_customer)

@app.get("/product/{product_id}", response_model=models.ProductFullInfo)
async def get_product_by_id(
    product_id: int
    ):
    async with db.pool.acquire() as conn:
        product_info = await db.get_product_by_id(conn, product_id)
        return functional.create_product_full_info(product_info)
    
@app.post("/product", status_code=status.HTTP_201_CREATED)
async def update_product_info(
    product_info: models.ProductFullInfo,
):  
    async with db.pool.acquire() as conn:
        current_products = await db.get_product_by_id(conn, product_info.id)
        if not current_products:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        current_product = dict(current_products[0])

        update_data = product_info.dict(exclude_unset=True)
        for field, value in update_data.items():
            current_product[field] = value

        product_object = models.ProductFullInfo(**current_product)
        
        await db.update_product_full_info(conn, product_object)

@app.delete("/product/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int):
    async with db.pool.acquire() as conn:
        product_exists = await db.get_product_by_id(conn, product_id)
        if not product_exists:
            raise HTTPException(status_code=404, detail="Product not found")

        await db.delete_product_by_id(conn, product_id)
        return {"message": f"Product with ID {product_id} has been deleted successfully"}
    
@app.post("/product/insert", status_code=status.HTTP_201_CREATED)
async def add_product_info(product_info: models.ProductFullInfoWithoutId):
    product_info.image = base64.b64decode(product_info.image)
    if len(product_info.category_description) == 0:
        product_info.category_description = None
    async with db.pool.acquire() as conn:
        try:
            await db.add_product(conn, product_info)
            return {"message": "Product added successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/product/{product_id}/image")
async def get_product_image(product_id: int):
    async with db.pool.acquire() as conn:
        result = await conn.fetchrow("SELECT image FROM Product WHERE id = $1", product_id)
        if result and result['image']:
            return Response(content=result['image'], media_type="image/jpeg")
        else:
            raise HTTPException(status_code=404, detail="Image not found")
        
@app.post("/order/create")
async def checkout_order(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        token = credentials.credentials
        user = auth_service._AuthService__decode_token(token)
        user_id = user['user_id']
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    async with db.pool.acquire() as conn:
        try:
            await db.create_order_from_cart(conn, user_id)
            return {"message": "Order created successfully"}
        
        except PostgresError as e:
            if "Not enough stock" in str(e):
                raise HTTPException(status_code=400, detail="Not enough stock for one or more products")
            else:
                raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/orders", response_model=models.OrderResponse)
async def get_orders_with_products(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        token = credentials.credentials
        user = auth_service._AuthService__decode_token(token)
        user_id = user['user_id']
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    async with db.pool.acquire() as conn:
        try:
            orders_result = await db.get_orders_by_customer_id(conn, user_id)
            print(orders_result)

            if not orders_result:
                return {"order_list": []}

            order_list = []
            for order in orders_result:
                order_id = int(order["order_id"])

                products_result = await db.get_products_from_order_by_order_id(conn, order_id)
                print(products_result)

                order_items = [
                    models.OrderItem(
                        product_name=product["product_name"],
                        price=float(product["price"]),
                        quantity=int(product["quantity"]),
                    )
                    for product in products_result
                ]
                print(order_items)

                order_list.append(models.Order(order_items=order_items))
            print(order_list)
            return models.OrderResponse(order_list=order_list)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

@app.post("/backup")
async def backup_database():
    try:
        os.makedirs(BACKUP_DIR, exist_ok=True)
        current_time = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        backup_file = os.path.join(BACKUP_DIR, f"db_backup_{current_time}.dump")

        # лучше брать из конфига...
        command = [
            "pg_dump",
            "--host", "db",
            "--port", "5432", 
            "--username", "user", 
            "--dbname", "petshop",
            "--format=c",
            "--file", backup_file
        ]
        os.environ["PGPASSWORD"] = "password" 

        subprocess.run(command, check=True)

        return {"message": f"Backup created successfully at {backup_file}"}

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.post("/restore")
async def restore_database(backup: models.BackUpRequest):
    backup_filename = backup.filename
    try:
        backup_file = os.path.join(BACKUP_DIR, backup_filename)

        if not os.path.exists(backup_file):
            raise HTTPException(status_code=404, detail="Backup file not found")

        # лучше брать из конфига...
        command = [
            "pg_restore",
            "--host", "db",
            "--port", "5432",
            "--username", "user",
            "--dbname", "petshop",
            "--if-exists",
            "--clean",
            backup_file
        ]
        os.environ["PGPASSWORD"] = "password"

        subprocess.run(command, check=True)

        return {"message": f"Database restored successfully from {backup_filename}"}

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/backups", response_model=models.BackupsGetResponse)
async def get_backups():
    try:
        if not os.path.exists(BACKUP_DIR):
            os.makedirs(BACKUP_DIR)

        backup_files = [
            f for f in os.listdir(BACKUP_DIR) 
            if os.path.isfile(os.path.join(BACKUP_DIR, f))
        ]

        return models.BackupsGetResponse(backup_names_list=backup_files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch backups: {str(e)}")
