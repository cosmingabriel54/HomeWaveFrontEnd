import { useRef, useState } from 'react';
import '../styles/DimmerCard.css';
import { Lightbulb, MoreVertical } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface DimmerCardProps {
    mac: string;
    room: string;
    initialValue: number;
    onChangeEnd: (mac: string, value: number) => void;
    isPowerSaving?: boolean;
}

const DimmerCard = ({ mac, room, initialValue, onChangeEnd,isPowerSaving  }: DimmerCardProps) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const [value, setValue] = useState(initialValue);
    const [isOn, setIsOn] = useState(initialValue > 0);
    const [lastNonZeroValue, setLastNonZeroValue] = useState(initialValue > 0 ? initialValue : 50);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sliderRef.current || isPowerSaving) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const height = rect.height;
        const rawPercentage = 100 - (clickY / height) * 100;
        const percentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));


        const newValue = percentage > 0 ? percentage : 0;
        if (newValue > 0 && !isOn) setIsOn(true);
        if (newValue > 0) setLastNonZeroValue(newValue);

        setValue(newValue);
        onChangeEnd(mac, newValue);
    };

    const handleSwitchToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const toggled = e.target.checked;
        setIsOn(toggled);
        const newValue = isPowerSaving
            ? (toggled ? 100 : 0)
            : (toggled ? lastNonZeroValue : 0);
        setValue(newValue);
        onChangeEnd(mac, newValue);
    };

    return (
        <div className="dimmer-wrapper">
            <div className="dimmer-header">
                <span className="room-name">{room}</span>
                <button className="menu-button">
                    <MoreVertical size={18} />
                </button>
            </div>

            {isPowerSaving ? (
                <div className="power-saving-toggle">
                    <div className="checkbox-wrapper-41">
                        <input
                            type="checkbox"
                            checked={isOn}
                            onChange={handleSwitchToggle}
                        />
                    </div>
                </div>
            ) : (
                <div className="dimmer-slider" ref={sliderRef} onClick={handleClick}>
                    <div className="dimmer-fill" style={{height: `${value}%`}}/>

                    <div className="dimmer-content">
                    <Lightbulb size={24} />
                        <div className="dimmer-value">{value}%</div>
                    </div>
                </div>
            )}

            <div className="dimmer-label">{t("dimmer.lightControl")}</div>

            {!isPowerSaving && (
                <div className="checkbox-wrapper-41">
                    <input
                        type="checkbox"
                        checked={isOn}
                        onChange={handleSwitchToggle}
                    />
                </div>
            )}
        </div>
    );

};

export default DimmerCard;