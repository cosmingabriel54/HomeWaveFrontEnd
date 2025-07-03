import "../styles/Modal.css";
import { useTranslation } from "react-i18next";
import {Lock,Unlock} from "lucide-react";

interface Props {
    mac: string;
    room: string;
    isLocked: boolean;
    onClose: () => void;
    onToggle: (mac: string, newStatus: boolean) => void;
    onDelete: (mac: string) => void;
}

const LockControlModal = ({ mac, room, isLocked, onClose, onToggle, onDelete }: Props) => {
    const { t } = useTranslation();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{`${t("modal.lockControl")} - ${room}`}</h2>
                <div className="modal-icon">
                    {isLocked ? <Lock size={64} color="red" /> : <Unlock size={64} color="green" />}
                </div>
                <div className="modal-actions">
                    <button onClick={() => onToggle(mac, !isLocked)}>
                        {isLocked ? t("modal.unlock") : t("modal.lock")}
                    </button>
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

export default LockControlModal;
