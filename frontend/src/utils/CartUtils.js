import React from "react";
import { FaBox } from "react-icons/fa";

const navigateToProduct = (product_id, navigate) => {
    navigate(`/product/${product_id}`);
};

export const getCartItems = (cartItems, removeCartItem, navigate) => {
    return (
        <ul className="product-items">
            {cartItems.map((item) => (
                <li key={item.product_name}>
                    <div className="product-card" key={item.product_name}>
                        <h4
                            className="product-name"
                            onClick={() =>
                                navigateToProduct(item.product_id, navigate)
                            }
                        >
                            {item.product_name}
                        </h4>
                        <p className="price">${item.price}</p>
                        <p className="quantity">
                            In cart: {item.quantity} <FaBox />
                        </p>
                        <p className="quantity">
                            In stock: {item.warehouse_quantity} <FaBox />
                        </p>
                        <button onClick={() => removeCartItem(item.product_id)}>
                            Remove
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
};
