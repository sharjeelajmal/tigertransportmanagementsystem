'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface CustomDatePickerProps {
    value?: string | Date;
    onChange: (date: Date) => void;
    label?: string;
    required?: boolean;
}

type ViewMode = 'days' | 'months' | 'years';

export default function CustomDatePicker({ value, onChange, label, required }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('days');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedDate = value ? new Date(value) : null;
    const today = new Date();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setViewMode('days'); // Reset view on close
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrev = () => {
        if (viewMode === 'days') {
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
        } else if (viewMode === 'years') {
            setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
        } else {
            setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'days') {
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
        } else if (viewMode === 'years') {
            setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
        } else {
            setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
        }
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const offset = newDate.getTimezoneOffset();
        const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));

        onChange(newDate);
        setIsOpen(false);
    };

    const handleYearClick = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setViewMode('months');
    };

    const handleMonthClick = (month: number) => {
        setViewDate(new Date(viewDate.getFullYear(), month, 1));
        setViewMode('days');
    };

    const formatDate = (d: Date | null) => {
        if (!d) return '';
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const days = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        const weeks = [];
        let week = [];

        for (let i = 0; i < startDay; i++) {
            week.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        for (let day = 1; day <= days; day++) {
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

            const isToday = today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;

            week.push(
                <button
                    type="button"
                    key={day}
                    onClick={(e) => { e.preventDefault(); handleDateClick(day); }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                        ${isSelected ? 'bg-[#B50104] text-white shadow-md' : 'text-gray-700 hover:bg-red-50 hover:text-[#B50104]'}
                        ${isToday && !isSelected ? 'border border-[#B50104] text-[#B50104]' : ''}
                    `}
                >
                    {day}
                </button>
            );

            if (week.length === 7) {
                weeks.push(<div key={`week-${day}`} className="flex justify-between mb-1">{week}</div>);
                week = [];
            }
        }

        if (week.length > 0) {
            while (week.length < 7) {
                week.push(<div key={`empty-end-${week.length}`} className="w-8 h-8" />);
            }
            weeks.push(<div key="last-week" className="flex justify-between mb-1">{week}</div>);
        }

        return (
            <>
                <div className="flex justify-between mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <span key={d} className="w-8 text-center text-[10px] font-bold text-gray-400 uppercase">
                            {d}
                        </span>
                    ))}
                </div>
                <div>{weeks}</div>
            </>
        );
    };

    const renderMonths = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return (
            <div className="grid grid-cols-3 gap-2">
                {months.map((m, i) => (
                    <button
                        type="button"
                        key={m}
                        onClick={() => handleMonthClick(i)}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors
                            ${viewDate.getMonth() === i ? 'bg-[#B50104] text-white' : 'hover:bg-gray-100 text-gray-700'}
                        `}
                    >
                        {m}
                    </button>
                ))}
            </div>
        );
    };

    const renderYears = () => {
        const currentYear = viewDate.getFullYear();
        const startYear = currentYear - 6;
        const years = [];
        for (let i = 0; i < 12; i++) {
            years.push(startYear + i);
        }

        return (
            <div className="grid grid-cols-3 gap-2">
                {years.map((y) => (
                    <button
                        type="button"
                        key={y}
                        onClick={() => handleYearClick(y)}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors
                            ${viewDate.getFullYear() === y ? 'bg-[#B50104] text-white' : 'hover:bg-gray-100 text-gray-700'}
                        `}
                    >
                        {y}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {label && (
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {label}
                    {required && <span className="text-[#B50104] ml-0.5">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 bg-white text-sm font-medium transition-all duration-200 outline-none
                    ${isOpen ? 'border-[#B50104] shadow-[0_0_0_4px_rgba(181,1,4,0.07)]' : 'border-gray-200'}
                `}
            >
                <span className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedDate ? formatDate(selectedDate) : 'Select Date'}
                </span>
                <CalendarIcon size={16} className={isOpen ? 'text-[#B50104]' : 'text-gray-400'} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72 left-0 sm:left-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button type="button" onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex items-center gap-1 font-bold text-gray-800 text-sm">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('months')}
                                    className={`px-2 py-1 rounded hover:bg-gray-100 transition-colors ${viewMode === 'months' ? 'text-[#B50104]' : ''}`}
                                >
                                    {viewDate.toLocaleDateString('en-US', { month: 'short' })}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('years')}
                                    className={`px-2 py-1 rounded hover:bg-gray-100 transition-colors ${viewMode === 'years' ? 'text-[#B50104]' : ''}`}
                                >
                                    {viewDate.getFullYear()}
                                </button>
                            </div>

                            <button type="button" onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-72 overflow-y-auto custom-scrollbar">
                            {viewMode === 'days' && renderDays()}
                            {viewMode === 'months' && renderMonths()}
                            {viewMode === 'years' && renderYears()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
