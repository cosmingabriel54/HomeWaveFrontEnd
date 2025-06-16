import { useState } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import '../styles/SmartActionDialog.css';
import DimmerCard from "./DimmerCard.tsx";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            paper: '#2a2a2a',
            default: '#1a1a1a'
        },
        text: {
            primary: '#ffffff'
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2a2a2a',
                    color: '#ffffff',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: '#ffffff',
                },
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: '#ffffff',
                }
            }
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    color: '#ffffff',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                notchedOutline: {
                    borderColor: '#666',
                },
            },
        },
    },
});
interface Device {
    device_id: number;
    mac_address: string;
    device_type: string;
    device_name?: string;
}

interface Room {
    room_id: number;
    room_name: string;
    devices: Device[];
}

interface House {
    house_id: number;
    house_name: string;
    rooms: Room[];
}

interface SmartActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    uuid: string;
    baseUrl: string;
    deviceTree: House[];
}

const SmartActionDialog = ({ isOpen, onClose, baseUrl, deviceTree }: SmartActionDialogProps) => {
    const { t, i18n } = useTranslation();

    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [actionValue, setActionValue] = useState<string | number | null>(null);
    const [scheduleTime, setScheduleTime] = useState<Dayjs | null>(dayjs());

    const [permanent, setPermanent] = useState(false);

    const rooms = deviceTree.flatMap(h => h.rooms);
    const filteredDevices = selectedRoomId ? rooms.find(r => r.room_id === selectedRoomId)?.devices || [] : [];

    const deviceLabel = (type: string) => {
        const map: Record<string, Record<string, string>> = {
            light_control: { en: "Light", ro: "Lumină", hu: "Fény" },
            lock_control: { en: "Lock", ro: "Încuietoare", hu: "Zár" },
            thermostat: { en: "Thermostat", ro: "Termostat", hu: "Hőszabályzó" },
        };
        return map[type]?.[i18n.language] || type;
    };

    const submit = async () => {
        if (!selectedDevice || actionValue === null || !scheduleTime) return;

        const type = selectedDevice.device_type;
        let action = "";
        if (type === "light_control") action = `brightness:${actionValue}`;
        else if (type === "lock_control") action = actionValue.toString();
        else if (type === "thermostat") action = `temp:${actionValue}`;

        const payload = {
            mac_address: selectedDevice.mac_address,
            device_type: type === "light_control" ? "light" : type === "lock_control" ? "lock" : "thermostat",
            action,
            time: scheduleTime?.format('YYYY-MM-DDTHH:mm:ss') ?? '',

            permanent
        };

        try {
            await axios.post(`${baseUrl}/setactions`, payload, {
                headers: { "Content-Type": "application/json" }
            });
            onClose();
        } catch (err) {
            console.error("Failed to set smart action", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="power-dialog-backdrop">
            <div className="power-dialog">
                <h2>{t("main.smart.title")}</h2>
                <p>{t("main.smart.description")}</p>

                <select
                    className="file-input"
                    value={selectedRoomId || ""}
                    onChange={e => {
                        setSelectedRoomId(parseInt(e.target.value));
                        setSelectedDevice(null);
                        setActionValue(null);
                    }}>
                    <option value="" disabled>{t("main.smart.selectRoom")}</option>
                    {rooms.map(room => (
                        <option key={room.room_id} value={room.room_id}>{room.room_name}</option>
                    ))}
                </select>

                {filteredDevices.length > 0 && (
                    <select
                        className="file-input"
                        value={selectedDevice?.device_id ?? ""}
                        onChange={e => {
                            const dev = filteredDevices.find(d => d.device_id === parseInt(e.target.value));
                            setSelectedDevice(dev || null);
                            setActionValue(null);
                        }}>
                        <option value="" disabled>{t("main.smart.selectDevice")}</option>
                        {filteredDevices.map(device => (
                            <option key={device.device_id} value={device.device_id}>
                                {device.device_name || deviceLabel(device.device_type)}
                            </option>
                        ))}
                    </select>

                )}

                {selectedDevice?.device_type === "light_control" && (
                    <div className="dimmer-card-container">
                        <DimmerCard
                            mac={selectedDevice.mac_address}
                            room={selectedDevice.device_name || deviceLabel(selectedDevice.device_type)}
                            initialValue={typeof actionValue === 'number' ? actionValue : 50}
                            onChangeEnd={(_mac, value) => setActionValue(value)}
                        />
                    </div>
                )}


                {selectedDevice?.device_type === "lock_control" && (
                    <select className="file-input" onChange={e => setActionValue(e.target.value)}>
                        <option value="" disabled>{t("main.smart.lockAction")}</option>
                        <option value="lock">{t("main.smart.lock")}</option>
                        <option value="unlock">{t("main.smart.unlock")}</option>
                    </select>
                )}

                {selectedDevice?.device_type === "thermostat" && (
                    <div className="range-wrapper">
                        <label>{t("main.smart.temperature")}: {actionValue} °C</label>
                        <input type="range" min="10" max="30" step="0.5" value={Number(actionValue) || 22}
                               onChange={e => setActionValue(parseFloat(e.target.value))} className="range-slider"/>
                    </div>
                )}

                <div className="datepicker-wrapper">
                    <label className="datepicker-label">{t("main.smart.scheduleTime")}</label>
                    <ThemeProvider theme={darkTheme}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                value={scheduleTime}
                                onChange={(newValue) => setScheduleTime(newValue)}
                                slotProps={{
                                    textField: {
                                        variant: 'outlined',
                                        size: 'small',
                                        sx: {
                                            mt: 1,
                                            width: '100%',
                                            backgroundColor: '#2c2c2c',
                                        }
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </ThemeProvider>

                </div>


                <div className="toggle-row">
                    <span className="toggle-text">{t("main.smart.repeatDaily")}</span>
                    <label className="toggle-label">
                        <input
                            type="checkbox"
                            checked={permanent}
                            onChange={e => setPermanent(e.target.checked)}
                        />
                        <span className="toggle-slider"/>
                    </label>
                </div>

                <div className="dialog-actions">
                    <button onClick={onClose} className="cancel-btn">
                        {t("main.smart.cancel")}
                    </button>
                    <button onClick={submit} className="confirm-btn">
                        {t("main.smart.submit")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartActionDialog;
