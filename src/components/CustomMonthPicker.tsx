"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CustomMonthPickerProps {
    value: string; // Format: YYYY-MM
    onChange: (value: string) => void;
    label?: string;
    className?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CustomMonthPicker({ value, onChange, label, className = "" }: CustomMonthPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse initial value YYYY-MM
    const initialYear = value ? parseInt(value.split("-")[0]) : new Date().getFullYear();

    const [viewYear, setViewYear] = useState(initialYear);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleMonthSelect = (monthIndex: number) => {
        const mm = String(monthIndex + 1).padStart(2, '0');
        onChange(`${viewYear}-${mm}`);
        setIsOpen(false);
    };

    const displayM = value ? MONTHS[parseInt(value.split("-")[1]) - 1] : "";
    const displayY = value ? value.split("-")[0] : "";

    return (
        <div className={`relative ${className}`} ref={ref}>
            {label && (
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    {label}
                </label>
            )}

            <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    setViewYear(initialYear);
                    setIsOpen(!isOpen);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 bg-white text-sm font-medium text-left transition-all duration-200 outline-none h-full"
                style={{
                    borderColor: isOpen ? "var(--primary)" : "#E5E7EB",
                    boxShadow: isOpen ? "0 0 0 4px rgba(181,1,4,0.07)" : "none",
                    color: value ? "#0D0D0D" : "#9CA3AF",
                }}
            >
                <div className="flex items-center gap-2">
                    <Calendar size={15} className={value ? "text-[var(--primary)]" : "text-gray-400"} />
                    <span className="truncate">{value ? `${displayM} ${displayY}` : "Select Month"}</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={15} style={{ color: isOpen ? "var(--primary)" : "#9CA3AF" }} />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 w-64 mt-2 bg-white rounded-2xl border border-gray-100 p-3 shadow-xl right-0 sm:left-0 sm:right-auto"
                        style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(181,1,4,0.06)" }}
                    >
                        <div className="flex items-center justify-between mb-4 px-1">
                            <button
                                type="button"
                                onClick={() => setViewYear(v => v - 1)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="font-bold text-gray-800">{viewYear}</span>
                            <button
                                type="button"
                                onClick={() => setViewYear(v => v + 1)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {MONTHS.map((m, i) => {
                                const isSelected = value === `${viewYear}-${String(i + 1).padStart(2, '0')}`;
                                return (
                                    <motion.button
                                        key={m}
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleMonthSelect(i)}
                                        className="py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer"
                                        style={{
                                            background: isSelected ? "var(--primary)" : "transparent",
                                            color: isSelected ? "#FFFFFF" : "#4B5563",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#F9FAFB";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                                        }}
                                    >
                                        {m}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
