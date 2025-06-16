import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { code } = location.state as { code: string };

    const isButtonEnabled = password.trim().length >= 6;
    const { t } = useTranslation();
    const handleReset = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await axios.post(
                "https://backendapi.ctce.ro/apicosmin/resetPassword",
                {
                    code,
                    newPassword: password.trim(),
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            setIsLoading(false);

            if (response.status === 200) {
                navigate("/login");
            } else {
                setErrorMessage(response.data);
            }
        } catch (e) {
            setErrorMessage("An unexpected error occurred.");
            setIsLoading(false);
            console.error("Error details:", e);
        }
    };

    return (
        <div className="login-container">
            <h1 className="title">{t("resetPassword.title")}</h1>
            <p className="subtitle">{t("resetPassword.subtitle")}</p>

            <input
                type="password"
                placeholder={t("resetPassword.placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {errorMessage && <div className="error-message">{t("resetPassword.error")}</div>}

            <button
                onClick={handleReset}
                disabled={!isButtonEnabled || isLoading}
                className={`login-btn ${isButtonEnabled ? "enabled" : ""}`}
            >
                {isLoading ? t("resetPassword.resetting") : t("resetPassword.button")}
            </button>
        </div>
    );
};

export default ResetPassword;
