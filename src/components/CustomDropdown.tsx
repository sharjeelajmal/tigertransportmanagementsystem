"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search } from "lucide-react";

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
    searchable?: boolean;
    isLoading?: boolean;
}

export default function CustomDropdown({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    label,
    required,
    className = "",
    searchable = false,
    isLoading = false,
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchTerm(""); // reset search on close
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filteredOptions = useMemo(() => {
        if (!searchable || !searchTerm) return options;
        const lowerTerm = searchTerm.toLowerCase();
        return options.filter(opt => opt.label.toLowerCase().includes(lowerTerm));
    }, [options, searchable, searchTerm]);

    return (
        <div className={`relative ${className}`} ref={ref}>
            {label && (
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {label}
                    {required && <span style={{ color: "var(--primary)" }} className="ml-0.5">*</span>}
                </label>
            )}

            {/* Trigger */}
            <motion.button
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 bg-white text-sm font-medium text-left transition-all duration-200 outline-none"
                style={{
                    borderColor: isOpen ? "var(--primary)" : "#E5E7EB",
                    boxShadow: isOpen ? "0 0 0 4px rgba(var(--primary-rgb, 181,1,4),0.07)" : "none",
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
                        style={{ color: isOpen ? "var(--primary)" : "#9CA3AF" }}
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
                            boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(var(--primary-rgb, 181,1,4),0.06)",
                        }}
                    >
                        <div className="p-1.5 flex flex-col max-h-64">
                            {searchable && (
                                <div className="p-1 border-b border-gray-100 mb-1 sticky top-0 bg-white z-10">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all outline-none"
                                            onClick={(e) => e.stopPropagation()} // Prevent close
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="overflow-y-auto custom-scrollbar">
                                {isLoading ? (
                                    <div className="px-4 py-6 flex flex-col items-center gap-2">
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor: "var(--primary)" }} />
                                        <span className="text-xs text-gray-400 font-medium">Loading...</span>
                                    </div>
                                ) : filteredOptions.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
                                ) : (
                                    filteredOptions.map((option, i) => {
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
                                                    background: isSelected ? "rgba(var(--primary-rgb, 181,1,4),0.07)" : "transparent",
                                                    color: isSelected ? "var(--primary)" : "#374151",
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
                                                        <Check size={15} style={{ color: "var(--primary)" }} />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
