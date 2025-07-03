import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useTranslation } from "react-i18next";

interface LightGraphProps {
    mac: string;
}

interface GraphPoint {
    time: number;
    watts: number;
    voltage?: number;
    mA?: number;
    duty?: number;
}

interface DayEntry {
    data: string;
    consum: string | number;
}

interface WeekEntry {
    zile?: DayEntry[];
}

interface ApiResponse {
    saptamani?: WeekEntry[];
}

const LightGraph = ({ mac }: LightGraphProps) => {
    const [data, setData] = useState<GraphPoint[]>([]);
    const [unit, setUnit] = useState<"Wh" | "mWh">("mWh");
    const [isFull, setIsFull] = useState<boolean>(true);
    const [dates, setDates] = useState<string[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        fetchGraphData();
    }, [mac, isFull]);

    useEffect(() => {
        if (!data.length) return;
        setData(prev =>
            prev.map(p => ({
                ...p,
                watts: unit === "Wh" ? p.watts / 1000 : p.watts * 1000,
            }))
        );
    }, [unit]);

    const fetchGraphData = async () => {
        try {
            const res = await axios.get<ApiResponse>(
                `https://backendapi.ctce.ro/apicosmin/getcycledata?full=${isFull ? 1 : 0}&macAddress=${mac.replace(/:/g, "")}`
            );

            const parsed = res.data;
            const weeks = parsed.saptamani ?? [];
            const dailyData: { date: string; consum: number }[] = [];

            weeks.forEach((week: WeekEntry) => {
                const zile = week.zile ?? [];
                zile.forEach((zi: DayEntry) => {
                    const dateStr = zi.data;
                    const raw = parseFloat(typeof zi.consum === "string" ? zi.consum : zi.consum.toString());
                    const consum = isNaN(raw) || raw < 0 ? 0 : raw;
                    dailyData.push({ date: dateStr, consum });
                });
            });

            dailyData.sort((a, b) => a.date.localeCompare(b.date));
            setDates(dailyData.map(d => d.date.slice(5)));

            const points: GraphPoint[] = dailyData.map((entry, index) => ({
                time: index,
                watts: entry.consum,
            }));

            setData(points);
        } catch (e) {
            console.error("Failed to fetch new graph data", e);
        }
    };

    const unitLabel = unit === "Wh" ? "W" : "mWh";

    return (
        <div className="graph-wrapper" style={{ background: "#1f1f1f", padding: 20, borderRadius: 12 }}>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ color: "white" }}>{t("lightGraph.title")}</h3>
                <div style={{ display: "flex", gap: 8 }}>
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value as "Wh" | "mWh")}
                        style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: "#ff5722",
                            color: "white",
                            border: "none",
                        }}
                    >
                        <option value="Wh">Wh</option>
                        <option value="mWh">mWh</option>
                    </select>
                    <select
                        value={isFull ? "full" : "week"}
                        onChange={(e) => setIsFull(e.target.value === "full")}
                        style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: "#ff5722",
                            color: "white",
                            border: "none",
                        }}
                    >
                        <option value="week">{t("lightGraph.lastWeek")}</option>
                        <option value="full">{t("lightGraph.fullHistory")}</option>
                    </select>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>

                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                        type="number"
                        dataKey="time"
                        stroke="#ccc"
                        tickFormatter={(v: number) => {
                            const idx = Math.floor(v);
                            return idx >= 0 && idx < dates.length ? dates[idx] : "";
                        }}
                        interval={0}
                    />

                    <YAxis
                        stroke="#ccc"
                        domain={["auto", "auto"]}
                        tickMargin={8}
                        tickFormatter={(v: number) => `${parseFloat(v.toFixed(2))}${unitLabel}`}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const idx = Math.floor(payload[0].payload.time);
                            return (
                                <div style={{
                                    backgroundColor: "#fff",
                                    padding: 10,
                                    borderRadius: 6,
                                    color: "#000",
                                    fontSize: 14,
                                    textAlign: "left"
                                }}>
                                    <div><strong style={{color: "#000", fontSize: 14}}>T:</strong> {dates[idx] ?? ""}
                                    </div>
                                    <div>
                                        <strong style={{color: "#000", fontSize: 14}}>P:</strong>{" "}
                                        {(payload[0].value as number).toFixed(unit === "mWh" ? 0 : 2)} {unitLabel}
                                    </div>

                                </div>
                            );
                        }}
                    />

                    <Line
                        type="monotone"
                        dataKey="watts"
                        stroke="#ff5722"
                        dot={false}
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LightGraph;
