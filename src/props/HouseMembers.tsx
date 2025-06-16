import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/HouseMembers.css";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Member {
    id: number;
    username: string;
    email: string;
    profilePicture: string | null;
    profilePictureMimeType: string | null;
}

interface HouseMembersProps {
    houseId: number;
    baseUrl: string;
    onInviteClick: () => void;
}

const HouseMembers: React.FC<HouseMembersProps> = ({ houseId, baseUrl, onInviteClick }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const { t } = useTranslation();
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await axios.get(`${baseUrl}/getusersfromhouse?houseid=${houseId}`);
                setMembers(res.data);
            } catch (err) {
                console.error("Failed to fetch members", err);
            }
        };
        fetchMembers();
    }, [houseId, baseUrl]);

    return (
        <div className="members-box">
            <span className="members-title">{t("members.title")}</span>
            <div className="members-list">
            {members.map(member => (
                    <div key={member.id} className="member-item">
                        {member.profilePicture ? (
                            <img
                                src={`data:${member.profilePictureMimeType};base64,${member.profilePicture}`}
                                alt={member.username}
                                className="member-avatar"
                            />
                        ) : (
                            <div className="member-placeholder">
                                {member.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="member-name">{member.username}</span>
                    </div>
                ))}
                <div className="member-item" onClick={onInviteClick} style={{ cursor: "pointer" }}>
                    <div className="member-add">
                        <Plus size={24} color="#fff" />
                    </div>
                    <span className="member-name">{t("members.invite")}</span>
                </div>
            </div>
        </div>
    );
};

export default HouseMembers;
