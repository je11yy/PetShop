import React from "react";
import "../../assets/styles/Login.css";
import SellerLoginForm from "./SellerLoginForm";

const SellerLogin = () => {
    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Welcome Back</h2>
                <SellerLoginForm />
            </div>
        </div>
    );
};

export default SellerLogin;
