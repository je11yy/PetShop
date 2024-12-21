export const postRegister = async (
    login,
    navigate,
    email,
    password,
    setSuccess
) => {
    const response = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        setSuccess("Registration successful! You can now log in.");
        await postLogin(login, navigate, email, password);
    } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to register";
        throw new Error(errorMessage);
    }
};

export const postLogin = async (login, navigate, email, password) => {
    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        const data = await response.json();
        login(data.token, "customer");
        navigate("/products");
    } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to login";
        throw new Error(errorMessage);
    }
};

export const postSellerLogin = async (login, navigate, nickname, password) => {
    const seller = JSON.stringify({ nickname: nickname, password: password });
    const response = await fetch("/seller/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: seller,
    });

    if (response.ok) {
        const data = await response.json();
        login(data.token, "seller");
        navigate("/products");
        navigate("/products");
    } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get login";
        throw new Error(errorMessage);
    }
};

export const postCart = async (productId, token) => {
    const response = await fetch(`/cart/${productId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
            errorData.detail || "Failed to add product to cart";
        throw new Error(errorMessage);
    }
};

export const postOrder = async (token) => {
    const response = await fetch(`/order/create`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to create order";
        throw new Error(errorMessage);
    }
};

export const getOrders = async (token) => {
    const response = await fetch("/orders", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get orders data";
        throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
};

export const deleteCartItem = async (token, itemId, setCartItems) => {
    console.log(itemId);
    const response = await fetch(`/cart/${itemId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
            errorData.detail || "Failed to remove product from cart";
        throw new Error(errorMessage);
    }

    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
};

export const getCart = async (token, setCartItems) => {
    const response = await fetch("/cart", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get cart data";
        throw new Error(errorMessage);
    }
    const data = await response.json();
    setCartItems(data.cart);
};

export const getProducts = async (setProducts) => {
    const response = await fetch("/products");
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get products";
        throw new Error(errorMessage);
    }
    const data = await response.json();
    setProducts(data);
};

export const getProduct = async (productId) => {
    const response = await fetch(`/product/${productId}`, {
        method: "GET",
    });
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get product";
        throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
};

export const deleteProduct = async (productId) => {
    console.log(productId);
    console.log(productId);
    const response = await fetch(`/product/${productId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get delete product";
        throw new Error(errorMessage);
    }
};

export const getProfile = async (token) => {
    const response = await fetch("/customer", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get profile";
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
};

export const updateProfile = async (token, profile) => {
    const response = await fetch("/customer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get update profile";
        throw new Error(errorMessage);
    }
};

export const updateProduct = async (token, product) => {
    const response = await fetch("/product", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to update product";
        throw new Error(errorMessage);
    }
};

export const addProduct = async (token, product) => {
    const response = await fetch("/product/insert", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to add product";
        throw new Error(errorMessage);
    }
};

export const backup = async (token) => {
    const response = await fetch(`/backup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to backup";
        throw new Error(errorMessage);
    }
};

export const postBackup = async (token, filename) => {
    const response = await fetch(`/restore`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to backup";
        throw new Error(errorMessage);
    }
};

export const getBackups = async (token) => {
    const response = await fetch(`/backups`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get backups";
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
};
