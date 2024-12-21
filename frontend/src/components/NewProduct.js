import "../assets/styles/ProductPage.css";
import { Alert } from "./Alert";
import { addProduct } from "../utils/Fetches";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NewProduct = () => {
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category_name: "",
        category_description: "",
        image: null,
    });
    const [alertMessage, setAlertMessage] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { userType } = useAuth();

    const handleAlertClose = () => setAlertMessage("");

    if (userType != "seller") {
        navigate("/");
    }

    const handleSubmit = async () => {
        setLoading(true);
        if (
            !product.name ||
            !product.description ||
            !product.price ||
            !product.quantity ||
            !product.category_name ||
            !product.image
        ) {
            setError(
                "All fields (excepting category description) must be filled."
            );
            setLoading(false);
            return;
        }
        if (product.quantity < 0 || product.price < 0) {
            setError("Product quantity and product price can't be below zero");
            setLoading(false);
            return;
        }
        setError(null);
        const token = localStorage.getItem("authToken");
        try {
            await addProduct(token, product);
            setAlertMessage("Product updated successfully");
            navigate("/products");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setProduct((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Закодировать файл в base64
                const imageBase64 = reader.result.split(",")[1]; // Убираем префикс "data:image/*;base64,"
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    image: imageBase64,
                }));
            };
            reader.onerror = () => setError("Error reading file.");
            reader.readAsDataURL(file); // Преобразуем файл в ArrayBuffer
        }
    };

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    return (
        <div className="product-page">
            <div className="product-card">
                <input
                    type="text"
                    value={product.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter product name"
                />
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
                {product.image && <p className="file-name">File selected</p>}
                <input
                    type="text"
                    value={product.description || ""}
                    onChange={(e) =>
                        handleChange("description", e.target.value)
                    }
                    placeholder="Enter product description"
                />
                <input
                    type="number"
                    value={product.quantity || ""}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    min="1"
                    step="1"
                    placeholder="Enter quantity"
                />
                <input
                    type="number"
                    value={product.price || ""}
                    onChange={(e) => handleChange("price", e.target.value)}
                    min="0.01"
                    step="0.01"
                    placeholder="Enter price (e.g., 0.00)"
                />
                <input
                    type="text"
                    value={product.category_name || ""}
                    onChange={(e) =>
                        handleChange("category_name", e.target.value)
                    }
                    placeholder="Enter category name"
                />
                <input
                    type="text"
                    value={product.category_description || ""}
                    onChange={(e) =>
                        handleChange("category_description", e.target.value)
                    }
                    placeholder="Enter category description (optional)"
                />
                {error && <p className="error">{error}</p>}
                <button onClick={handleSubmit}>Submit</button>
                {alertMessage !== "" && (
                    <Alert message={alertMessage} onClose={handleAlertClose} />
                )}
            </div>
        </div>
    );
};

export default NewProduct;
