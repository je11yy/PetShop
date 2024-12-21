import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(null);
    const navigate = useNavigate();
    const [wasLogout, setWasLogout] = useState(false);

    const login = (token, type) => {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userType", type);
        setUserType(type);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userType");
        setUserType(null);
        setIsAuthenticated(false);
        setWasLogout(true);
    };

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const savedUserType = localStorage.getItem("userType");
        setIsAuthenticated(token !== null);
        setUserType(savedUserType);
    }, []);

    useEffect(() => {
        if (wasLogout) {
            console.log("Navigating to home...");
            navigate("/");
            setWasLogout(false);
        }
    }, [wasLogout, navigate]);

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, userType, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
