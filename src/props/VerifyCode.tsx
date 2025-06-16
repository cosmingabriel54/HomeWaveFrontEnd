import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

const VerifyCode = () => {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const uuid = localStorage.getItem("reset_uuid");
    const { t } = useTranslation();

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post("https://backendapi.ctce.ro/apicosmin/verifycode", {
                uuid,
                code,
            });

            if (response.status === 200) {
                localStorage.setItem("reset_code", code);
                navigate("/reset-password");
            } else {
                setError("verifyCode.error.invalid");
            }
        } catch (err) {
            console.error(err)
            setError("verifyCode.error.failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h1 className="title">{t("verifyCode.title")}</h1>
            <p className="subtitle">{t("verifyCode.subtitle")}</p>
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                placeholder={t("verifyCode.placeholder")}
            />
            {error && <div className="error-message">{t(error)}</div>}
            <button onClick={handleVerify} disabled={isLoading || code.length !== 6}>
                {isLoading ? t("verifyCode.verifying") : t("verifyCode.verify")}
            </button>
        </div>
    );
};

export default VerifyCode;
