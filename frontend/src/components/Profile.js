import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../utils/Fetches";
import { FaEdit } from "react-icons/fa";
import { Alert } from "./Alert";
import "../assets/styles/Profile.css";
import { useNavigate } from "react-router-dom";
import OrderList from "./OrderList";

const Profile = () => {
    const [profile, setProfile] = useState({
        full_name: null,
        phone: null,
        email: "",
        birthday: null,
        city: null,
        street: null,
        house: null,
        building: null,
        entrance: null,
        apartment: null,
        floor: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState({
        full_name: false,
        phone: false,
        email: false,
        birthday: false,
        address: false,
    });
    const [alertMessage, setAlertMessage] = useState("");
    const navigate = useNavigate();
    const handleAlertClose = () => setAlertMessage("");

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/");
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getProfile(token);
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (field) => {
        setEditing((prev) => ({ ...prev, [field]: true }));
    };

    const closeEdit = (field) => {
        setEditing((prev) => ({ ...prev, [field]: false }));
    };

    const handleChange = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        try {
            await updateProfile(token, profile);
            setAlertMessage("Profile updated successfully");
        } catch (err) {
            setError("Error updating profile: " + err.message);
        } finally {
            setLoading(false);
        }
        closeEdit("full_name");
        closeEdit("phone");
        closeEdit("email");
        closeEdit("birthday");
        closeEdit("address");
    };

    const renderAddress = () => {
        const { city, street, house, building, entrance, apartment, floor } =
            profile;
        return `${city || "-"} ${street || "-"} ${house || "-"} ${
            building || "-"
        } ${entrance || "-"} ${apartment || "-"} ${floor || "-"}`.trim();
    };

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div>
            <h2>Your Profile</h2>
            <div className="profile-container">
                <div className="profile-field">
                    <label>Name</label>
                    <div className="field-container">
                        {editing.full_name ? (
                            <input
                                type="text"
                                value={profile.full_name || ""}
                                onChange={(e) =>
                                    handleChange("full_name", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.full_name || "No name provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("full_name")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Phone</label>
                    <div className="field-container">
                        {editing.phone ? (
                            <input
                                type="text"
                                value={profile.phone || ""}
                                onChange={(e) =>
                                    handleChange("phone", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.phone || "No phone number provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("phone")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Email</label>
                    <div className="field-container">
                        <span>{profile.email || "No email provided"}</span>
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("email")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Birthday</label>
                    <div className="field-container">
                        {editing.birthday ? (
                            <input
                                type="date"
                                value={profile.birthday || ""}
                                onChange={(e) =>
                                    handleChange("birthday", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.birthday || "No birthday provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("birthday")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Address</label>
                    <div className="field-container">
                        {editing.address ? (
                            <>
                                <input
                                    type="text"
                                    value={profile.city || ""}
                                    onChange={(e) =>
                                        handleChange("city", e.target.value)
                                    }
                                    placeholder="City"
                                />
                                <input
                                    type="text"
                                    value={profile.street || ""}
                                    onChange={(e) =>
                                        handleChange("street", e.target.value)
                                    }
                                    placeholder="Street"
                                />
                                <input
                                    type="text"
                                    value={profile.house || ""}
                                    onChange={(e) =>
                                        handleChange("house", e.target.value)
                                    }
                                    placeholder="House"
                                />
                                <input
                                    type="text"
                                    value={profile.building || ""}
                                    onChange={(e) =>
                                        handleChange("building", e.target.value)
                                    }
                                    placeholder="Building"
                                />
                                <input
                                    type="text"
                                    value={profile.entrance || ""}
                                    onChange={(e) =>
                                        handleChange("entrance", e.target.value)
                                    }
                                    placeholder="Entrance"
                                />
                                <input
                                    type="text"
                                    value={profile.apartment || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "apartment",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Apartment"
                                />
                                <input
                                    type="text"
                                    value={profile.floor || ""}
                                    onChange={(e) =>
                                        handleChange("floor", e.target.value)
                                    }
                                    placeholder="Floor"
                                />
                            </>
                        ) : (
                            <span>{renderAddress()}</span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("address")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="submit-container">
                    <button onClick={handleSubmit}>Submit</button>
                </div>

                {alertMessage !== "" && (
                    <Alert message={alertMessage} onClose={handleAlertClose} />
                )}
            </div>
            <OrderList />
        </div>
    );
};

export default Profile;
