import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import axios from "axios";
import {useTranslation} from "react-i18next";

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

const LightGraph = ({ mac }: LightGraphProps) => {
    const [data, setData] = useState<GraphPoint[]>([]);
    const [unit, setUnit] = useState<"watts" | "mA" | "voltage" | "duty">("watts");
    const [label, setLabel] = useState<"s" | "m" | "h">("s");
    const { t } = useTranslation();

    useEffect(() => {
        fetchGraphData();
    }, [mac]);

    const fetchGraphData = async () => {
        try {
            const res = await axios.get(`https://backendapi.ctce.ro/apicosmin/getcycledata?macAddress=${mac.replace(/:/g, "")}`);
            const raw = res.data;
            if (!Array.isArray(raw)) return;

            const MAX_VOLTAGE = 3.3;
            const RESISTANCE = 47.0;
            let time = 0;
            let fullTime = 0;

            const tempPoints: GraphPoint[] = [];

            raw.forEach((entry: any) => {
                const duty = parseFloat(entry.duty_cycle);
                const duration = parseFloat(entry.duration_seconds);
                const voltage = (duty / 100) * MAX_VOLTAGE;
                const watts = (voltage * voltage) / RESISTANCE;
                const current = Math.sqrt(watts * 1000 / RESISTANCE);

                const tStart = time;
                const tEnd = time + duration;
                fullTime += duration;

                tempPoints.push({ time: tStart, watts, voltage, mA: current, duty });
                tempPoints.push({ time: tEnd, watts, voltage, mA: current, duty });

                time = tEnd;
            });

            // Now determine time label based on total full time
            let timeLabel: "s" | "m" | "h";
            let scale: number;

            if (fullTime > 86400) { // more than 24h
                timeLabel = "h";
                scale = 3600;
            } else if (fullTime > 3600) {
                timeLabel = "m";
                scale = 60;
            } else {
                timeLabel = "s";
                scale = 1;
            }

            setLabel(timeLabel);
            setData(tempPoints.map(p => ({ ...p, time: p.time / scale })));

        } catch (e) {
            console.error("Failed to fetch light graph data", e);
        }
    };

    const unitLabel = unit === "watts" ? "W" : unit === "mA" ? "mA" : unit === "voltage" ? "V" : "%";

    return (
        <div className="graph-wrapper" style={{ background: "#1f1f1f", padding: 20, borderRadius: 12 }}>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                <h3 style={{color: "white"}}>{t("lightGraph.title")}</h3>
                <select value={unit} onChange={(e) => setUnit(e.target.value as any)} style={{ padding: 6, borderRadius: 6 }}>
                    <option value="watts">Watts</option>
                    <option value="mA">mA</option>
                    <option value="voltage">Voltage</option>
                    <option value="duty">Duty</option>
                </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                        type="number"
                        dataKey="time"
                        stroke="#ccc"
                        tickFormatter={(v) => `${parseFloat(v.toFixed(1))}${label}`}
                    />

                    <YAxis
                        stroke="#ccc"
                        domain={["auto", "auto"]}
                        tickFormatter={(v) => `${parseFloat(v.toFixed(2))}${unitLabel}`}
                    />
                    <Tooltip
                        formatter={(value: any) => `${parseFloat(value.toFixed(2))} ${unitLabel}`}
                    />
                    <Legend />
                    <Line
                        type="linear"
                        dataKey={unit}
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
