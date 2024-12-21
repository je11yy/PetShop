import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
    FaPaw,
    FaSignInAlt,
    FaHome,
    FaSignOutAlt,
    FaShoppingCart,
    FaUser,
    FaArrowRight,
} from "react-icons/fa";
import { MdOutlineBackup } from "react-icons/md";
import { backup } from "../utils/Fetches";

export const getNavigateMenu = () => {
    const { isAuthenticated, logout, userType } = useAuth();
    const [error, setError] = useState(null);

    const doBackUp = async () => {
        try {
            const token = localStorage.getItem("authToken");
            await backup(token);
        } catch (error) {
            setError(error.message);
        }
    };

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <nav className="app-nav">
            <Link to="/test" className="nav-link">
                TEST
            </Link>
            <Link to="/" className="nav-link">
                <FaHome /> Home
            </Link>
            <Link to="/products" className="nav-link">
                <FaPaw /> Products
            </Link>
            {isAuthenticated && userType == "customer" && (
                <Link to="/cart" className="nav-link">
                    <FaShoppingCart /> Cart
                </Link>
            )}
            {isAuthenticated && userType == "customer" && (
                <Link to="/profile" className="nav-link">
                    <FaUser /> Profile
                </Link>
            )}
            {isAuthenticated && userType == "seller" && (
                <Link to="/new_product" className="nav-link">
                    <FaArrowRight /> Create product
                </Link>
            )}
            {isAuthenticated && userType == "seller" && (
                <Link to="/backups" className="nav-link">
                    <MdOutlineBackup /> BackUps
                </Link>
            )}
            {isAuthenticated && userType == "seller" && (
                <Link to="#" className="nav-link" onClick={() => doBackUp()}>
                    <MdOutlineBackup /> Do BackUp
                </Link>
            )}
            {!isAuthenticated && (
                <Link to="/login" className="nav-link">
                    <FaSignInAlt /> Login
                </Link>
            )}
            {isAuthenticated && (
                <Link to="#" className="nav-link" onClick={logout}>
                    <FaSignOutAlt /> Logout
                </Link>
            )}
        </nav>
    );
};
