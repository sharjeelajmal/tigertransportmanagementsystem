'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteModalProps {
    isOpen: boolean;
    title?: string;
    description?: string;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}

export default function DeleteModal({
    isOpen,
    title = "Delete Item",
    description = "Are you sure you want to delete this item? This action cannot be undone.",
    onClose,
    onConfirm,
    isDeleting = false
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100"
                    >
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8" style={{ color: "var(--primary)" }} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                {description}
                            </p>

                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' }}
                                >
                                    {isDeleting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
