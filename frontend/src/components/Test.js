import React, { useEffect, useState } from "react";

const Test = () => {
    const [error, setError] = useState(null);

    const token = localStorage.getItem("authToken");
    if (!token) {
        setError("User is not authenticated");
        return;
    }

    const update_product = async (product) => {
        product["name"] = "Dry Cat Food Upd2.0";
        console.log("my log upd");
        console.log(product);
        const response = await fetch("/product", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(product),
        });

        if (!response.ok) {
            throw new Error("Failed to update profile");
        }
    };

    const createOrder = async (userId) => {
        const response = await fetch(`/order/create/${userId}`, {
            method: "POST",
        });
        if (!response.ok) {
            const errorDetails = await response.text(); // Получаем текст ошибки
            throw new Error(`Failed to create order: ${errorDetails}`);
        }
        return await response.json();
    };
    

    const getOrders = async () => {
        const response = await fetch(`/orders`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = response.json();
        console.log(data);

        if (!response.ok) {
            throw new Error("Failed to get product");
        }
    };

    const insertProduct = async (product) => {
        product["name"] = "Dry Cat Food NEW!!";
        console.log(product);
        const response = await fetch(`/product/insert`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(product),
        });
        if (!response.ok) {
            throw new Error("Failed to get product");
        }
    };

    useEffect(() => {
        const fetchAndUpdateProduct = async () => {
            try {
                getOrders();
            } catch (error) {
                console.error("Error in fetching or updating product:", error);
            }
        };

        fetchAndUpdateProduct();
    }, []);
};

export default Test;
