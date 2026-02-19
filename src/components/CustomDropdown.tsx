"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    className?: string;
}

export default function CustomDropdown({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    label,
    required,
    className = "",
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

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

    return (
        <div className={`relative ${className}`} ref={ref}>
            {label && (
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {label}
                    {required && <span className="text-[#B50104] ml-0.5">*</span>}
                </label>
            )}

            {/* Trigger */}
            <motion.button
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 bg-white text-sm font-medium text-left transition-all duration-200 outline-none"
                style={{
                    borderColor: isOpen ? "#B50104" : "#E5E7EB",
                    boxShadow: isOpen ? "0 0 0 4px rgba(181,1,4,0.07)" : "none",
                    color: selected ? "#0D0D0D" : "#9CA3AF",
                }}
            >
                <span className="truncate">{selected ? selected.label : placeholder}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex-shrink-0 ml-2"
                >
                    <ChevronDown
                        size={16}
                        style={{ color: isOpen ? "#B50104" : "#9CA3AF" }}
                    />
                </motion.div>
            </motion.button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-1.5 bg-white rounded-2xl border border-gray-100 overflow-hidden"
                        style={{
                            boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(181,1,4,0.06)",
                        }}
                    >
                        <div className="p-1.5">
                            {options.map((option, i) => {
                                const isSelected = option.value === value;
                                return (
                                    <motion.button
                                        key={option.value}
                                        type="button"
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150"
                                        style={{
                                            background: isSelected ? "rgba(181,1,4,0.07)" : "transparent",
                                            color: isSelected ? "#B50104" : "#374151",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected)
                                                (e.currentTarget as HTMLElement).style.background = "#F9FAFB";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected)
                                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                        }}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                            >
                                                <Check size={15} style={{ color: "#B50104" }} />
                                            </motion.div>
                                        )}
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
