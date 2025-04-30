import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "../styles/Login.css";

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
            <h1 className="title">Hi, Welcome!</h1>
            <p className="subtitle">Please sign in to continue.</p>

            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}

            <input
                type="text"
                placeholder="Username/Email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            <div className="password-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="toggle-password-btn"
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>

            <button
                onClick={handleLogin}
                disabled={!isButtonEnabled || isLoading}
                className={`login-btn ${isButtonEnabled ? "enabled" : ""}`}
            >
                {isLoading ? "Logging in..." : "Login"}
            </button>

            <p className="signup-prompt">
                Don’t have an account?{" "}
                <span onClick={() => navigate("/register")} className="signup-link">
          Sign up
        </span>
            </p>
        </div>
    );
};

export default Login;
