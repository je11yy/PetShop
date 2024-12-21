import React, { useState, useEffect } from "react";
import "../assets/styles/Alert.css";

export const Alert = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="alert-popup">
            <p>{message}</p>
        </div>
    );
};
