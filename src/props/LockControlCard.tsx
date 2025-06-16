import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/LockControlCard.css'; // You'll create this file

interface Props {
    mac: string;
    room: string;
}

const LockControlCard = ({ mac, room }: Props) => {
    const [locked, setLocked] = useState<boolean | null>(null);

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
            <div className="lock-room">{room}</div>
            <input id={`inpLock-${mac}`} type="checkbox" checked={locked ?? false} onChange={toggleLock} />
            <label className="btn-lock" htmlFor={`inpLock-${mac}`}>
                <svg width="36" height="40" viewBox="0 0 36 40">
                    <path className="lockb" d="M27 27C27 34.1797 21.1797 40 14 40C6.8203 40 1 34.1797 1 27C1 19.8203 6.8203 14 14 14C21.1797 14 27 19.8203 27 27ZM15.6298 26.5191C16.4544 25.9845 17 25.056 17 24C17 22.3431 15.6569 21 14 21C12.3431 21 11 22.3431 11 24C11 25.056 11.5456 25.9845 12.3702 26.5191L11 32H17L15.6298 26.5191Z"></path>
                    <path className="lock" d="M6 21V10C6 5.58172 9.58172 2 14 2V2C18.4183 2 22 5.58172 22 10V21"></path>
                    <path className="bling" d="M29 20L31 22"></path>
                    <path className="bling" d="M31.5 15H34.5"></path>
                    <path className="bling" d="M29 10L31 8"></path>
                </svg>
            </label>
            <div className="lock-label">{locked ? "Locked" : "Unlocked"}</div>
        </div>
    );
};

export default LockControlCard;
