from database import Database
import asyncio

db = Database(config_path="fillingConfig.json")

products = [[
    ["Premium food for cats", "High-quality food for adult cats with chicken", 20.2, 50],
    ["Organic cat food", "Healthy and organic food with salmon", 25.5, 30],
    ["Gourmet food for kittens", "Special food for kittens with added vitamins", 18.75, 100],
    ["Grain-free food for cats", "Grain-free formula with chicken and turkey", 28.9, 70],
    ["Wet food for cats", "Canned food with chicken and broth", 15.4, 150],
], [
    ["Bone Toy", "Durable bone toy for dogs with natural rubber", 20.2, 60],
    ["Interactive ball", "Battery-operated ball for dogs, keeps them active", 30.0, 40],
    ["Squeaky bone", "Squeaky toy bone that entertains your dog", 12.99, 80],
    ["Chew toy", "Rubber chew toy for aggressive chewers", 18.5, 120],
    ["Plush toy", "Soft and plush dog toy for snuggling", 14.99, 200],
], [
    ["Collar", "Stylish leather collar for dogs with a golden buckle", 25.0, 50],
    ["Adjustable collar", "Collar with adjustable straps for growing puppies", 15.2, 75],
    ["Bow tie for pets", "Cute bow tie for small dogs and cats", 9.99, 100],
    ["Pet harness", "Comfortable harness for medium-sized dogs", 35.0, 45],
    ["Leash", "Durable leash for long walks", 18.0, 60],
], [
    ["Flea drops", "Flea treatment drops for dogs, effective and safe", 22.5, 80],
    ["Vitamins for dogs", "Daily vitamins to boost your dog's health", 18.0, 120],
    ["Ear cleaning solution", "Gentle ear cleaner for pets with sensitive ears", 10.99, 200],
    ["Joint supplements", "Support for older dogs with joint problems", 30.0, 70],
    ["Calming treats", "Natural calming treats for anxious pets", 16.5, 50],
], [
    ["Litter box", "Spacious and easy-to-clean litter box for cats", 25.99, 150],
    ["Comfortable pet bed", "Soft and warm pet bed for small dogs", 35.0, 90],
    ["Pet crate", "Portable pet crate for travel and safety", 60.0, 40],
    ["Automatic feeder", "Programmable automatic food dispenser for pets", 75.5, 30],
    ["Water fountain", "Continuous water flow to keep pets hydrated", 40.0, 100],
]]


def get_bytes_image(filename):
    with open("../resources/" + filename, "rb") as image_file:
        return image_file.read()

async def insert_products(categories, db):
    await db.connect()
    category_id = 1
    count = 1
    for category in categories:
        for product in category:
            async with db.pool.acquire() as conn:
                product_name = product[0]
                product_description = product[1]
                price = product[2]
                quantity = product[3]
                image_filename = str(count) + ".jpg"

                image_in_bytes = get_bytes_image(image_filename)
                await db.insert_product(conn, product_name, product_description, price, quantity, category_id, image_in_bytes)
                count += 1
        category_id += 1


asyncio.run(insert_products(products, db))