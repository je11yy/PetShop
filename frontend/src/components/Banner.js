import React from "react";
import "../assets/styles/Banner.css";
import { FaPaw, FaSignInAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    if (!token) {
        return (
            <button
                onClick={() => navigate("/login")}
                className="banner-button"
            >
                <FaSignInAlt /> Login
            </button>
        );
    }
};

const Banner = () => {
    const navigate = useNavigate();
    return (
        <div className="banner">
            <div className="banner-content">
                <h1>Welcome to the PetShop</h1>
                <p>All for your pets in one place</p>
                <div className="banner-buttons">
                    <button
                        onClick={() => navigate("/products")}
                        className="banner-button"
                    >
                        <FaPaw /> See our products
                    </button>
                    <LoginButton />
                </div>
            </div>
        </div>
    );
};

export default Banner;
