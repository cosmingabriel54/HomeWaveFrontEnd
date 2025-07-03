import "../styles/Modal.css";
import { useTranslation } from "react-i18next";
interface Props {
    mac: string;
    room: string;
    onClose: () => void;
    onDelete: (mac: string) => void;
    onGraph: (mac: string) => void;
}

const LightControlModal = ({ mac, room, onClose, onDelete }: Props) => {
    const { t } = useTranslation();
    const handleDeleteClick = () => {
        if (window.confirm(t("modal.confirmDeleteMessage"))) {
            onDelete(mac);
        }
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{`${t("modal.title")} - ${room}`}</h2>
                <div className="modal-actions">
                    <button onClick={handleDeleteClick} className="danger">{t("modal.delete")}</button>
                </div>
                <button className="modal-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

export default LightControlModal;
