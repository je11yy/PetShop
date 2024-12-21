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

CREATE TABLE Status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

CREATE TABLE "Order" (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Customer(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_id INT REFERENCES Status(id)
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

CREATE OR REPLACE FUNCTION add_default_address()
RETURNS TRIGGER AS $$
DECLARE
    new_address_id INT;
BEGIN
    INSERT INTO Customers_Addresses (city, street, house, building, entrance, apartment, floor)
    VALUES (NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    RETURNING id INTO new_address_id;

    NEW.customer_address_id := new_address_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_default_address
BEFORE INSERT ON Customer
FOR EACH ROW
EXECUTE FUNCTION add_default_address();

CREATE OR REPLACE FUNCTION update_or_insert_cart()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Cart
    SET quantity = quantity + NEW.quantity
    WHERE customer_id = NEW.customer_id AND product_id = NEW.product_id;

    IF FOUND THEN
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_or_insert_cart
BEFORE INSERT ON Cart
FOR EACH ROW
EXECUTE FUNCTION update_or_insert_cart();

CREATE OR REPLACE FUNCTION delete_product_dependencies()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Order_Product
    WHERE product_id = OLD.id;

    DELETE FROM Cart
    WHERE product_id = OLD.id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_product_dependencies
BEFORE DELETE ON Product
FOR EACH ROW
EXECUTE FUNCTION delete_product_dependencies();

