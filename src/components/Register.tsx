import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/Login.css";
import { useTranslation } from "react-i18next";

const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        setIsButtonEnabled(
            username.trim() !== "" &&
            email.trim() !== "" &&
            phoneNumber.trim() !== "" &&
            password.trim() !== ""
        );
    }, [username, email, phoneNumber, password]);

    const handleRegister = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        const success = await registerUser({
            username,
            email,
            phoneNumber,
            password,
        });

        setIsLoading(false);
        if (success) {
            navigate("/login");
        } else {
            setErrorMessage("Registration failed. Please check your inputs.");
        }
    };

    return (
        <div className="login-container">
            <h1 className="title">{t("register.title")}</h1>
            <p className="subtitle">{t("register.subtitle")}</p>

            {errorMessage && <div className="error-message">{t(errorMessage)}</div>}


            <input
                type="text"
                placeholder={t("register.username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="email"
                placeholder={t("register.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="tel"
                placeholder={t("register.phone")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
                type="password"
                placeholder={t("register.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />


            <button
                onClick={handleRegister}
                disabled={!isButtonEnabled || isLoading}
                className={`login-btn ${isButtonEnabled ? "enabled" : ""}`}
            >
                {isLoading ? t("register.loading") : t("register.button")}
            </button>


            <p className="signup-prompt">
                {t("register.loginPrompt")}{" "}
                <span onClick={() => navigate("/login")} className="signup-link">
                    {t("register.loginLink")}
                </span>
            </p>

        </div>
    );
};

export default Register;
