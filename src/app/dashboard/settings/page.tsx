"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, RotateCcw } from "lucide-react";
import { applyThemeColors, resetThemeColors, DEFAULT_PRIMARY } from "@/components/ThemeProvider";

export default function SettingsPage() {
    const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);

    const palettes = [
        { name: "Crimson Red", value: "var(--primary)" },
        { name: "Ocean Blue", value: "#0284c7" },
        { name: "Emerald Green", value: "#059669" },
        { name: "Royal Purple", value: "#7c3aed" },
        { name: "Sunset Orange", value: "#ea580c" },
        { name: "Slate Grey", value: "#475569" },
        { name: "Deep Teal", value: "#0d9488" },
        { name: "Hot Pink", value: "#db2777" },
    ];

    useEffect(() => {
        const saved = localStorage.getItem("appThemeColor");
        if (saved) setPrimaryColor(saved);
    }, []);

    const handleThemeChange = (color: string) => {
        setPrimaryColor(color);
        localStorage.setItem("appThemeColor", color);
        applyThemeColors(color);
    };

    const handleReset = () => {
        setPrimaryColor(DEFAULT_PRIMARY);
        resetThemeColors();
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* ── Page Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
            >
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">Manage application preferences and appearance.</p>
                </div>
            </motion.div>

            {/* ── Appearance Settings Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `rgba(var(--primary-rgb, 181,1,4), 0.08)` }}
                        >
                            <Palette className="w-5 h-5" style={{ color: "var(--primary, #B50104)" }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Appearance</h2>
                            <p className="text-sm text-gray-500">Customize the main theme color of the application.</p>
                        </div>
                    </div>

                    {/* Reset Button */}
                    {primaryColor !== DEFAULT_PRIMARY && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer border border-gray-200"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset to Default
                        </motion.button>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700 block">Primary Theme Color</label>
                    <div className="flex flex-wrap gap-4">
                        {palettes.map((p) => (
                            <button
                                key={p.name}
                                onClick={() => handleThemeChange(p.value)}
                                className={`w-12 h-12 rounded-full cursor-pointer transition-transform duration-200 border-4 ${primaryColor === p.value ? 'scale-110 shadow-md border-white ring-2' : 'border-transparent hover:scale-105'}`}
                                style={{
                                    backgroundColor: p.value,
                                    boxShadow: primaryColor === p.value ? `0 0 0 2px white, 0 0 0 4px ${p.value}` : 'none'
                                }}
                                title={p.name}
                            />
                        ))}
                    </div>

                    <div className="mt-6">
                        <label className="text-sm font-bold text-gray-700 block mb-2">Custom Hex Code</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => handleThemeChange(e.target.value)}
                                className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => handleThemeChange(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 uppercase outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
