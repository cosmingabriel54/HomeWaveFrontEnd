import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/LockControlCard.css';
import {useTranslation} from "react-i18next"; // You'll create this file
import { MoreVertical } from 'lucide-react';
interface Props {
    mac: string;
    room: string;
}

const LockControlCard = ({ mac, room }: Props) => {
    const [locked, setLocked] = useState<boolean | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get(`https://backendapi.ctce.ro/apicosmin/getlockstatus?mac_address=${mac}`);
                setLocked(res.data === true);
            } catch (err) {
                console.warn(`[fetchLockStatus] Failed for ${mac}`, err);
            }
        };
        fetchStatus();
    }, [mac]);

    const toggleLock = async () => {
        try {
            const endpoint = locked ? "unlockdoor" : "lockdoor";
            await axios.get(`https://backendapi.ctce.ro/apicosmin/${endpoint}?mac_address=${mac}`);
            setLocked(prev => !prev);
        } catch (err) {
            console.error("[toggleLock] Failed", err);
        }
    };

    return (
        <div className="lock-card">
            <div className="lock-header">
                <span className="room-name">{room}</span>
                <button className="menu-button">
                    <MoreVertical size={18} />
                </button>
            </div>
            <div className="checkbox-wrapper-41">
                <input
                    type="checkbox"
                    checked={locked ?? false}
                    onChange={toggleLock}
                />
            </div>
            <div className="lock-label">{t("dimmer.lockControl")}</div>
        </div>
    );

};

export default LockControlCard;
