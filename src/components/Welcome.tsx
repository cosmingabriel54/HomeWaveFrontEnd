import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "../styles/Welcome.css";
import houseImage from '../assets/house.jpg';
import { useTranslation } from "react-i18next";

const Welcome = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="welcome-container">
            <div className="welcome-image-section">
                <img src={houseImage} alt="Smart House" className="welcome-image" />
            </div>

            <div className="welcome-content">
                <h1 className="welcome-title">
                    {t("welcome.titleLine1")}<br/>{t("welcome.titleLine2")}
                </h1>

                <button className="start-btn" onClick={() => navigate("/login")}>
                    {t("welcome.start")}
                </button>

                <div className="register-prompt">
                    <span className="register-text">{t("welcome.noAccount")}</span>
                    <button className="register-link" onClick={() => navigate("/register")}>
                        {t("welcome.register")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
