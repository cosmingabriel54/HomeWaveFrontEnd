// TwoFASettingsDialog.tsx
import { useState } from "react";

const TwoFASettingsDialog = ({ onClose }: { onClose: () => void }) => {
    const [enabled, setEnabled] = useState(localStorage.getItem("twofa_enabled") === "true");

    const handleEnable = () => {
        localStorage.setItem("twofa_enabled", "true");
        setEnabled(true);
        onClose();
    };

    const handleDisable = () => {
        const confirmed = window.confirm("Are you sure you want to disable 2FA?");
        if (confirmed) {
            localStorage.setItem("twofa_enabled", "false");
            setEnabled(false);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Two-Factor Authentication</h3>
                <p>Secure your account by enabling 2FA</p>
                <div>
                    <label>
                        <input type="radio" checked={enabled} onChange={handleEnable} />
                        Enable 2FA
                    </label>
                    <br />
                    <label>
                        <input type="radio" checked={!enabled} onChange={handleDisable} />
                        Disable 2FA
                    </label>
                </div>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default TwoFASettingsDialog;
