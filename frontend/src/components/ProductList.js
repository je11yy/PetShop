import "../assets/styles/ProductList.css";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from "./Alert";
import { postCart } from "../utils/Fetches";
import { getCategory } from "../utils/ProductListUtils";
import { getProducts } from "../utils/Fetches";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProductList = () => {
    const { isAuthenticated, userType } = useAuth();
    const [alertMessage, setAlertMessage] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const handleCardClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const categories = products?.categories || [];

    const handleAlertClose = () => setAlertMessage("");

    const handleAddToCart = async (productId) => {
        if (!isAuthenticated) {
            setAlertMessage(
                "You must be logged in to add products to the cart"
            );
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            setAlertMessage("User is not authenticated");
            return;
        }

        try {
            await postCart(productId, token);
            setAlertMessage("Product was added to cart");
        } catch (err) {
            setAlertMessage(err.message);
        }
    };

    const fetchProducts = async () => {
        try {
            await getProducts(setProducts);
        } catch (error) {
            setAlertMessage("Error fetching products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    return (
        <div className="product-list">
            {categories.map((category) => {
                return getCategory(
                    category,
                    handleAddToCart,
                    handleCardClick,
                    userType
                );
            })}

            {products.length === 0 && (
                <p className="no-products">No products available.</p>
            )}

            {alertMessage !== "" && (
                <Alert message={alertMessage} onClose={handleAlertClose} />
            )}
        </div>
    );
};

export default ProductList;
