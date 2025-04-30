import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "../styles/Welcome.css";
import houseImage from '../assets/house.jpg';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-image-section">
                <img src={houseImage} alt="Smart House" className="welcome-image" />
            </div>

            <div className="welcome-content">
                <h1 className="welcome-title">Welcome to<br />HomeWave</h1>

                <button className="start-btn" onClick={() => navigate("/login")}>
                    Let’s start
                </button>

                <div className="register-prompt">
                    <span>Don't have an account?</span>
                    <button className="register-link" onClick={() => navigate("/register")}>
                        Register now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
