export const fetchThermostatStatus = async (mac: string): Promise<number | null> => {
    try {
        const response = await fetch(`https://backendapi.ctce.ro/apicosmin/getthermostatstatus?mac_address=${mac}`);
        if (response.ok) {
            const value = await response.text();
            return parseFloat(value);
        }
    } catch (err) {
        console.error("[fetchThermostatStatus] Error:", err);
    }
    return null;
};

export const updateThermostatTarget = async (mac: string, newTemp: number) => {
    try {
        const url = `https://backendapi.ctce.ro/apicosmin/changethermostat?temp=${newTemp.toFixed(1)}&mac_address=${mac}`;
        await fetch(url, { method: "POST" });
    } catch (err) {
        console.error("[updateThermostatTarget] Error:", err);
    }
};
