'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomTimePickerProps {
    value: string; // Format: HH:mm (24h)
    onChange: (time: string) => void;
    placeholder?: string;
    className?: string;
}

export default function CustomTimePicker({ value, onChange, placeholder = "Select Time", className = "" }: CustomTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<"hours" | "minutes">("hours");
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial state from value
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [meridiem, setMeridiem] = useState("AM");

    useEffect(() => {
        if (value && value.includes(':')) {
            const [hStr, mStr] = value.split(':');
            const h = parseInt(hStr);
            setHour(h % 12 || 12);
            setMinute(parseInt(mStr));
            setMeridiem(h >= 12 ? "PM" : "AM");
        }
    }, [value, isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleConfirm = (newHour?: number, newMin?: number, newMer?: string) => {
        const h = newHour !== undefined ? newHour : hour;
        const m = newMin !== undefined ? newMin : minute;
        const mer = newMer !== undefined ? newMer : meridiem;

        let finalHour = h;
        if (mer === "PM" && finalHour < 12) finalHour += 12;
        if (mer === "AM" && finalHour === 12) finalHour = 0;

        onChange(`${String(finalHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    };

    const formatDisplay = () => {
        if (!value) return placeholder;
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${meridiem}`;
    };

    const handleClockClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);

        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        if (view === "hours") {
            let h = Math.round(angle / 30);
            if (h === 0) h = 12;
            setHour(h);
            setTimeout(() => setView("minutes"), 300);
        } else {
            let m = Math.round(angle / 6);
            if (m === 60) m = 0;
            setMinute(m);
        }
    };

    return (
        <div className={`relative z-[20] ${className}`} ref={containerRef}>
            <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)] transition-all cursor-pointer h-full"
                style={{
                    borderColor: isOpen ? "var(--primary)" : "#F3F4F6",
                    boxShadow: isOpen ? "0 0 0 4px rgba(var(--primary-rgb, 181,1,4),0.05)" : "none",
                }}
            >
                <div className="flex items-center gap-2">
                    <Clock size={16} className={value ? "text-[var(--primary)]" : "text-gray-400"} />
                    <span className={value ? "text-gray-900" : "text-gray-400"}>{formatDisplay()}</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-[100] mt-2 bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-6 w-[280px] left-0 md:left-auto md:right-0"
                    >
                        {/* Time Display & AM/PM */}
                        <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMeridiem("AM")}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${meridiem === "AM" ? "bg-[var(--primary)] text-white shadow-lg shadow-red-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                                >
                                    AM
                                </button>
                                <button
                                    onClick={() => setMeridiem("PM")}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${meridiem === "PM" ? "bg-[var(--primary)] text-white shadow-lg shadow-red-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                                >
                                    PM
                                </button>
                            </div>

                            <div className="flex items-center gap-1 font-black text-3xl text-gray-900">
                                <button
                                    onClick={() => setView("hours")}
                                    className={`transition-colors h-14 w-14 rounded-2xl flex items-center justify-center ${view === "hours" ? "bg-gray-50 text-[var(--primary)]" : "hover:text-[var(--primary)] cursor-pointer"}`}
                                >
                                    {String(hour).padStart(2, "0")}
                                </button>
                                <span className="opacity-20 animate-pulse">:</span>
                                <button
                                    onClick={() => setView("minutes")}
                                    className={`transition-colors h-14 w-14 rounded-2xl flex items-center justify-center ${view === "minutes" ? "bg-gray-50 text-[var(--primary)]" : "hover:text-[var(--primary)] cursor-pointer"}`}
                                >
                                    {String(minute).padStart(2, "0")}
                                </button>
                            </div>
                        </div>

                        {/* Clock Face */}
                        <div
                            onClick={handleClockClick}
                            className="relative w-48 h-48 mx-auto bg-gray-50 rounded-full flex items-center justify-center shadow-inner mb-6 border-4 border-white ring-1 ring-gray-100 cursor-pointer"
                        >
                            {/* Center Point */}
                            <div className="absolute w-2.5 h-2.5 bg-[var(--primary)] rounded-full z-20 shadow-sm" />

                            {/* Hand */}
                            <motion.div
                                className="absolute bottom-1/2 left-1/2 w-0.5 origin-bottom bg-[var(--primary)] z-10"
                                animate={{
                                    rotate: view === "hours" ? (hour * 30) : (minute * 6),
                                    height: view === "hours" ? "40%" : "50%"
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--primary)] rounded-full shadow-md" />
                            </motion.div>

                            {/* Numbers */}
                            {(view === "hours" ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]).map((num, i) => {
                                const angle = (i * 30) * (Math.PI / 180);
                                const radius = 72; // pixels
                                const x = Math.sin(angle) * radius;
                                const y = -Math.cos(angle) * radius;
                                const isSelected = view === "hours" ? hour === num : minute === num;

                                return (
                                    <span
                                        key={num}
                                        className={`absolute w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-black transition-all ${isSelected ? "bg-[var(--primary)] text-white shadow-lg shadow-red-100 z-10" : "text-gray-400 group-hover:text-gray-900"}`}
                                        style={{ transform: `translate(${x}px, ${y}px)` }}
                                    >
                                        {view === "minutes" && num === 0 ? "00" : num}
                                    </span>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleConfirm();
                                    setIsOpen(false);
                                }}
                                className="flex-1 py-3 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-100 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
