import "../assets/styles/ProductPage.css";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from "./Alert";
import {
    postCart,
    getProduct,
    deleteProduct,
    updateProduct,
} from "../utils/Fetches";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaEdit, FaBox, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Product = () => {
    const { productId } = useParams();
    const { isAuthenticated, userType } = useAuth();
    const [product, setProduct] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const navigate = useNavigate();

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
            setError(error.message);
        }
    };

    const fetchProduct = async (productId) => {
        setLoading(true);
        try {
            const data = await getProduct(productId);
            setProduct(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const removeProduct = async (productId) => {
        setLoading(true);
        try {
            await deleteProduct(productId);
            navigate("/products");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        try {
            await updateProduct(token, product);
            setAlertMessage("Product updated successfully");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        setEditing(false);
    };

    const handleImageChange = (e) => {
        setImageLoading(true);
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageBase64 = reader.result.split(",")[1];
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    image: imageBase64,
                }));
            };
            reader.onerror = () => setError("Error reading file.");
            reader.readAsDataURL(file);
        }
        setImageLoading(false);
    };

    const handleChange = (field, value) => {
        setProduct((prev) => ({ ...prev, [field]: value }));
    };

    const handleEdit = () => {
        setEditing(true);
    };

    useEffect(() => {
        fetchProduct(productId);
    }, []);

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="product-page">
            <div className="product-card">
                {userType === "seller" && editing ? (
                    <div>
                        <input
                            type="file"
                            id="file"
                            className="file-input"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="file" className="file-label">
                            {product.image ? "Change photo" : "Choose a photo"}
                        </label>
                        {product.image && (
                            <p className="file-name">File selected</p>
                        )}
                    </div>
                ) : (
                    <img
                        src={`data:image/png;base64,${product.image}`}
                        alt={"Product image"}
                        className="product-image"
                    />
                )}
                {imageLoading && <p className="loading">Loading image...</p>}
                {userType === "seller" && editing ? (
                    <input
                        type="text"
                        value={product.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                ) : (
                    <h4 className="product-name">{product.name}</h4>
                )}
                {userType === "seller" && editing ? (
                    <input
                        type="text"
                        value={product.description || ""}
                        onChange={(e) =>
                            handleChange("description", e.target.value)
                        }
                    />
                ) : (
                    <p>{product.description}</p>
                )}
                {userType === "seller" && editing ? (
                    <input
                        type="text"
                        value={product.price || ""}
                        onChange={(e) => handleChange("price", e.target.value)}
                    />
                ) : (
                    <p className="price">Price: ${product.price}</p>
                )}
                {userType === "seller" && editing ? (
                    <input
                        type="text"
                        value={product.quantity || ""}
                        onChange={(e) =>
                            handleChange("quantity", e.target.value)
                        }
                    />
                ) : (
                    <p className="quantity">
                        In stock: {product.quantity} <FaBox />
                    </p>
                )}
                {product.quantity !== 0 ? (
                    userType !== "seller" && (
                        <button onClick={() => handleAddToCart(product.id)}>
                            Add to Cart
                        </button>
                    )
                ) : (
                    <div>
                        {userType !== "seller" && (
                            <p className="out-of-stock">Out of stock</p>
                        )}
                    </div>
                )}
                <div className="button-container">
                    {userType == "seller" && !editing && (
                        <button onClick={() => handleEdit()}>
                            <FaEdit /> Edit
                        </button>
                    )}
                    {userType == "seller" && editing && (
                        <button onClick={handleSubmit}>Submit</button>
                    )}
                    {userType == "seller" && (
                        <button
                            className="seller-button"
                            onClick={() => removeProduct(product.id)}
                        >
                            <FaTrash /> Delete
                        </button>
                    )}
                    {alertMessage !== "" && (
                        <Alert
                            message={alertMessage}
                            onClose={handleAlertClose}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Product;
