"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const visiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
        <div className="flex items-center justify-center gap-2 py-4">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{
                    background: currentPage === 1 ? "rgba(107,114,128,0.1)" : "rgba(181,1,4,0.08)",
                    color: currentPage === 1 ? "#6B7280" : "#B50104",
                }}
            >
                <ChevronLeft size={18} />
            </motion.button>

            {startPage > 1 && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPageChange(1)}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                        style={{
                            background: "transparent",
                            color: "#6B7280",
                        }}
                    >
                        1
                    </motion.button>
                    {startPage > 2 && <span className="text-gray-400 font-bold px-1">...</span>}
                </>
            )}

            {pages.map((page) => (
                <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(page)}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-sm"
                    style={
                        currentPage === page
                            ? {
                                background: "linear-gradient(135deg, #B50104, #8B0003)",
                                color: "#FFFFFF",
                                boxShadow: "0 4px 12px rgba(181,1,4,0.3)",
                            }
                            : {
                                background: "transparent",
                                color: "#6B7280",
                            }
                    }
                >
                    {page}
                </motion.button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="text-gray-400 font-bold px-1">...</span>}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPageChange(totalPages)}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                        style={{
                            background: "transparent",
                            color: "#6B7280",
                        }}
                    >
                        {totalPages}
                    </motion.button>
                </>
            )}

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{
                    background: currentPage === totalPages ? "rgba(107,114,128,0.1)" : "rgba(181,1,4,0.08)",
                    color: currentPage === totalPages ? "#6B7280" : "#B50104",
                }}
            >
                <ChevronRight size={18} />
            </motion.button>
        </div>
    );
}
