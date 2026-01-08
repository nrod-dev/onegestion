import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
    LabelList
} from "recharts";

const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatYAxis = (value) => {
    if (value === 0) return '0';
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'k'; // Fallback for small numbers if ever needed
    }
    return value;
};

const PERIOD_1_COLOR = "#3b82f6"; // Blue for primary period
const PERIOD_2_COLOR = "#8b5cf6"; // Purple for comparison period

const IncomeChart = ({
    data, // Expected format: { name: string, total: number, prevTotal?: number }[]
    compareMode,
    periodType, // "month" | "season"
    period1Label,
    period2Label
}) => {
    // Adapter logic to match v0 data structure if needed, or assume FinancialReports passes correct structure
    // The v0 component expects specific keys for season vs month.
    // We will adapt the props to work with the generic "data" array but using the v0 visual style.

    // If Season mode, we might need specific "Month Names" logic handled in parent or here.
    // For now, assuming 'data' comes with 'name' (label) and 'total' (value), and optional 'prevTotal'.

    if (periodType === "season") {
        return (
            <div className="h-[200px] sm:h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            className="fill-muted-foreground"
                        />
                        <YAxis
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatYAxis}
                            className="fill-muted-foreground"
                            width={50}
                        />
                        <Tooltip
                            formatter={(value, name) => [
                                formatCurrency(value),
                                name === "total" ? period1Label : period2Label,
                            ]}
                            contentStyle={{
                                backgroundColor: "oklch(1 0 0)", // White (approx)
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                fontSize: "12px",
                            }}
                            labelStyle={{ fontWeight: 600 }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Legend
                            formatter={(value) => (value === "total" ? period1Label : period2Label)}
                            wrapperStyle={{ fontSize: "11px" }}
                        />
                        <Bar dataKey="total" fill={PERIOD_1_COLOR} radius={[4, 4, 0, 0]} maxBarSize={35} name="total">
                            <LabelList dataKey="total" position="top" formatter={formatYAxis} style={{ fill: '#64748b', fontSize: '11px', fontWeight: 500 }} />
                        </Bar>
                        {compareMode && (
                            <Bar dataKey="prevTotal" fill={PERIOD_2_COLOR} radius={[4, 4, 0, 0]} maxBarSize={35} name="prevTotal">
                                <LabelList dataKey="prevTotal" position="top" formatter={formatYAxis} style={{ fill: '#64748b', fontSize: '11px', fontWeight: 500 }} />
                            </Bar>
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // Month Comparison (Bar) or Evolution (Area)
    if (compareMode) {
        return (
            <div className="h-[200px] sm:h-[280px] w-full [&_.recharts-surface]:outline-none">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            className="fill-muted-foreground"
                        />
                        <YAxis
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatYAxis}
                            className="fill-muted-foreground"
                            width={50}
                        />
                        <Tooltip
                            formatter={(value, name) => [
                                formatCurrency(value),
                                name
                            ]}
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                fontSize: "12px",
                            }}
                            labelStyle={{ fontWeight: 600 }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Bar
                            dataKey="total"
                            fill={PERIOD_1_COLOR}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                            name={period1Label ? period1Label.charAt(0).toUpperCase() + period1Label.slice(1) : ''}
                        >
                            <LabelList dataKey="total" position="top" formatter={formatYAxis} style={{ fill: '#64748b', fontSize: '11px', fontWeight: 500 }} />
                        </Bar>
                        <Bar
                            dataKey="prevTotal"
                            fill={PERIOD_2_COLOR}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                            name={period2Label ? period2Label.charAt(0).toUpperCase() + period2Label.slice(1) : ''}
                        >
                            <LabelList dataKey="prevTotal" position="top" formatter={formatYAxis} style={{ fill: '#64748b', fontSize: '11px', fontWeight: 500 }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // 6 Months Trend (Bar Chart) - Default View
    return (
        <div className="h-[200px] sm:h-[280px] w-full [&_.recharts-surface]:outline-none">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        className="fill-muted-foreground"
                    />
                    <YAxis
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatYAxis}
                        className="fill-muted-foreground"
                        width={50}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        formatter={(value) => [formatCurrency(value), "Ingresos"]}
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            fontSize: "12px",
                        }}
                        labelStyle={{ fontWeight: 600 }}
                    />
                    <Bar
                        dataKey="total"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                        name="Ingresos"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index === data.length - 1 ? "#3b82f6" : "#93c5fd"}
                                stroke={index === data.length - 1 ? "#2563eb" : "none"}
                                strokeWidth={index === data.length - 1 ? 2 : 0}
                                strokeDasharray={index === data.length - 1 ? "4 4" : ""}
                                fillOpacity={index === data.length - 1 ? 0.6 : 1}
                            />
                        ))}
                        <LabelList dataKey="total" position="top" formatter={formatYAxis} style={{ fill: '#64748b', fontSize: '11px', fontWeight: 500 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default IncomeChart;
