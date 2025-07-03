import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/TwoFAVerificationScreen.css";
import { useTranslation } from "react-i18next";

const BASE_URL = "https://backendapi.ctce.ro/apicosmin";

const Verify2FAScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const uuid = location.state?.uuid;
    const [code, setCode] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("your email");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEmail = async () => {
            const res = await axios.post(`${BASE_URL}/userinfo?uuid=${uuid}`);
            const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
            const email = data.email;
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
                setError(t("twofa.invalidCode"));
                setCode("");
            }
        } catch {
            setError(t("twofa.invalidCode"));
        }
    };

    return (
        <div className="twofa-container">
            <h2 className="twofa-title">{t("twofa.verificationTitle")}</h2>
            <p className="twofa-instruction">
                {t("twofa.codeSentTo")} <span className="twofa-email">{maskedEmail}</span>
            </p>

            <input
                className="twofa-input"
                type="text"
                value={code}
                onChange={(e) => {
                    setCode(e.target.value);
                    setError("");
                }}
                maxLength={6}
                placeholder={t("twofa.codePlaceholder")}
            />
            <button className="twofa-button" onClick={handleVerify}>
                {t("twofa.verify")}
            </button>
            {error && <p className="twofa-error">{error}</p>}
        </div>
    );
};

export default Verify2FAScreen;
