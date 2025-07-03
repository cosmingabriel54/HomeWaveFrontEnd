// TwoFAVerificationScreen.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://backendapi.ctce.ro/apicosmin";

const Verify2FAScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const uuid = location.state?.uuid;
    const [code, setCode] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("your email");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEmail = async () => {
            const res = await axios.post(`${BASE_URL}/userinfo`, { uuid });
            const email = res.data.email;
            setMaskedEmail(maskEmail(email));
        };
        fetchEmail();
    }, [uuid]);

    const maskEmail = (email: string) => {
        const [user, domain] = email.split("@");
        const visible = user.slice(0, 2);
        const masked = "*".repeat(user.length - 2);
        return `${visible}${masked}@${domain}`;
    };

    const handleVerify = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/verifyfacode?code=${code}&uuid=${uuid}`);
            if (res.status === 200) {
                localStorage.setItem("uuid", uuid);
                navigate("/main");
            } else {
                setError("Invalid code");
                setCode("");
            }
        } catch {
            setError("Invalid code");
        }
    };

    return (
        <div className="verify-container">
            <h2>Verification Code</h2>
            <p>We sent a code to {maskedEmail}</p>
            <input
                type="text"
                value={code}
                onChange={(e) => {
                    setCode(e.target.value);
                    setError("");
                }}
                maxLength={6}
            />
            <button onClick={handleVerify}>Verify</button>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Verify2FAScreen;
