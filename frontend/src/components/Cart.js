import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCartItems } from "../utils/CartUtils";
import { deleteCartItem, getCart, postOrder } from "../utils/Fetches";
import { Alert } from "./Alert";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState("");

    const handleAlertClose = () => setAlertMessage("");

    const fetchCartData = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/");
            return;
        }

        try {
            await getCart(token, setCartItems);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartData();
    }, []);

    const removeCartItem = async (itemId) => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/");
        }
        try {
            console.log(itemId);
            await deleteCartItem(token, itemId, setCartItems);
            await fetchCartData();
        } catch (err) {
            setAlertMessage(err.message);
        }
    };

    const submitOrder = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/");
        }
        try {
            await postOrder(token);
            setAlertMessage("Order was created. Check your profile");
            getCart(token, setCartItems);
        } catch (error) {
            setAlertMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="cart-container">
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
                <p className="empty">Your cart is empty</p>
            ) : (
                <div>
                    {getCartItems(cartItems, removeCartItem, navigate)}
                    <button onClick={() => submitOrder()}>Submit order</button>
                </div>
            )}
            {alertMessage !== "" && (
                <Alert message={alertMessage} onClose={handleAlertClose} />
            )}
        </div>
    );
};

export default Cart;
