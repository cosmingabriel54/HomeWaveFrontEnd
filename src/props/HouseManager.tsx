import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/HouseManager.css";
import { Plus, Trash2 } from "lucide-react";
import InputDialog from "./InputDialog";
import {predefinedRooms} from "../services/roomList.ts"
import { useTranslation } from "react-i18next";

interface HouseManagerProps {
    uuid: string;
    baseUrl: string;
}

interface Room {
    roomId: number;
    roomName: string;
}

interface House {
    houseId: number;
    houseName: string;
    rooms: Room[];
}

const HouseManager: React.FC<HouseManagerProps> = ({ uuid, baseUrl }) => {
    const [houses, setHouses] = useState<House[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddHouseDialog, setShowAddHouseDialog] = useState(false);
    const [showAddRoomDialog, setShowAddRoomDialog] = useState<{ houseId: number } | null>(null);
    const { t } = useTranslation();

    const fetchHouses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/home/getHouses?uuid=${uuid}`);
            setHouses(res.data.homes);
        } catch (err) {
            console.error("Failed to load houses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHouses();
    }, [uuid, baseUrl]);


    const joinHouseByCode = async (code: string) => {
        try {
            await axios.post(`${baseUrl}/addusercode?code=${code}&uuid=${uuid}`, null)
        } catch (err) {
            console.error("Failed to join house with code", err);
        }
    };

    const handleAddHouse = async (name: string, inviteCode?: string) => {
        try {
            console.log(baseUrl);
            if (inviteCode) {
                await joinHouseByCode(inviteCode);
            } else {
                await axios.post(`${baseUrl}/home/addHouse?houseName=${name}&uuid=${uuid}`, null)
            }
            await fetchHouses();
        } catch (err) {
            console.error("Failed to add or join house", err);
        }
    };


    const handleDeleteHouse = async (houseId: number) => {
        if (!confirm("Delete this house?")) return;

        try {
            await axios.delete(`${baseUrl}/home/deleteHouse`, {
                params: { houseId }
            });
            await fetchHouses();
        } catch (err) {
            console.error("Failed to delete house", err);
            alert("Failed to delete house.");
        }
    };

    const handleAddRoom = async (roomName: string) => {
        try {
            if (showAddRoomDialog) {
                await axios.post(`${baseUrl}/addRoom`, null, {
                    params: { roomName, houseId: showAddRoomDialog.houseId }
                });
                await fetchHouses();
            }
        } catch (err) {
            console.error("Failed to add room", err);
        }
    };

    const handleDeleteRoom = async (roomId: number) => {
        if (!confirm("Delete this room?")) return;

        try {
            await axios.delete(`${baseUrl}/deleteRoom/${roomId}`);
            await fetchHouses();
        } catch (err) {
            console.error("Failed to delete room", err);
            alert("Failed to delete room.");
        }
    };

    return (
        <div className="house-manager-container">
            <h2>{t("house.manageTitle")}</h2>
            <button className="action-btn" onClick={() => setShowAddHouseDialog(true)}>
                <Plus size={16} style={{marginRight: 5}}/> {t("house.addHouse")}
            </button>

            {loading ? (
                <p>Loading...</p>
            ) : (
                houses.map((house) => (
                    <div key={house.houseId}  className="house-entry">
                        <div className="house-header">
                            <strong>{house.houseName}</strong>
                            <div>
                                <button className="action-btn"
                                        onClick={() => setShowAddRoomDialog({houseId: house.houseId})}>
                                    <Plus size={14} style={{marginRight: 4}}/> {t("house.addRoom")}
                                </button>
                                <button className="delete-btn" onClick={() => handleDeleteHouse(house.houseId)}>
                                    <Trash2 size={14} style={{marginRight: 4}}/> {t("house.deleteHouse")}
                                </button>
                            </div>
                        </div>

                        <ul style={{marginTop: 10}}>
                            {house.rooms.map((room) => (
                                <li key={room.roomId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                    <span>{room.roomName}</span>
                                    <button className="delete-btn" onClick={() => handleDeleteRoom(room.roomId)}>
                                        <Trash2 size={14} style={{marginRight: 4}}/> {t("house.deleteRoom")}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                ))
            )}
            <InputDialog
                isOpen={showAddHouseDialog}
                title={t("house.addOrJoin")}
                label={t("house.houseName")}
                showCodeField
                onCancel={() => setShowAddHouseDialog(false)}
                onSubmit={(name, code) => {
                    setShowAddHouseDialog(false);
                    handleAddHouse(name, code);
                }}

            />

            {showAddRoomDialog !== null && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>{t("house.selectRoom")}</h3>
                        <select
                            defaultValue=""
                            onChange={async (e) => {
                                const selectedRoom = e.target.value;
                                if (selectedRoom && showAddRoomDialog) {
                                    await handleAddRoom(selectedRoom);
                                    setShowAddRoomDialog(null);
                                }
                            }}
                        >
                            <option value="" disabled>{t("house.selectRoomPlaceholder")}</option>
                            {predefinedRooms.map((room: string) => (
                                <option key={room} value={room}>{room}</option>
                            ))}

                        </select>
                        <div style={{marginTop: 16}}>
                            <button onClick={() => setShowAddRoomDialog(null)}>{t("house.cancel")}</button>
                        </div>
                    </div>
                </div>
            )}


        </div>

    );
};

export default HouseManager;
