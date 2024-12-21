CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

CREATE TABLE Product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    quantity INT,
    category_id INT REFERENCES Category(id),
    image BYTEA
);

CREATE TABLE Customers_Addresses (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    street VARCHAR(255),
    house VARCHAR(20),
    building VARCHAR(20),
    entrance VARCHAR(20),
    apartment VARCHAR(20),
    floor INT
);

CREATE TABLE Customer (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    birthday DATE,
    hashed_password TEXT,
    customer_address_id INT REFERENCES Customers_Addresses(id)
);

CREATE TABLE Seller (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(255),
    hashed_password TEXT
);

CREATE TABLE "Order" (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Customer(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Order_Product (
    order_id INT REFERENCES "Order"(id),
    product_id INT REFERENCES Product(id),
    product_price DECIMAL(10, 2),
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE Cart (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customer(id),
    product_id INTEGER REFERENCES product(id),
    quantity INTEGER NOT NULL
);