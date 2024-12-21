import base64
import models

def prepare_products(products, categories):
    products_dict = {}

    for product in products:
        category = categories[product['category_id'] - 1]
        category_name = category['category_name']

        if category_name not in products_dict:
            products_dict[category_name] = {
                'name': category_name,
                'description': category['category_description'],
                'products': []
            }
        
        encoded_image = base64.b64encode(product['product_image']).decode('utf-8')
        product_object = models.Product(
            id=product['product_id'],
            name=product['product_name'],
            description=product['product_description'],
            price=product['product_price'],
            quantity=product['product_quantity'],
            image=encoded_image
        )
        products_dict[category_name]['products'].append(product_object)

    categories_data = []
    for category_data in products_dict.values():
        category_obj = models.Category(
            name=category_data['name'],
            description=category_data['description'],
            products=category_data['products']
        )
        categories_data.append(category_obj)

    return models.ProductResponse(categories=categories_data)

def prepare_cart(cart):
    cart_result = []

    for item in cart:
        cart_result.append(create_cart_object(item))

    return models.CartResponse(
        cart=cart_result
    )

def create_cart_object(cart_item):
    return models.CartItem(
        product_id=cart_item['product_id'],
        product_name=cart_item['product_name'],
        price=cart_item['price'],
        quantity=cart_item['quantity'],
        warehouse_quantity=cart_item['warehouse_quantity']
    )

def create_customer_info(customer_info):
    return models.CustomerInfo(
        full_name=customer_info[0]['full_name'] if customer_info[0]['full_name'] is not None else None,
        phone=customer_info[0]['phone'] if customer_info[0]['phone'] is not None else None,
        email=customer_info[0]['email'] if customer_info[0]['email'] is not None else None,
        birthday=customer_info[0]['birthday'] if customer_info[0]['birthday'] is not None else None,
        city=customer_info[0]['city'] if customer_info[0]['city'] is not None else None,
        street=customer_info[0]['street'] if customer_info[0]['street'] is not None else None,
        house=customer_info[0]['house'] if customer_info[0]['house'] is not None else None,
        building=customer_info[0]['building'] if customer_info[0]['building'] is not None else None,
        entrance=customer_info[0]['entrance'] if customer_info[0]['entrance'] is not None else None,
        apartment=customer_info[0]['apartment'] if customer_info[0]['apartment'] is not None else None,
        floor=customer_info[0]['floor'] if customer_info[0]['floor'] is not None else None
    )

def create_product_full_info(product_info):
    encoded_image = base64.b64encode(product_info[0]['product_image']).decode('utf-8')
    return models.ProductFullInfo(
        id=product_info[0].get('id'),
        name=product_info[0].get('name'),
        description=product_info[0].get('description'),
        price=product_info[0].get('price'),
        quantity=product_info[0].get('quantity'),
        image=encoded_image,
        category_name=product_info[0].get('category_name'),
        category_description=product_info[0].get('category_description')
    )