CREATE OR REPLACE FUNCTION get_products()
RETURNS TABLE (
    product_id INT,
    product_name VARCHAR,
    product_description TEXT,
    product_price DECIMAL(10, 2),
    product_quantity INT,
    category_id INT,
    product_image BYTEA
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name,
        p.description,
        p.price,
        p.quantity,
        p.category_id,
        p.image
    FROM Product p
    ORDER BY p.id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_categories()
RETURNS TABLE (
    category_id INT,
    category_name VARCHAR,
    category_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id,
        name,
        description
    FROM Category
    ORDER BY id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_user_by_email(p_email VARCHAR)
RETURNS TABLE (
    user_id INT,
    user_email VARCHAR,
    user_hashed_password TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id as user_id,
        email as user_email,
        hashed_password as user_hashed_password
    FROM Customer
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE add_new_user(
    p_email VARCHAR,
    p_hashed_password TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Customer (email, hashed_password)
    VALUES (p_email, p_hashed_password);
END;
$$;

CREATE OR REPLACE FUNCTION get_cart(customer_id INT)
RETURNS TABLE (
    product_id INT,
    product_name VARCHAR,
    price DECIMAL(10, 2),
    quantity INT,
    warehouse_quantity INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        p.price as price,
        c.quantity as quantity,
        p.quantity as warehouse_quantity
    FROM Cart c
    JOIN product p ON c.product_id = p.id
    WHERE c.customer_id = $1;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_customer_data_by_id(p_customer_id INT)
RETURNS TABLE (
    full_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    birthday DATE,
    city VARCHAR(255),
    street VARCHAR(255),
    house VARCHAR(20),
    building VARCHAR(20),
    entrance VARCHAR(20),
    apartment VARCHAR(20),
    floor INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.full_name,
        c.phone,
        c.email,
        c.birthday,
        ca.city,
        ca.street,
        ca.house,
        ca.building,
        ca.entrance,
        ca.apartment,
        ca.floor
    FROM Customer c
    JOIN Customers_Addresses ca ON c.customer_address_id = ca.id
    WHERE c.id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE update_customer_data(
    p_user_id INT,
    p_full_name VARCHAR(255) DEFAULT NULL,
    p_phone VARCHAR(20) DEFAULT NULL,
    p_email VARCHAR(255) DEFAULT NULL,
    p_birthday DATE DEFAULT NULL,
    p_city VARCHAR(255) DEFAULT NULL,
    p_street VARCHAR(255) DEFAULT NULL,
    p_house VARCHAR(20) DEFAULT NULL,
    p_building VARCHAR(20) DEFAULT NULL,
    p_entrance VARCHAR(20) DEFAULT NULL,
    p_apartment VARCHAR(20) DEFAULT NULL,
    p_floor INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Customer
    SET
        full_name = COALESCE(p_full_name, full_name),
        phone = COALESCE(p_phone, phone),
        email = COALESCE(p_email, email),
        birthday = COALESCE(p_birthday, birthday)
    WHERE id = p_user_id;

    UPDATE Customers_Addresses
    SET
        city = COALESCE(p_city, city),
        street = COALESCE(p_street, street),
        house = COALESCE(p_house, house),
        building = COALESCE(p_building, building),
        entrance = COALESCE(p_entrance, entrance),
        apartment = COALESCE(p_apartment, apartment),
        floor = COALESCE(p_floor, floor)
    WHERE id = (SELECT customer_address_id FROM Customer WHERE id = p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION get_product_by_id(p_product_id INT)
RETURNS TABLE (
    id INT,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    quantity INT,
    product_image BYTEA,
    category_name VARCHAR(255),
    category_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as id,
        p.name as name,
        p.description as description,
        p.price as price,
        p.quantity as quantity,
        p.image as product_image,
        c.name as category_name,
        c.description as category_description
    FROM Product p
    JOIN Category c ON p.category_id = c.id
    WHERE p.id = p_product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_product_full_info(
    p_id INT,
    p_name VARCHAR(255),
    p_description TEXT,
    p_price DECIMAL(10, 2),
    p_quantity INT,
    p_image BYTEA,
    p_category_name VARCHAR(255),
    p_category_description TEXT
) RETURNS VOID AS $$
DECLARE
    var_category_id INT;
BEGIN
    IF p_category_name IS NOT NULL THEN
        SELECT id INTO var_category_id
        FROM Category
        WHERE Category.name = p_category_name;

        IF var_category_id IS NULL THEN
            INSERT INTO Category (name, description)
            VALUES (p_category_name, p_category_description)
            RETURNING id INTO var_category_id;
        ELSE
            UPDATE Category
            SET description = COALESCE(p_category_description, description)
            WHERE id = var_category_id;
        END IF;
    END IF;

    UPDATE Product
    SET
        name = COALESCE(p_name, Product.name),
        description = COALESCE(p_description, Product.description),
        price = COALESCE(p_price, Product.price),
        quantity = COALESCE(p_quantity, Product.quantity),
        category_id = COALESCE(var_category_id, Product.category_id),
        image = COALESCE(p_image, Product.image)
    WHERE Product.id = p_id;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_product(p_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM Product WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE add_product(
    p_name VARCHAR(255),
    p_description TEXT,
    p_price DECIMAL(10, 2),
    p_quantity INT,
    p_image BYTEA,
    p_category_name VARCHAR(255),
    p_category_description TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    var_category_id INT;
BEGIN
    SELECT id INTO var_category_id
    FROM Category
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(p_category_name));

    IF var_category_id IS NULL THEN
        INSERT INTO Category (name, description)
        VALUES (p_category_name, p_category_description)
        RETURNING id INTO var_category_id;
    ELSE
        UPDATE Category
        SET description = COALESCE(p_category_description, description)
        WHERE id = var_category_id;
    END IF;

    INSERT INTO Product (name, description, price, quantity, category_id, image)
    VALUES (p_name, p_description, p_price, p_quantity, var_category_id, p_image);
END;
$$;

CREATE OR REPLACE FUNCTION create_order_from_cart(p_customer_id INT)
RETURNS VOID AS $$
DECLARE
    var_order_id INT;
BEGIN
    -- Проверяем, что для всех товаров в корзине достаточно количества на складе
    IF EXISTS (
        SELECT 1
        FROM Cart c
        INNER JOIN Product p ON c.product_id = p.id
        WHERE c.customer_id = p_customer_id AND p.quantity < c.quantity
    ) THEN
        RAISE EXCEPTION 'Not enough stock for one or more products';
    END IF;

    -- Создаем новый заказ для пользователя
    INSERT INTO "Order" (customer_id, order_date, status_id)
    VALUES (p_customer_id, CURRENT_TIMESTAMP, 1) -- Статус заказа по умолчанию (например, "Ожидание")
    RETURNING id INTO var_order_id;

    -- Переносим товары из корзины в Order_Product
    INSERT INTO Order_Product (order_id, product_id, product_price, quantity)
    SELECT 
        var_order_id, 
        c.product_id, 
        p.price,
        c.quantity
    FROM 
        Cart c
    INNER JOIN 
        Product p ON c.product_id = p.id
    WHERE 
        c.customer_id = p_customer_id;

    -- Уменьшаем количество товаров в таблице Product
    UPDATE Product
    SET quantity = Product.quantity - c.quantity
    FROM Cart c
    WHERE Product.id = c.product_id AND c.customer_id = p_customer_id;

    -- Удаляем товары из корзины
    DELETE FROM Cart
    WHERE Cart.customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE insert_seller(
    s_nickname VARCHAR(255),
    s_hashed_password TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Seller (nickname, hashed_password)
    VALUES (s_nickname, s_hashed_password);
END;
$$;

CREATE OR REPLACE FUNCTION delete_or_update_cart_product(
    p_customer_id INT,
    p_product_id INT
) RETURNS VOID AS $$
BEGIN
    -- Если количество товара равно 1, удаляем запись из корзины
    IF EXISTS (
        SELECT 1
        FROM Cart
        WHERE customer_id = p_customer_id
          AND product_id = p_product_id
          AND quantity = 1
    ) THEN
        DELETE FROM Cart
        WHERE customer_id = p_customer_id
          AND product_id = p_product_id;
    ELSE
        -- Иначе уменьшаем количество товара на 1
        UPDATE Cart
        SET quantity = quantity - 1
        WHERE customer_id = p_customer_id
          AND product_id = p_product_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_orders_by_customer_id(p_customer_id INT)
RETURNS TABLE (
    order_id INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id as order_id
    FROM "Order"
    WHERE "Order".customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_products_from_order_by_order_id(p_order_id INT)
RETURNS TABLE (
    product_name VARCHAR(255),
    price DECIMAL(10, 2),
    quantity INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        P.name as product_name,
        P.price as price,
        op.quantity as quantity
    FROM Order_Product op
    JOIN Product P ON op.product_id = P.id
    WHERE op.order_id = p_order_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_seller()
RETURNS TABLE (
    id INT,
    nickname VARCHAR(255),
    hashed_password TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,  -- Алиас для таблицы
        s.nickname,
        s.hashed_password
    FROM Seller s
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE PROCEDURE remove_item_from_cart(p_customer_id INT, p_product_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Cart
    WHERE customer_id = p_customer_id AND product_id = p_product_id;
END;
$$;

CREATE OR REPLACE PROCEDURE add_item_to_cart(p_customer_id INT, p_product_id INT, p_quantity INT DEFAULT 1)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO cart (customer_id, product_id, quantity) 
    VALUES (p_customer_id, p_product_id, p_quantity);
END;
$$;
