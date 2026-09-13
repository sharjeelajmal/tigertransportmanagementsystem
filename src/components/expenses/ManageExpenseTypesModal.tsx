"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Edit2, Trash2, Check, AlertCircle, Loader2, Tag } from "lucide-react";
import { CategoryItem } from "./ManageCategoriesModal";

interface ManageExpenseTypesModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeCategoryName: string;
    categories: CategoryItem[];
    onTypesChanged: (newlyCreatedType?: string) => Promise<void> | void;
}

export default function ManageExpenseTypesModal({
    isOpen,
    onClose,
    activeCategoryName,
    categories,
    onTypesChanged,
}: ManageExpenseTypesModalProps) {
    const [selectedCategory, setSelectedCategory] = useState(activeCategoryName);
    const [newType, setNewType] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingType, setEditingType] = useState<string | null>(null);
    const [editTypeName, setEditTypeName] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [deletingType, setDeletingType] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (activeCategoryName) {
            setSelectedCategory(activeCategoryName);
        }
    }, [activeCategoryName]);

    if (!isOpen) return null;

    const currentCat = categories.find((c) => c.name === selectedCategory) || categories[0];
    const currentTypes = currentCat?.subtypes || [];

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newType.trim();
        if (!trimmed || !currentCat) return;
        setErrorMsg("");
        setIsAdding(true);

        try {
            const res = await fetch("/api/expenses/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "addType",
                    categoryId: currentCat._id,
                    categoryName: currentCat.name,
                    typeName: trimmed,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setNewType("");
                await onTypesChanged(trimmed);
            } else {
                setErrorMsg(data.error || "Failed to add expense type");
            }
        } catch {
            setErrorMsg("Network error");
        } finally {
            setIsAdding(false);
        }
    };

    const startEdit = (type: string) => {
        setEditingType(type);
        setEditTypeName(type);
        setErrorMsg("");
    };

    const cancelEdit = () => {
        setEditingType(null);
        setEditTypeName("");
    };

    const handleSaveEdit = async (oldType: string) => {
        const trimmed = editTypeName.trim();
        if (!trimmed || trimmed === oldType || !currentCat) {
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
                    action: "renameType",
                    id: currentCat._id,
                    categoryName: currentCat.name,
                    oldTypeName: oldType,
                    newTypeName: trimmed,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setEditingType(null);
                setEditTypeName("");
                await onTypesChanged();
            } else {
                setErrorMsg(data.error || "Failed to rename expense type");
            }
        } catch {
            setErrorMsg("Network error");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDelete = async (typeName: string) => {
        if (!currentCat) return;
        setErrorMsg("");
        setIsDeleting(true);

        try {
            const res = await fetch("/api/expenses/categories", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "deleteType",
                    id: currentCat._id,
                    categoryName: currentCat.name,
                    typeName,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setDeletingType(null);
                await onTypesChanged();
            } else {
                setErrorMsg(data.error || "Failed to delete expense type");
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
                            <Tag size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-900">Manage Expense Details / Types</h2>
                            <p className="text-xs text-gray-400">
                                Category: <strong className="text-gray-700">{selectedCategory}</strong>
                            </p>
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
                    {/* Category Selector if multiple categories */}
                    {categories.length > 1 && (
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                                Select Category
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((c) => {
                                    const isSelected = c.name === selectedCategory;
                                    return (
                                        <button
                                            key={c._id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategory(c.name);
                                                setErrorMsg("");
                                                cancelEdit();
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                                isSelected
                                                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                            }`}
                                        >
                                            {c.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Add Expense Type Form */}
                    <form onSubmit={handleAdd} className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Add New Expense Type to &quot;{selectedCategory}&quot;
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                placeholder="e.g. Fuel, Toll Tax, Courier, Supplies..."
                                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[var(--primary)] focus:shadow-[0_0_0_4px_rgba(var(--primary-rgb,181,1,4),0.07)]"
                            />
                            <button
                                type="submit"
                                disabled={isAdding || !newType.trim()}
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

                    {/* Existing Types List */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Expense Types in {selectedCategory} ({currentTypes.length})
                        </label>

                        {currentTypes.length === 0 ? (
                            <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                                No expense types found for this category. Add one above.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                                {currentTypes.map((type) => {
                                    const isEditingThis = editingType === type;
                                    const isConfirmingDelete = deletingType === type;

                                    return (
                                        <div
                                            key={type}
                                            className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-gray-50/70 transition-all"
                                        >
                                            {isEditingThis ? (
                                                <div className="flex-1 flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editTypeName}
                                                        onChange={(e) => setEditTypeName(e.target.value)}
                                                        className="flex-1 px-3 py-1.5 rounded-lg border-2 border-[var(--primary)] text-sm font-semibold text-gray-800 outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleSaveEdit(type)}
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
                                                        Delete &quot;{type}&quot;?
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => handleDelete(type)}
                                                            disabled={isDeleting}
                                                            className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700 transition-all cursor-pointer"
                                                        >
                                                            {isDeleting ? "..." : "Yes, Delete"}
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingType(null)}
                                                            className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-md hover:bg-gray-50 transition-all cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-sm font-bold text-gray-800 truncate">
                                                        {type}
                                                    </span>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => startEdit(type)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                                                            title="Rename Expense Type"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingType(type)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                                            title="Delete Expense Type"
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
                        )}
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
