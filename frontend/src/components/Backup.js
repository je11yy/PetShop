import "../assets/styles/ProductPage.css";
import React, { useEffect, useState } from "react";
import { getBackups, postBackup } from "../utils/Fetches";

const Backup = () => {
    const [backUps, setBackUps] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBackUps = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const data = await getBackups(token);
                setBackUps(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBackUps();
    }, []);

    const handleClick = async (filename) => {
        try {
            const token = localStorage.getItem("authToken");
            await postBackup(token, filename);
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) {
        return <p className="error">{error}</p>;
    }

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    return (
        <div className="product-page">
            {backUps.backup_names_list.map((backUp) => {
                return (
                    <button onClick={() => handleClick(backUp)}>
                        {backUp}
                    </button>
                );
            })}

            {backUps.length === 0 && (
                <p className="no-products">No backups available</p>
            )}
        </div>
    );
};

export default Backup;
