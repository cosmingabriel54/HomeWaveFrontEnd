import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Main.css";
import { X, Lock, Settings } from 'lucide-react';

interface Device {
    device_id: number;
    ip_address: string;
    mac_address: string;
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

const Main = () => {
    const navigate = useNavigate();
    const uuid = localStorage.getItem("uuid");

    const [deviceTree, setDeviceTree] = useState<House[]>([]);
    const [lightStates, setLightStates] = useState<Record<string, boolean>>({});
    const [initialStatusLoaded, setInitialStatusLoaded] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [showSettings, setShowSettings] = useState(false);
    const [userInfo, setUserInfo] = useState<{ username: string; email: string }>({ username: "", email: "" });

    const baseUrl = "https://homewavebackend.onrender.com";

    useEffect(() => {
        if (!uuid) return;
        fetchData();
        fetchUserInfo(); // Fetch user info when component mounts, only once
    }, [uuid]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${baseUrl}/userdevicetree?uuid=${uuid}`);
            const data: House[] = res.data;
            setDeviceTree(data);

            data.forEach(house =>
                house.rooms.forEach(room =>
                    room.devices.forEach(device => {
                        fetchLightStatus(device.mac_address);
                    })
                )
            );
        } catch (err) {
            console.error("Failed to load device tree", err);
            setErrorMessage("Failed to load devices.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLightStatus = async (mac: string) => {
        try {
            const res = await axios.get(`${baseUrl}/getlightstatus?mac_address=${mac}`);
            const status = res.data.light_status === 1;
            setLightStates(prev => ({ ...prev, [mac]: status }));
            setInitialStatusLoaded(prev => ({ ...prev, [mac]: true }));
        } catch (err) {
            console.warn("Light status fetch failed for", mac, err);
        }
    };

    const toggleLight = async (mac: string, on: boolean) => {
        try {
            await axios.get(`${baseUrl}/${on ? "turnonlight" : "turnofflight"}?mac_address=${mac}`);
            setLightStates(prev => ({ ...prev, [mac]: on }));
        } catch (err) {
            console.error("Failed to toggle light", err);
        }
    };

    const fetchUserInfo = async () => {
        try {
            const res = await axios.post(`${baseUrl}/userinfo?uuid=${uuid}`, null, {
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json",
                },
            });
            setUserInfo(res.data);
        } catch (err) {
            console.error("Failed to fetch user info", err);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await axios.post(`${baseUrl}/logout?uuid=${uuid}`);
            if (res.status === 200) {
                localStorage.removeItem("uuid");
                navigate("/login");
            }
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const openSettings = () => {
        setShowSettings(true); // NO re-fetch here!
    };

    return (
        <div className="main-page">
            <div className="topbar">
                <h2>Hello{userInfo.username ? `, ${userInfo.username}` : ""}</h2>
                <button className="settings-btn" onClick={openSettings}>
                    <Settings size={20}/> Settings
                </button>
            </div>

            {loading ? (
                <div className="center">Loading...</div>
            ) : errorMessage ? (
                <div className="center error-message">{errorMessage}</div>
            ) : (
                <div className="device-list">
                    {deviceTree.map(house => (
                        <details key={house.house_id} open={house.rooms.length > 0}>
                            <summary className="house-title">🏠 {house.house_name}</summary>
                            {house.rooms.length === 0 ? (
                                <p className="empty-sub">No rooms</p>
                            ) : (
                                house.rooms.map(room => (
                                    <details key={room.room_id} open={room.devices.length > 0}>
                                        <summary className="room-title">🛏️ {room.room_name}</summary>
                                        {room.devices.length === 0 ? (
                                            <p className="empty-sub">No devices</p>
                                        ) : (
                                            room.devices.map(device => {
                                                const mac_address = device.mac_address;
                                                const isOn = lightStates[mac_address] || false;
                                                const loaded = initialStatusLoaded[mac_address];

                                                return (
                                                    <div key={device.device_id} className="device-row">
                                                        <span>💡 Light Control</span>
                                                        {loaded ? (
                                                            <label className="switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isOn}
                                                                    onChange={(e) => toggleLight(mac_address, e.target.checked)}
                                                                />
                                                                <span className="slider" />
                                                            </label>
                                                        ) : (
                                                            <div className="spinner" />
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </details>
                                ))
                            )}
                        </details>
                    ))}
                </div>
            )}

            {showSettings && (
                <div className="settings-panel">
                    <button className="close-btn" onClick={() => setShowSettings(false)}>
                        <X size={24}/>
                    </button>
                    <div className="user-info">
                        <h3>User Info</h3>
                        <p><strong>Username:</strong> {userInfo.username}</p>
                        <p><strong>Email:</strong> {userInfo.email}</p>
                        <button className="logout-btn" onClick={handleLogout}>
                            <Lock size={20}/> Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;
