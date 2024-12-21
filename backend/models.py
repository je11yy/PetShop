from datetime import date
from typing import List
from pydantic import BaseModel, EmailStr
from enum import Enum
from typing import Optional

class Gender(str, Enum):
    male = "Male"
    female = "Female"

class Product(BaseModel):
    id: int
    name: str
    description: str
    price: float
    quantity: int
    image: Optional[bytes]

class Category(BaseModel):
    name: str
    description: str
    products: List[Product]

class ProductResponse(BaseModel):
    categories: List[Category]

class CartItem(BaseModel):
    product_id: int
    product_name: str
    price: float
    quantity: int
    warehouse_quantity: int

class CartResponse(BaseModel):
    cart: List[CartItem]

class LoginRequest(BaseModel):
    email: str
    password: str

class SellerLoginRequest(BaseModel):
    nickname: str
    password: str

class LoginResponse(BaseModel):
    token: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class CustomerInfo(BaseModel):
    full_name: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    birthday: Optional[date]
    city: Optional[str]
    street: Optional[str]
    house: Optional[str]
    building: Optional[str]
    entrance: Optional[str]
    apartment: Optional[str]
    floor: Optional[int]

class ProductFullInfo(BaseModel):
    id: Optional[int]
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    quantity: Optional[int]
    category_name: Optional[str]
    category_description: Optional[str]
    image: Optional[bytes]

class ProductFullInfoWithoutId(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    quantity: Optional[int]
    category_name: Optional[str]
    category_description: Optional[str]
    image: Optional[bytes]

class OrderItem(BaseModel):
    product_name: str
    price: float
    quantity: int

class Order(BaseModel):
    order_items: List[OrderItem]

class OrderResponse(BaseModel):
    order_list: List[Order]

class BackupsGetResponse(BaseModel):
    backup_names_list: List[str]

class BackUpRequest(BaseModel):
    filename: str