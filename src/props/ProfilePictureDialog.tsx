import React, { useState } from "react";
import Modal from "react-modal";
import "../styles/ProfilePictureDialog.css";
import { useTranslation } from "react-i18next";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => void;
    currentImage?: string;
}

const ProfilePictureDialog: React.FC<Props> = ({ isOpen, onClose, onUpload, currentImage }) => {
    const [error, setError] = useState("");
    const { t } = useTranslation();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Only image files are allowed.");
            return;
        }

        setError("");
        onUpload(file);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false} className="modal" overlayClassName="overlay">
            <h2>{t("profilePictureDialog.title")}</h2>
            {currentImage ? <img src={currentImage} alt="Profile" style={{ width: 100, height: 100, borderRadius: "50%", marginBottom: 16 }} /> :
                <p>{t("profilePictureDialog.noPicture")}</p>}
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
            />

            {error && <p style={{color: "red"}}>{error}</p>}

            <div style={{marginTop: 16}}>
                <button className="cancel-btn" onClick={onClose}>
                    {t("profilePictureDialog.cancel")}
                </button>
            </div>

        </Modal>
    );
};

export default ProfilePictureDialog;
