import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "../services/authService";
import "../styles/Login.css";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSend = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const uuid = await sendPasswordResetEmail(email.trim());

            setIsLoading(false);

            if (uuid) {
                // Store UUID and navigate to verification screen
                navigate("/verify-code", { state: { uuid } });
            } else {
                setErrorMessage("Email not found or failed to send reset code.");
            }
        } catch (e) {
            setIsLoading(false);
            setErrorMessage("Something went wrong.");
        }
    };

    return (
        <div className="login-container">
            <h1 className="title">{t("auth.forgotPassword")}</h1>
            <p className="subtitle">{t("auth.enterEmailInstruction")}</p>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            {errorMessage && <div className="error-message">{t(errorMessage)}</div>}

            <button
                onClick={handleSend}
                disabled={!email.trim() || isLoading}
                className={`login-btn ${email.trim() ? "enabled" : ""}`}
            >
                {isLoading ? t("auth.sending") : t("auth.sendCode")}
            </button>
        </div>
    );
};

export default ForgotPassword;
