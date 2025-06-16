import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import "../styles/InviteUserDialog.css";
import { useTranslation } from "react-i18next";

interface InviteUserDialogProps {
    uuid: string;
    baseUrl: string;
    isOpen: boolean;
    onClose: () => void;
}

interface House {
    houseId: number;
    houseName: string;
}

const InviteUserDialog: React.FC<InviteUserDialogProps> = ({ uuid, baseUrl, isOpen, onClose }) => {
    const [houses, setHouses] = useState<House[]>([]);
    const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (!isOpen) return;

        const fetchHouses = async () => {
            try {
                const response = await axios.get(`${baseUrl}/home/getHouses?uuid=${uuid}`);
                setHouses(response.data.homes);
            } catch (err) {
                console.error("Failed to fetch houses", err);
                setHouses([]);
            }
        };

        fetchHouses();
    }, [isOpen, uuid, baseUrl]);

    const generateInviteCode = async () => {
        if (!selectedHouseId) return;

        try {
            const response = await axios.get(`${baseUrl}/getusercode?houseid=${selectedHouseId}`);
            if (response.status === 200 && response.data) {
                setInviteCode(response.data);
            } else {
                alert("Failed to generate invite token.");
            }
        } catch (err) {
            console.error("Error generating invite code", err);
            alert("Error generating invite code.");
        }
    };

    const handleClose = () => {
        setSelectedHouseId(null);
        setInviteCode(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            className="modal"
            overlayClassName="overlay"
            ariaHideApp={false}
        >
            <h2>{t("inviteDialog.selectHouse")}</h2>
            <select
                value={selectedHouseId ?? ""}
                onChange={(e) => setSelectedHouseId(e.target.value)}
                className="dropdown-select"
            >
                <option value="" disabled>{t("inviteDialog.selectPlaceholder")}</option>
                {houses.map((house) => (
                    <option key={house.houseId} value={house.houseId}>
                        {house.houseName}
                    </option>
                ))}
            </select>

            <div className="dialog-actions">
                <button onClick={handleClose}>{t("inviteDialog.cancel")}</button>
                <button onClick={generateInviteCode} disabled={!selectedHouseId}>
                    {t("inviteDialog.generate")}
                </button>
            </div>

            {inviteCode && (
                <div className="invite-code">
                    <strong>{t("inviteDialog.codeTitle")}</strong>
                    <pre>{inviteCode}</pre>
                    <p>{t("inviteDialog.codeNote")}</p>
                </div>
            )}
        </Modal>
    );
};

export default InviteUserDialog;
