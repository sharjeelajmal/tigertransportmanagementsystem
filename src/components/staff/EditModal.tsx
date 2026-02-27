'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';
import CustomDatePicker from '@/components/CustomDatePicker';

interface FieldConfig {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'select';
    options?: string[]; // For select inputs
    value: string | number | undefined;
}

interface EditModalProps {
    isOpen: boolean;
    title: string;
    fields: FieldConfig[];
    onClose: () => void;
    onSave: (data: Record<string, any>) => Promise<void>;
}

export default function EditModal({ isOpen, title, fields, onClose, onSave }: EditModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Initialize form data when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialData: Record<string, any> = {};
            fields.forEach(field => {
                initialData[field.name] = field.value || '';
            });
            setFormData(initialData);
        }
    }, [isOpen, fields]);

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Edit {title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid gap-5">
                                {fields.map((field) => (
                                    <div key={field.name} className="flex flex-col gap-1.5">
                                        {field.type === 'select' ? (
                                            <CustomDropdown
                                                label={field.label}
                                                options={field.options?.map(opt => ({ label: opt, value: opt })) || []}
                                                value={formData[field.name]}
                                                onChange={(val) => handleChange(field.name, val)}
                                                placeholder={`Select ${field.label}`}
                                                className="w-full"
                                            />
                                        ) : field.type === 'date' ? (
                                            <CustomDatePicker
                                                label={field.label}
                                                value={formData[field.name]}
                                                onChange={(date) => handleChange(field.name, date.toISOString())}
                                            />
                                        ) : (
                                            <>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                    {field.label}
                                                </label>
                                                <input
                                                    type={field.type || 'text'}
                                                    value={formData[field.name]}
                                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] transition-all disabled:opacity-50"
                                                />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition-colors"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' }}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
