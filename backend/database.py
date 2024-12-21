import base64
from asyncpg import Connection, create_pool
import json

class Database:
    def __init__(self, config_path: str):
        with open(config_path, 'r') as config_file:
            self.config = json.load(config_file)['database']
        self.pool = None

    async def connect(self):
        self.pool = await create_pool(
            user=self.config['user'],
            password=self.config['password'],
            database=self.config['dbname'],
            host=self.config['host'],
            port=self.config['port']
        )
    
    async def insert_seller(self, conn: Connection, nickname, hashed_password):
        return await conn.fetch(
            'CALL insert_seller($1, $2);', nickname, hashed_password
        )
    
    async def get_seller(self, conn: Connection):
        return await conn.fetch(
            "SELECT * FROM get_seller();"
        )
    
    async def insert_seller(self, conn: Connection, nickname, hashed_password):
        return await conn.fetch(
            'CALL insert_seller($1, $2);', nickname, hashed_password
        )

    async def get_product_by_id(self, conn: Connection, id):
        return await conn.fetch(
            'SELECT * FROM get_product_by_id($1);', id
        )

    async def get_products(self, conn: Connection):
        return await conn.fetch(
            'SELECT * FROM get_products();'
        )
    
    async def get_categories(self, conn: Connection):
        return await conn.fetch(
            'SELECT * FROM get_categories();'
        )
    
    async def get_user_by_email(self, conn, email: str) -> dict:
        return await conn.fetch(
            'SELECT * FROM get_user_by_email($1);', email
        )
    
    async def add_new_user(self, conn, email: str, hashed_password: str) -> dict:
        await conn.execute(
            'CALL add_new_user($1, $2);', email, hashed_password
        )
    
    async def get_cart_items(self, conn, user_id: int):
        return await conn.fetch("SELECT * FROM get_cart($1);", user_id)

    # СДЕЛАТЬ ФУНКЦИЕЙ ВНУТРИ БД!!!
    async def get_cart_item_by_product(self, conn, user_id: int, product_id: int):
        query = """
        SELECT * FROM get_cart_item_by_product($1, $2)
        """
        return await conn.fetchrow(query, user_id, product_id)

    async def remove_item_from_cart(self, conn, user_id: int, product_id: int):
        query = """
        CALL remove_item_from_cart($1, $2);
        """
        await conn.execute(query, user_id, product_id)
    
    async def add_item_to_cart(self, conn, user_id: int, product_id: int):
        await conn.execute(
            "CALL add_item_to_cart($1, $2, $3)",
            user_id, product_id, 1
        )

    async def get_customer_data_by_id(self, conn, user_id: int):
        return await conn.fetch(
            'SELECT * FROM get_customer_data_by_id($1);', user_id
        )
    
    async def update_customer_data_by_id(self, conn, user_id, updated_data):
        await conn.execute(
            """
            CALL update_customer_data(
                p_user_id => $1,
                p_full_name => $2,
                p_phone => $3,
                p_email => $4,
                p_birthday => $5,
                p_city => $6,
                p_street => $7,
                p_house => $8,
                p_building => $9,
                p_entrance => $10,
                p_apartment => $11,
                p_floor => $12
            )
            """,
            user_id,
            updated_data.full_name,
            updated_data.phone,
            updated_data.email,
            updated_data.birthday,
            updated_data.city,
            updated_data.street,
            updated_data.house,
            updated_data.building,
            updated_data.entrance,
            updated_data.apartment,
            updated_data.floor
        )

    async def get_product_by_id(self, conn, product_id):
        return await conn.fetch("SELECT * FROM get_product_by_id($1);", product_id)
    
    async def update_product_full_info(
            self,
            conn,
            product_info
        ):
            query = """
            SELECT update_product_full_info(
                $1, $2, $3, $4, $5, $6, $7, $8
            );
            """
            await conn.execute(
                query,
                product_info.id,
                product_info.name,
                product_info.description,
                product_info.price,
                product_info.quantity,
                base64.b64decode(product_info.image),
                product_info.category_name,
                product_info.category_description
            )

    async def delete_product_by_id(self, conn, product_id):
        await conn.fetch("CALL delete_product($1);", product_id)

    async def add_product(self, conn, product_info):
        query = """
        CALL add_product(
            $1, $2, $3, $4, $5, $6, $7
        );
        """
        await conn.execute(
            query,
            product_info.name,
            product_info.description,
            product_info.price,
            product_info.quantity,
            product_info.image,
            product_info.category_name,
            product_info.category_description
        )
    
    async def create_order_from_cart(self, conn, user_id):
        query = """
                SELECT create_order_from_cart($1);
                """
        await conn.execute(
            query,
            user_id
        )

    async def clear_cart_by_customer_id(self, conn, user_id):
        query = """
                CALL clear_cart_by_customer_id($1);
                """
        await conn.execute(
            query,
            user_id
        )

    async def insert_product(self, conn, name, description, price, quantity, category_id, image):
        await conn.execute(
            """
            CALL insert_product($1, $2, $3, $4, $5, $6);
            """, name, description, price, quantity, category_id, image
        )

    async def create_order_from_cart(self, conn, consumer_id):
        query = "SELECT create_order_from_cart($1);"
        try:
            await conn.execute(query, consumer_id)
        except Exception as e:
            raise e

    async def delete_or_update_cart_product(self, conn, customer_id, product_id):
        query = """
                SELECT delete_or_update_cart_product($1, $2);
                """
        await conn.execute(
            query,
            customer_id,
            product_id
        )

    async def get_orders_by_customer_id(self, conn, customer_id):
        query = """
                SELECT * FROM get_orders_by_customer_id($1);
                """
        return await conn.fetch(
            query,
            customer_id
        ) 
    
    async def get_products_from_order_by_order_id(self, conn, order_id):
        query = """
                SELECT * FROM get_products_from_order_by_order_id($1);
                """
        return await conn.fetch(
            query,
            order_id
        )