import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const MonthSelector = ({ currentDate, onDateChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Generate options: Start from December 2025 onwards (next 24 months)
    const monthOptions = [];
    const startDate = new Date(2025, 11, 1); // Month is 0-indexed: 11 = December

    for (let i = 0; i <= 24; i++) {
        monthOptions.push(addMonths(startDate, i));
    }

    const handleSelect = (date) => {
        onDateChange(date);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-blue-200 shadow-sm hover:border-blue-400 transition-colors group"
            >
                <div className="flex items-center gap-2 text-slate-700">
                    <Calendar size={18} className="text-brand-600" />
                    <span className="text-sm font-semibold capitalize">
                        {format(currentDate, 'MMM yyyy', { locale: es })}
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 max-h-64 overflow-y-auto bg-white rounded-xl border border-slate-100 shadow-lg z-50 py-1">
                    {monthOptions.map((date) => {
                        const isSelected = format(date, 'yyyy-MM') === format(currentDate, 'yyyy-MM');
                        return (
                            <button
                                key={date.toString()}
                                onClick={() => handleSelect(date)}
                                className={`w-full text-left px-4 py-2.5 text-sm capitalize transition-colors
                                    ${isSelected
                                        ? 'bg-brand-600 text-white font-medium'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {format(date, 'MMMM yyyy', { locale: es })}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MonthSelector;
