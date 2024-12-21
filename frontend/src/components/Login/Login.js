import React from "react";
import "../../assets/styles/Login.css";
import LoginForm from "./LoginForm";

const Login = () => {
    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Welcome Back</h2>
                <LoginForm />
            </div>
        </div>
    );
};

export default Login;
