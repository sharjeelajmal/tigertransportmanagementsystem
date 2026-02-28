"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ChartItem {
    name: string;
    value: number;
}

interface Props {
    expenseBreakdown: ChartItem[];
    vehicleStatusBreakdown: ChartItem[];
    isLoading: boolean;
}

const EXPENSE_COLORS = ["var(--primary)", "#4F46E5", "#F59E0B", "#10B981", "#0891B2"];
const VEHICLE_COLORS = ["#10B981", "#EF4444", "#F59E0B", "#6B7280"];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
                <p className="text-xs font-bold text-gray-800">{payload[0].name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export default function DashboardChart({ expenseBreakdown, vehicleStatusBreakdown, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                        <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                        <div className="w-40 h-40 rounded-full bg-gray-100 mx-auto" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expenses Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
            >
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-light))" }} />
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4">Expenses Breakdown</h3>
                {expenseBreakdown.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-sm text-gray-400">No expense data this month</div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-36 h-36 md:w-44 md:h-44 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                        {expenseBreakdown.map((_, i) => (
                                            <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 flex-1">
                            {expenseBreakdown.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }} />
                                    <span className="text-xs text-gray-600 font-medium truncate">{item.name}</span>
                                    <span className="text-xs font-black text-gray-900 ml-auto whitespace-nowrap">{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Vehicle Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
            >
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4">Vehicle Status</h3>
                {vehicleStatusBreakdown.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-sm text-gray-400">No vehicle data</div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-36 h-36 md:w-44 md:h-44 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={vehicleStatusBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                        {vehicleStatusBreakdown.map((_, i) => (
                                            <Cell key={i} fill={VEHICLE_COLORS[i % VEHICLE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 flex-1">
                            {vehicleStatusBreakdown.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: VEHICLE_COLORS[i % VEHICLE_COLORS.length] }} />
                                    <span className="text-xs text-gray-600 font-medium truncate">{item.name}</span>
                                    <span className="text-xs font-black text-gray-900 ml-auto">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
