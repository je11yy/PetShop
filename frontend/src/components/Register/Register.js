import React from "react";
import "../../assets/styles/Register.css";
import RegisterForm from "./RegisterForm";

const Register = () => {
    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Create an Account</h2>
                <RegisterForm />
            </div>
        </div>
    );
};

export default Register;
