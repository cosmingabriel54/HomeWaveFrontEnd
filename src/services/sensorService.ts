
export interface SensorData {
    temperatureC: number;
    temperatureF: number;
    humidity: number;
}

export const fetchSensorData = async (mac: string): Promise<SensorData | null> => {
    const normalizedMac = mac.replace(/:/g, '');
    try {
        const response = await fetch(
            `https://backendapi.ctce.ro/apicosmin/getsensordata?macAddress=${normalizedMac}`
        );
        if (!response.ok) return null;

        const data = await response.json();
        const celsius = parseFloat(data.temperature);
        const humidity = parseFloat(data.humidity);

        return {
            temperatureC: celsius,
            temperatureF: (celsius * 9) / 5 + 32,
            humidity,
        };
    } catch (err) {
        console.error("[fetchSensorData] Error:", err);
        return null;
    }
};

