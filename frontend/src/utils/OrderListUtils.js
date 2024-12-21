import React from "react";
import { FaBox } from "react-icons/fa";

const getOrderComponent = (order) => {
    return (
        <div className="order">
            {order.map((item, index) => (
                <div key={index}>
                    <div className="product-card" key={item.product_name}>
                        <h4 className="product-name">{item.product_name}</h4>
                        <p className="price">${item.price}</p>
                        <p className="quantity">
                            {item.quantity} <FaBox />
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const getOrderItems = (orders) => {
    if (!orders || !Array.isArray(orders)) {
        console.log("orderItems не является массивом", orders);
        return <p className="error">Something went wrong</p>;
    }
    return (
        <div>
            {orders.map((order, index) => (
                <div key={index}>{getOrderComponent(order.order_items)}</div>
            ))}
        </div>
    );
};
