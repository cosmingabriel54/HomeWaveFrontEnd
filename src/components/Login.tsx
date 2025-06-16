import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "../styles/Login.css";
import { useTranslation } from "react-i18next";

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const uuid = localStorage.getItem("uuid");
        if (uuid) {
            navigate("/main");
        }
    }, [navigate]);

    useEffect(() => {
        setIsButtonEnabled(usernameOrEmail.trim() !== "" && password.trim() !== "");
    }, [usernameOrEmail, password]);

    const handleLogin = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        const uuid = await login(usernameOrEmail, password);
        setIsLoading(false);

        if (uuid) {
            localStorage.setItem("uuid", uuid);
            navigate("/main");
        } else {
            setErrorMessage("Invalid username/email or password.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && isButtonEnabled && !isLoading) {
            handleLogin();
        }
    };

    return (
        <div className="login-container">
            <h1 className="title">{t("login.welcome")}</h1>
            <p className="subtitle">{t("login.subtitle")}</p>

            {errorMessage && (
                <div className="error-message">{t("login.error.invalid")}</div>
            )}

            <input
                type="text"
                placeholder={t("login.placeholder.username")}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            <div className="password-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.placeholder.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="toggle-password-btn"
                >
                    {showPassword ? t("login.button.hide") : t("login.button.show")}
                </button>
            </div>
            <p className="forgot-password" onClick={() => navigate("/forgot-password")}>
                {t("login.forgot")}
            </p>
            <button
                onClick={handleLogin}
                disabled={!isButtonEnabled || isLoading}
                className={`login-btn ${isButtonEnabled ? "enabled" : ""}`}
            >
                {isLoading ? t("login.loggingIn") : t("login.login")}
            </button>

            <p className="signup-prompt">
                {t("login.signup.prompt")}{" "}
                <span onClick={() => navigate("/register")} className="signup-link">
                    {t("login.signup.link")}
                </span>
            </p>
        </div>
    );
};

export default Login;
