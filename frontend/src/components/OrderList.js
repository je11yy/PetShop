import React, { useEffect, useState } from "react";
import { getOrderItems } from "../utils/OrderListUtils";
import { getOrders } from "../utils/Fetches";

const OrderList = () => {
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const fetchOrders = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const data = await getOrders(token);
                console.log(data.order_list);
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="cart-container">
            <h2>Previous orders</h2>
            {orders.order_list.length === 0 ? (
                <p>You didn't order anything yet</p>
            ) : (
                getOrderItems(orders.order_list)
            )}
        </div>
    );
};

export default OrderList;
