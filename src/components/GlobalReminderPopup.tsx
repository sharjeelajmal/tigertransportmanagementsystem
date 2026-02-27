"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertTriangle } from "lucide-react";

interface Reminder {
    _id: string;
    details: string;
    reminderTime: string;
}

export default function GlobalReminderPopup() {
    const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
    const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const checkReminders = async () => {
            try {
                const res = await fetch("/api/reminders?filter=approaching");
                const data = await res.json();
                if (data.success) {
                    const now = new Date();
                    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    const todayStr = now.toISOString().split('T')[0];

                    const currentReminder = data.data.find((r: any) => {
                        const rDate = r.reminderDate.split('T')[0];
                        return rDate === todayStr && r.reminderTime === currentTimeStr && !notifiedIds.has(r._id);
                    });

                    if (currentReminder) {
                        setActiveReminder(currentReminder);
                        setNotifiedIds(prev => new Set(prev).add(currentReminder._id));
                        // Play a subtle sound if possible or just show popup
                    }
                }
            } catch (error) {
                console.error("Error checking reminders for popup:", error);
            }
        };

        const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [notifiedIds]);

    return (
        <AnimatePresence>
            {activeReminder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setActiveReminder(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100"
                    >
                        <div className="bg-[var(--primary)] p-8 flex flex-col items-center text-center text-white relative overflow-hidden">
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-md"
                            >
                                <Bell size={32} className="text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Reminder Alert!</h2>
                            <p className="text-white/80 text-xs font-bold mt-1 uppercase tracking-widest">Time for your scheduled task</p>

                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        </div>

                        <div className="p-8">
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl mb-6 border border-gray-100">
                                <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" size={20} />
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Details</p>
                                    <p className="text-gray-800 font-bold leading-relaxed">{activeReminder.details}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setActiveReminder(null)}
                                    className="flex-1 px-6 py-4 rounded-xl bg-gray-100 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => {
                                        // Optional: mark as done
                                        setActiveReminder(null);
                                    }}
                                    className="flex-[2] px-6 py-4 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-100 cursor-pointer"
                                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                                >
                                    Okay, Got it!
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveReminder(null)}
                            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
