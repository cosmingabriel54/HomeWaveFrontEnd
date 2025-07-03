import { useEffect, useState } from "react";
import { fetchSensorData, SensorData } from "../services/sensorService.ts";
import { fetchThermostatStatus, updateThermostatTarget } from "../services/thermostatService.ts";
import "../styles/ThermostatCard.css";
import { useTranslation } from "react-i18next";

interface ThermostatCardProps {
    mac: string;
    room: string;
}

const ThermostatCard = ({ mac, room }: ThermostatCardProps) => {
    const [currentTemp, setCurrentTemp] = useState<number | null>(null);
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const loadStatus = async () => {
            const status = await fetchThermostatStatus(mac);
            if (status !== null) setCurrentTemp(status);
        };

        const loadSensor = async () => {
            const data = await fetchSensorData(mac.replace(/:/g, ""));
            if (data) setSensorData(data);
        };

        loadStatus();
        loadSensor();
        const interval = setInterval(loadSensor, 10000);
        return () => clearInterval(interval);
    }, [mac]);

    const adjustTemp = async (delta: number) => {
        if (currentTemp === null) return;
        const newTemp = parseFloat((currentTemp + delta).toFixed(1));
        await updateThermostatTarget(mac, newTemp);
        setCurrentTemp(newTemp);
    };

    if (currentTemp === null || !sensorData) {
        return <div className="thermostat-card">{t("thermostat.loading")}</div>;
    }

    return (
        <div className="thermostat-card">
            <div className="thermostat-header">
                <strong>{room}</strong>
            </div>
            <div className="thermostat-controls">
                <button onClick={() => adjustTemp(-0.5)}>-</button>
                <span>{currentTemp.toFixed(1)}°C</span>
                <button onClick={() => adjustTemp(0.5)}>+</button>
            </div>
            <div className="thermostat-sensor">
                <div>{t("thermostat.roomTemp", {value: sensorData.temperatureC.toFixed(1)})}</div>
                <div>{t("thermostat.humidity", {value: sensorData.humidity.toFixed(0)})}</div>
            </div>
        </div>
    );
};

export default ThermostatCard;
