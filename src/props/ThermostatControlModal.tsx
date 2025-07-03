import "../styles/Modal.css";
import { useTranslation } from "react-i18next";
import {Thermometer} from "lucide-react";

interface Props {
    mac: string;
    room: string;
    temperatureC: number;
    humidity: number;
    onClose: () => void;
    onDelete: (mac: string) => void;
}

const ThermostatControlModal = ({ mac, room, temperatureC, humidity, onClose, onDelete }: Props) => {
    const { t } = useTranslation();
    const temperatureF = (temperatureC * 9) / 5 + 32;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{`${t("modal.thermostat")} - ${room}`}</h2>
                <div className="modal-icon">
                    <Thermometer size={64} color="#ff5722" />
                </div>
                <p><strong>{temperatureC.toFixed(1)}°C / {temperatureF.toFixed(1)}°F</strong></p>
                <p>{humidity.toFixed(1)}% {t("modal.humidity")}</p>
                <div className="modal-actions">
                    <button className="danger" onClick={() => {
                        if (window.confirm(t("modal.confirmDeleteMessage"))) onDelete(mac);
                    }}>
                        {t("modal.delete")}
                    </button>
                </div>
                <button className="modal-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

export default ThermostatControlModal;
