"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Edit2, Trash2, Check, AlertCircle, Loader2, FolderPlus } from "lucide-react";

export interface CategoryItem {
    _id: string;
    name: string;
    subtypes: string[];
    isDefault?: boolean;
}

interface ManageCategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: CategoryItem[];
    onCategoriesChanged: (newlyCreatedName?: string) => Promise<void> | void;
}

export default function ManageCategoriesModal({
    isOpen,
    onClose,
    categories,
    onCategoriesChanged,
}: ManageCategoriesModalProps) {
    const [newName, setNewName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen) return null;

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) return;
        setErrorMsg("");
        setIsAdding(true);

        try {
            const res = await fetch("/api/expenses/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "createCategory", name: trimmed }),
            });
            const data = await res.json();
            if (data.success) {
                setNewName("");
                await onCategoriesChanged(trimmed);
            } else {
                setErrorMsg(data.error || "Failed to add category");
            }
        } catch {
            setErrorMsg("Network error");
        } finally {
            setIsAdding(false);
        }
    };

    const startEdit = (cat: CategoryItem) => {
        setEditingId(cat._id);
        setEditName(cat.name);
        setErrorMsg("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const handleSaveEdit = async (cat: CategoryItem) => {
        const trimmed = editName.trim();
        if (!trimmed || trimmed === cat.name) {
            cancelEdit();
            return;
        }
        setErrorMsg("");
        setIsSavingEdit(true);

        try {
            const res = await fetch("/api/expenses/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "renameCategory",
                    id: cat._id,
                    oldName: cat.name,
                    newName: trimmed,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setEditingId(null);
                setEditName("");
                await onCategoriesChanged();
            } else {
                setErrorMsg(data.error || "Failed to rename category");
            }
        } catch {
            setErrorMsg("Network error");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDelete = async (cat: CategoryItem) => {
        setErrorMsg("");
        setIsDeleting(true);

        try {
            const res = await fetch("/api/expenses/categories", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "deleteCategory",
                    id: cat._id,
                    name: cat.name,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setDeletingId(null);
                await onCategoriesChanged();
            } else {
                setErrorMsg(data.error || "Failed to delete category");
            }
        } catch {
            setErrorMsg("Network error");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20"
                            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                        >
                            <FolderPlus size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-900">Manage Expense Categories</h2>
                            <p className="text-xs text-gray-400">Add, rename, or delete custom categories</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Add Category Form */}
                    <form onSubmit={handleAdd} className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Add New Category
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Warehouse Expense, Marketing..."
                                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[var(--primary)] focus:shadow-[0_0_0_4px_rgba(var(--primary-rgb,181,1,4),0.07)]"
                            />
                            <button
                                type="submit"
                                disabled={isAdding || !newName.trim()}
                                className="px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                            >
                                {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Add
                            </button>
                        </div>
                    </form>

                    {errorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-600">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Existing Categories List */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Existing Categories ({categories.length})
                            </label>
                        </div>

                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden max-h-[320px] overflow-y-auto">
                            {categories.map((cat) => {
                                const isEditingThis = editingId === cat._id;
                                const isConfirmingDelete = deletingId === cat._id;

                                return (
                                    <div
                                        key={cat._id}
                                        className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-gray-50/70 transition-all"
                                    >
                                        {isEditingThis ? (
                                            <div className="flex-1 flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 px-3 py-1.5 rounded-lg border-2 border-[var(--primary)] text-sm font-semibold text-gray-800 outline-none"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSaveEdit(cat)}
                                                    disabled={isSavingEdit}
                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all cursor-pointer"
                                                    title="Save"
                                                >
                                                    {isSavingEdit ? (
                                                        <Loader2 size={15} className="animate-spin" />
                                                    ) : (
                                                        <Check size={15} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all cursor-pointer"
                                                    title="Cancel"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        ) : isConfirmingDelete ? (
                                            <div className="flex-1 flex items-center justify-between gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                                                <span className="text-xs font-bold text-red-700">
                                                    Delete &quot;{cat.name}&quot;?
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleDelete(cat)}
                                                        disabled={isDeleting}
                                                        className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700 transition-all cursor-pointer"
                                                    >
                                                        {isDeleting ? "..." : "Yes, Delete"}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingId(null)}
                                                        className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-md hover:bg-gray-50 transition-all cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="text-sm font-bold text-gray-800 truncate">
                                                        {cat.name}
                                                    </span>
                                                    {cat.isDefault && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                                                            Default
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        ({cat.subtypes?.length || 0} types)
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => startEdit(cat)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                                                        title="Rename Category"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingId(cat._id)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
