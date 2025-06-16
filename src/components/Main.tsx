import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Main.css";
import {X, Lock, Globe, BatteryCharging, ShieldCheck, Zap, LogOut, Sun, Moon, Home, Pencil} from 'lucide-react';
import DimmerCard from "../props/DimmerCard.tsx";
import PowerModeDialog from "../props/PowerModeDialog.tsx";
import LockControlCard from "../props/LockControlCard.tsx";
import WeatherCard from "../props/WeatherCard.tsx";
import ThermostatCard from "../props/ThermostatCard.tsx";
import InviteUserDialog from "../props/InviteUserDialog.tsx";
import HouseManager from "../props/HouseManager.tsx";
import HouseMembers from "../props/HouseMembers.tsx";
import ProfilePictureDialog from "../props/ProfilePictureDialog.tsx";
import { useTranslation } from "react-i18next";
import i18n from "../services/i18n";
import LightGraph from "../props/LightGraph.tsx";
import SmartActionDialog from "../props/SmartActionDialog.tsx";

interface Device {
    device_id: number;
    ip_address: string;
    mac_address: string;
    device_type: string;
    status: number;
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

interface UserInfo {
    username: string;
    email: string;
    profilePicture?: string | null;
    profilePictureMimeType?: string | null;
}
const Main = () => {
    const navigate = useNavigate();
    const uuid = localStorage.getItem("uuid");
    const { t } = useTranslation();
    const [deviceTree, setDeviceTree] = useState<House[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo>({
        username: "",
        email: "",
        profilePicture: null,
        profilePictureMimeType: null
    });
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en");
    const baseUrl = "https://backendapi.ctce.ro/apicosmin";
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "dark";
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const getInitial = (name: string) => name.charAt(0).toUpperCase();

    const userInitial = getInitial(userInfo.username);
    const [activeSection, setActiveSection] = useState<string>("Devices");

    const [showPowerDialog, setShowPowerDialog] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const thermostats = deviceTree.flatMap(house =>
        house.rooms.flatMap(room =>
            room.devices.filter(device => device.device_type === "thermostat")
        )
    );
    const [showSmartDialog, setShowSmartDialog] = useState(false);
    const allDevices = deviceTree.flatMap(h =>
        h.rooms.flatMap(r => r.devices)
    );

    useEffect(() => {
        document.body.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

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
        }
    };

    const fetchLightStatus = async (mac: string) => {
        try {
            const res = await axios.get(`${baseUrl}/getlightstatus?mac_address=${mac}`);
            const percentage = res.data.light_status ?? 0;

            // Update the status directly in the deviceTree
            setDeviceTree(prevTree =>
                prevTree.map(house => ({
                    ...house,
                    rooms: house.rooms.map(room => ({
                        ...room,
                        devices: room.devices.map(device =>
                            device.mac_address === mac
                                ? { ...device, status: percentage }
                                : device
                        ),
                    })),
                }))
            );
        } catch (err) {
            console.warn("Light status fetch failed for", mac, err);
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
    const handleProfileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("uuid", uuid!);

        try {
            await axios.post(`${baseUrl}/uploadpfp`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            await fetchUserInfo();
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    return (
        <div key={i18n.language} className="main-page">
        <div className="drawer-wrapper">
                <div className="left-permanent-drawer">
                    <div className="menu-buttons">
                        <button className={`drawer-button ${activeSection === "Devices" ? "active" : ""}`}
                                onClick={() => setActiveSection("Devices")}>
                            <span className="icon"><BatteryCharging size={16}/></span> {t("main.sidebar.devices")}
                        </button>
                        <button className={`drawer-button ${activeSection === "Houses" ? "active" : ""}`}
                                onClick={() => setActiveSection("Houses")}>
                            <span className="icon"><Home size={16}/></span> {t("main.sidebar.houses")}
                        </button>

                    </div>

                    <button className="drawer-button logout" onClick={handleLogout}>
                        <span className="icon"><LogOut size={16}/></span> {t("main.sidebar.logout")}
                    </button>
                </div>

            </div>

            <div className="topbar">
                <div className="user-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <div className="avatar-wrapper" onClick={(e) => {
                        e.stopPropagation(); // don't trigger dropdown
                        setShowProfileDialog(true);
                    }}>
                        <div className="avatar">
                            {userInfo.profilePicture ? (
                                <img src={`data:${userInfo.profilePictureMimeType};base64,${userInfo.profilePicture}`}
                                     alt="avatar"/>
                            ) : (
                                userInitial
                            )}
                        </div>
                        <div className="avatar-overlay">
                            <Pencil size={16}/>
                        </div>
                    </div>
                    <span className="username">{userInfo.username}</span>
                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <p><strong>{t("main.dropdown.email")}:</strong> {userInfo.email}</p>
                            <button onClick={() => setShowLanguageDialog(true)}>

                                <Globe size={16} style={{marginRight: 8}}/> {t("main.dropdown.language")}
                            </button>
                            <button onClick={toggleTheme}>
                                {theme === "dark" ? (
                                    <>
                                        <Sun size={16} style={{marginRight: 8}}/> {t("main.dropdown.light")}
                                    </>
                                ) : (
                                    <>
                                        <Moon size={16} style={{marginRight: 8}}/> {t("main.dropdown.dark")}
                                    </>
                                )}
                            </button>
                            <button onClick={() => {
                                setDropdownOpen(false);
                                setShowPowerDialog(true);
                            }}>
                                <BatteryCharging size={16} style={{marginRight: 8}}/> {t("main.dropdown.power")}
                            </button>
                            <button onClick={() => {
                                setDropdownOpen(false);
                                //setShow2FADialog(true);
                            }}>
                                <ShieldCheck size={16} style={{marginRight: 8}}/> {t("main.dropdown.2fa")}
                            </button>
                            <button onClick={() => {
                                setDropdownOpen(false);
                                setShowSmartDialog(true);
                            }}>
                                <Zap size={16} style={{marginRight: 8}}/> {t("main.dropdown.smart")}
                            </button>

                            <button onClick={() => setIsInviteDialogOpen(true)}>
                                <Globe size={16} style={{marginRight: 8}}/> {t("main.dropdown.invite")}
                            </button>

                            <button onClick={handleLogout}>
                                <LogOut size={16} style={{marginRight: 8}}/> {t("main.dropdown.logout")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="dashboard-content">
                <div className="left-panel">
                    <WeatherCard/>
                </div>


                <div className="right-panel">
                    {activeSection === "Devices" && (
                        <>
                            {thermostats.length > 0 && (
                                <div className="device-control-container">
                                    <h2>{t("main.thermostat.title")}</h2>
                                    <div className="thermostat-section">
                                        {thermostats.map(device => {
                                            const room = deviceTree
                                                .flatMap(h => h.rooms)
                                                .find(r => r.devices.some(d => d.device_id === device.device_id));

                                            return (
                                                <ThermostatCard
                                                    key={`thermo-${device.device_id}`}
                                                    mac={device.mac_address}
                                                    room={room?.room_name || "Unknown"}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}


                            <div className="device-control-container">
                                <h2>{t("main.otherDevices.title")}</h2>
                                <div className="device-grid">
                                    {allDevices.length === 0 ? (
                                        <div className="no-devices-wrapper">
                                            <div className="no-devices-message">
                                                <div className="empty-content">
                                                    <h3>{t("main.otherDevices.noDevicesTitle")}</h3>
                                                    <p>{t("main.otherDevices.noDevicesDesc")}</p>
                                                    <div className="store-badges">
                                                        <a
                                                            href="https://play.google.com/store/apps/details?id=com.example.app"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <img
                                                                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                                                alt="Get it on Google Play"
                                                            />
                                                        </a>
                                                        <a
                                                            href="https://apps.apple.com/app/id0000000000"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <img
                                                                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                                                                alt="Download on the App Store"
                                                            />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        deviceTree.flatMap(house =>
                                            house.rooms.flatMap(room =>
                                                room.devices
                                                    .filter(device => device.device_type !== "thermostat")
                                                    .map(device => {
                                                        switch (device.device_type) {
                                                            case "light_control":
                                                                return (
                                                                    <DimmerCard
                                                                        key={device.device_id}
                                                                        mac={device.mac_address}
                                                                        room={room.room_name}
                                                                        initialValue={device.status}
                                                                        onChangeEnd={async (mac, value) => {
                                                                            try {
                                                                                await axios.get(`${baseUrl}/turnonlight?mac_address=${mac}&percentage=${value}`);
                                                                            } catch (err) {
                                                                                console.error("Failed to set light level", err);
                                                                            }
                                                                        }}
                                                                    />
                                                                );
                                                            case "lock_control":
                                                                return (
                                                                    <LockControlCard
                                                                        key={`lock-${device.device_id}`}
                                                                        mac={device.mac_address}
                                                                        room={room.room_name}
                                                                    />
                                                                );
                                                            default:
                                                                return null;
                                                        }
                                                    })
                                            )
                                        )
                                    )}

                                </div>
                            </div>
                        </>
                    )}

                    {activeSection === "Houses" && (
                        <HouseManager uuid={uuid!} baseUrl={baseUrl}/>
                    )}
                </div>
            </div>

            {showSettings && (
                <div className="settings-panel">
                    <button className="close-btn" onClick={() => setShowSettings(false)}>
                        <X size={24}/>
                    </button>
                    <div className="user-info">
                        <h3>{t("main.settings.userInfo")}</h3>
                        <p><strong>{t("main.settings.username")}:</strong> {userInfo.username}</p>
                        <p><strong>{t("main.settings.email")}:</strong> {userInfo.email}</p>
                        <button className="logout-btn" onClick={handleLogout}>
                            <Lock size={20}/> {t("main.settings.logout")}
                        </button>
                    </div>
                </div>
            )}

            {showPowerDialog && (
                <PowerModeDialog
                    devices={deviceTree.flatMap(h =>
                        h.rooms.flatMap(r =>
                            r.devices.map(d => ({
                                mac_address: d.mac_address,
                                room_name: r.room_name
                            }))
                        )
                    )}
                    onClose={() => setShowPowerDialog(false)}
                />
            )}
            <InviteUserDialog
                uuid={uuid!}
                baseUrl={baseUrl}
                isOpen={isInviteDialogOpen}
                onClose={() => setIsInviteDialogOpen(false)}
            />
            {deviceTree.length > 0 && (
                <HouseMembers
                    houseId={deviceTree[0].house_id}
                    baseUrl={baseUrl}
                    onInviteClick={() => setIsInviteDialogOpen(true)}
                />
            )}
            <ProfilePictureDialog
                isOpen={showProfileDialog}
                onClose={() => setShowProfileDialog(false)}
                onUpload={handleProfileUpload}
                currentImage={
                    userInfo.profilePicture && userInfo.profilePictureMimeType
                        ? `data:${userInfo.profilePictureMimeType};base64,${userInfo.profilePicture}`
                        : undefined
                }
            />
            {showLanguageDialog && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{t("main.dropdown.language")}</h3>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="language-select"
                        >
                            <option value="en">English</option>
                            <option value="ro">Română</option>
                            <option value="hu">Magyar</option>
                            <option value="fr">Français</option>
                        </select>

                        <div className="modal-actions">
                            <button
                                onClick={() => {
                                    i18n.changeLanguage(selectedLanguage);
                                    localStorage.setItem("i18nextLng", selectedLanguage);
                                    setShowLanguageDialog(false);
                                }}
                            >
                                OK
                            </button>
                            <button onClick={() => setShowLanguageDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {(() => {
                const lightDevice = deviceTree
                    .flatMap(h => h.rooms)
                    .flatMap(r => r.devices.map(d => ({ ...d, roomName: r.room_name })))
                    .find(d => d.device_type === "light_control");

                return lightDevice ? (
                    <div className="bottom-left-fixed-graph">
                        <LightGraph key={lightDevice.mac_address} mac={lightDevice.mac_address} />
                    </div>
                ) : null;
            })()}
            <SmartActionDialog
                isOpen={showSmartDialog}
                onClose={() => setShowSmartDialog(false)}
                uuid={uuid!}
                baseUrl={baseUrl}
                deviceTree={deviceTree}
            />
        </div>
    );

};

export default Main;
