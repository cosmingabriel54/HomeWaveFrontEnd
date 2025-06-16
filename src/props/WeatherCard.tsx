import { useEffect, useState } from "react";
import { getWeatherIcon } from "./weatherIcons.tsx";
import "../styles/WeatherCard.css";
import { useTranslation } from "react-i18next";

interface WeatherCondition {
    temp_C: string;
    humidity: string;
    weatherCode: string;
    weatherDesc: { value: string }[];
    weatherIconUrl: { value: string }[];
}

interface WeatherArea {
    areaName: { value: string }[];
}

interface WeatherData {
    current_condition: WeatherCondition[];
    nearest_area: WeatherArea[];
}

const WeatherCard = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                const [weatherRes, geoRes] = await Promise.all([
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weathercode`),
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
                        headers: {
                            "User-Agent": "yourappname/1.0 (your@email.com)",
                        },
                    }),
                ]);

                if (!weatherRes.ok || !geoRes.ok) throw new Error("One or more requests failed");

                const weatherJson = await weatherRes.json();
                const geoJson = await geoRes.json();

                const city =
                    geoJson.address.city ||
                    geoJson.address.town ||
                    geoJson.address.village ||
                    geoJson.address.county ||
                    "Unknown";

                const current = weatherJson.current;

                const weatherData = {
                    current_condition: [{
                        temp_C: current.temperature_2m.toString(),
                        humidity: current.relative_humidity_2m.toString(),
                        weatherCode: current.weathercode.toString(),
                        weatherDesc: [{ value: getDescriptionFromCode(current.weathercode) }],
                        weatherIconUrl: [{ value: "" }],
                    }],
                    nearest_area: [{
                        areaName: [{ value: city }],
                    }],
                };

                setWeather(weatherData);
            } catch (err) {
                console.error("Weather fetch failed:", err);
                setError("weather.error.fetch");
            }
        };

        const weatherCodeMap: { [key: string]: string } = {
            "0": t("weather.codes.0"),
            "1": t("weather.codes.1"),
            "2": t("weather.codes.2"),
            "3": t("weather.codes.3"),
            "45": t("weather.codes.45"),
            "48": t("weather.codes.48"),
            "51": t("weather.codes.51"),
            "53": t("weather.codes.53"),
            "55": t("weather.codes.55"),
            "61": t("weather.codes.61"),
            "63": t("weather.codes.63"),
            "65": t("weather.codes.65"),
        };

        const getDescriptionFromCode = (code: number | string): string => {
            return weatherCodeMap[code.toString()] || "Unknown";
        };


        if (!navigator.geolocation) {
            setError("weather.error.unsupported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather(latitude, longitude);
            },
            (err) => {
                console.warn("Permission denied or error getting location:", err);
                setError("weather.error.permission");
            }
        );
    }, []);

    if (error) {
        return <div className="weather-card error">{t(error)}</div>;
    }

    if (!weather) {
        return <div className="weather-card">{t("weather.loading")}</div>;
    }

    const current = weather.current_condition[0];
    const city = weather.nearest_area[0].areaName[0].value;
    const temp = current.temp_C;
    const desc = current.weatherDesc[0].value;
    const humidity = current.humidity;
    const iconComponent = getWeatherIcon(current.weatherCode);

    return (
        <div className="weather-card">
            <div className="weather-header">
                <div className="weather-location">{city}</div>
                <div className="weather-description">{desc}</div>
            </div>
            <div className="weather-info">
                <div className="weather-icon">{iconComponent}</div>
                <div className="weather-temp">{temp}°C</div>
            </div>
            <div className="weather-humidity">{t("weather.humidity", {value: humidity})}</div>
        </div>
    );
};

export default WeatherCard;
