import React from "react";
import { FaBox } from "react-icons/fa";

export const getProductItems = (
    products,
    handleAddToCart,
    handleCardClick,
    userType
) => {
    return (
        <div className="product-items">
            {products.map((product) => (
                <div className="product-card" key={product.name}>
                    <img
                        src={`data:image/png;base64,${product.image}`}
                        alt={"Product image"}
                        className="product-image"
                    />
                    <h4
                        className="product-name"
                        onClick={() => handleCardClick(product.id)}
                        style={{ cursor: "pointer" }}
                    >
                        {product.name}
                    </h4>
                    <p>{product.description}</p>
                    <div className="price-quantity-container">
                        <p className="price">Price: ${product.price}</p>
                        <p className="quantity">
                            In stock: {product.quantity} <FaBox />
                        </p>
                    </div>
                    {product.quantity !== 0 ? (
                        userType !== "seller" && (
                            <button onClick={() => handleAddToCart(product.id)}>
                                Add to Cart
                            </button>
                        )
                    ) : (
                        <div>
                            {userType !== "seller" && (
                                <p className="out-of-stock">Out of stock</p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const getCategory = (
    category,
    handleAddToCart,
    handleCardClick,
    userType
) => {
    return (
        category.products &&
        category.products.length > 0 && (
            <div className="category" key={category.name}>
                <h3 className="category-title">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                {getProductItems(
                    category.products,
                    handleAddToCart,
                    handleCardClick,
                    userType
                )}
            </div>
        )
    );
};
