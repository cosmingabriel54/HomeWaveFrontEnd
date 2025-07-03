import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
interface Device {
    mac_address: string;
    room_name: string;
}

interface PowerModeDialogProps {
    devices: Device[];
    onClose: () => void;
}

const PowerModeDialog = ({ devices, onClose }: PowerModeDialogProps) => {
    const [selectedMac, setSelectedMac] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<number | null>(null);
    const baseUrl = "https://backendapi.ctce.ro/apicosmin";
    const { t } = useTranslation();
    useEffect(() => {
        if (!selectedMac) return;
        setLoading(true);
        axios.get(`${baseUrl}/getpowersavingmode?mac_address=${selectedMac}`)
            .then(res => {
                setMode(parseInt(res.data));
            })
            .catch(() => alert("Failed to fetch current mode"))
            .finally(() => setLoading(false));
    }, [selectedMac]);
    return (
        <div className="power-dialog-backdrop">
            <div className="power-dialog">
                <h2>{t("powerDialog.title")}</h2>
                <p>{t("powerDialog.description")}</p>
                <select
                    value={selectedMac || ""}
                    onChange={e => setSelectedMac(e.target.value)}
                >
                    <option value="" disabled>{t("powerDialog.selectDevice")}</option>
                    {[...new Map(devices.map(d => [d.mac_address, d])).values()].map(d => (
                        <option key={d.mac_address} value={d.mac_address}>
                            {d.room_name} ({d.mac_address.slice(-4)})
                        </option>
                    ))}
                </select>

                {loading ? (
                    <div style={{ marginTop: 16 }}>{t("powerDialog.loading")}</div>
                ) : (
                    selectedMac && mode !== null && (
                        <div className="mode-toggle">
                            <button
                                className={`mode-option ${mode === 0 ? 'active' : ''}`}
                                onClick={async () => {
                                    setMode(0);
                                    await axios.post(`${baseUrl}/togglepowersavingmode?mac_address=${selectedMac}&toggle=disable_power_saving`);
                                }}
                            >
                                {t("powerDialog.normal")}
                            </button>
                            <button
                                className={`mode-option ${mode === 1 ? 'active' : ''}`}
                                onClick={async () => {
                                    setMode(1);
                                    await axios.post(`${baseUrl}/togglepowersavingmode?mac_address=${selectedMac}&toggle=enable_power_saving`);
                                }}
                            >
                                {t("powerDialog.power")}
                            </button>
                        </div>

                    )
                )}
                <button className="close-btn" onClick={onClose}>{t("powerDialog.close")}</button>
            </div>
        </div>
    );
};

export default PowerModeDialog;
