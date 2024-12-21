import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postSellerLogin } from "../../utils/Fetches";
import { useAuth } from "../../contexts/AuthContext";

const LoginForm = () => {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await postSellerLogin(login, navigate, nickname, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
                <label htmlFor="nickname">Nickname</label>
                <input
                    type="nickname"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
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
        </form>
    );
};

export default LoginForm;
