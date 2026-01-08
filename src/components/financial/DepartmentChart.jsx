import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const PERIOD_1_COLOR = "#3b82f6"; // Blue for primary period
const PERIOD_2_COLOR = "#8b5cf6"; // Purple for comparison period

const DepartmentChart = ({
    data, // { name: string, total: number, prevTotal?: number }[]
    compareMode,
    period1Label,
    period2Label
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-blue-500">≡</span>
                Ingresos por Departamento
            </h3>
            <div className="h-[180px] sm:h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            className="fill-muted-foreground"
                            width={100}
                        />
                        <YAxis
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            className="fill-muted-foreground"
                            width={40}
                        />
                        <Tooltip
                            formatter={(value, name) => [
                                formatCurrency(value),
                                compareMode ? (name === "total" ? period1Label : period2Label) : "Ingresos",
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
                        {compareMode && period2Label && (
                            <Legend
                                formatter={(value) => (value === "total" ? period1Label : period2Label)}
                                wrapperStyle={{ fontSize: "11px" }}
                            />
                        )}
                        <Bar
                            dataKey="total"
                            fill={PERIOD_1_COLOR}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={compareMode ? 25 : 40}
                            name="total"
                        />
                        {compareMode && (
                            <Bar dataKey="prevTotal" fill={PERIOD_2_COLOR} radius={[4, 4, 0, 0]} maxBarSize={25} name="prevTotal" />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DepartmentChart;
