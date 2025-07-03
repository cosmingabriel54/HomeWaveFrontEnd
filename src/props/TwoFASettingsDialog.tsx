import { useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/TwoFASettingsDialog.css";

const TwoFASettingsDialog = ({ onClose }: { onClose: () => void }) => {
    const { t } = useTranslation();
    const [enabled, setEnabled] = useState(localStorage.getItem("twofa_enabled") === "true");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleEnable = () => {
        localStorage.setItem("twofa_enabled", "true");
        setEnabled(true);
        onClose();
    };

    const confirmDisable = () => {
        setShowConfirmDialog(true);
    };

    const handleDisable = () => {
        localStorage.setItem("twofa_enabled", "false");
        setEnabled(false);
        setShowConfirmDialog(false);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content twofa-dialog">
                <h3 className="twofa-title">{t("twofa.title")}</h3>
                <p className="twofa-desc">{t("twofa.description")}</p>

                <div className="twofa-actions">
                    <button
                        className={`twofa-btn ${enabled ? "selected" : ""}`}
                        onClick={handleEnable}
                    >
                        {t("twofa.enable")}
                    </button>
                    <button
                        className={`twofa-btn ${!enabled ? "selected" : "inactive"}`}
                        onClick={confirmDisable}
                    >
                        {t("twofa.disable")}
                    </button>
                </div>

                <button className="close-btn" onClick={onClose}>
                    {t("twofa.close")}
                </button>
            </div>

            {showConfirmDialog && (
                <div className="modal-overlay confirm-dialog">
                    <div className="modal-content confirm-box">
                        <p className="confirm-text">{t("twofa.disable_confirmation")}</p>
                        <div className="confirm-actions">
                            <button className="confirm-cancel" onClick={() => setShowConfirmDialog(false)}>
                                {t("house.cancel")}
                            </button>
                            <button className="confirm-disable" onClick={handleDisable}>
                                {t("twofa.disable")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TwoFASettingsDialog;
