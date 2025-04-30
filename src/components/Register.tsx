import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/Login.css";

const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            <h1 className="title">Hi, Welcome!</h1>
            <p className="subtitle">Please sign up to continue.</p>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                onClick={handleRegister}
                disabled={!isButtonEnabled || isLoading}
                className={`login-btn ${isButtonEnabled ? "enabled" : ""}`}
            >
                {isLoading ? "Registering..." : "Register"}
            </button>

            <p className="signup-prompt">
                Already have an account?{" "}
                <span onClick={() => navigate("/login")} className="signup-link">
          Login
        </span>
            </p>
        </div>
    );
};

export default Register;
