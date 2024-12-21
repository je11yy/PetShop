import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postLogin } from "../../utils/Fetches";
import { useAuth } from "../../contexts/AuthContext";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await postLogin(login, navigate, email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        navigate("/register");
    };

    const handleSellerLogin = () => {
        navigate("/seller/login");
    };

    return (
        <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            {error && <p className="error">{error}</p>}
            {loading && <p className="loading">Loading...</p>}
            <button type="submit" className="login-button">
                Login
            </button>
            <button
                type="button"
                className="login-button"
                onClick={handleSellerLogin}
            >
                Login as seller
            </button>
            <button
                type="button"
                className="login-button"
                onClick={handleRegister}
            >
                Register
            </button>
        </form>
    );
};

export default LoginForm;
