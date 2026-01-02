import React, { useMemo } from 'react';
import { format, getDaysInMonth, getDate, isSameDay, parseISO } from 'date-fns';

const OccupancyMatrix = ({ currentDate, departments, reservations, className = '' }) => {
    const daysInMonth = useMemo(() => {
        const daysCount = getDaysInMonth(currentDate);
        return Array.from({ length: daysCount }, (_, i) => i + 1);
    }, [currentDate]);

    // Create a lookup map for faster access: "deptId-day" -> isOccupied
    const occupancyMap = useMemo(() => {
        const map = new Set();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        reservations.forEach(res => {
            const start = parseISO(res.fecha_entrada);
            const end = parseISO(res.fecha_salida);

            // Iterate through days properly? 
            // Better: loop through each day of the month and check if it has a reservation?
            // Or loop through reservations and mark days? 
            // For Matrix, we usually iterate cells. 
            // Let's pre-process reservations into ranges or sets of dates.

            // Allow for cross-month reservations, so we check overlap.
            // A reservation overlaps the day if:
            // start <= currentDay AND end > currentDay (assuming checkout day is free for next guest usually? 
            // Standard hotel logic: night of 'day' is occupied.
            // If check-in is day 1 and check-out is day 3: Nights of 1 and 2 are occupied. Day 3 is checkout (free for next checkin).

            // Loop through the days of the selected month
            for (let day = 1; day <= getDaysInMonth(currentDate); day++) {
                const currentDayDate = new Date(year, month, day);
                // Reset time to avoid timezone issues affecting comparison if dates have times
                currentDayDate.setHours(0, 0, 0, 0);

                // Check reservation overlap without time zone shifts
                // Parse reservation dates as local strings YYYY-MM-DD
                const resStartStr = res.fecha_entrada; // YYYY-MM-DD
                const resEndStr = res.fecha_salida; // YYYY-MM-DD

                const currentDayStr = format(currentDayDate, 'yyyy-MM-dd');

                if (resStartStr <= currentDayStr && resEndStr > currentDayStr) {
                    map.add(`${res.departamento_id}-${day}`);
                }
            }
        });
        return map;
    }, [currentDate, reservations]);

    // Calculate totals
    const totalSlots = departments.length * daysInMonth.length;
    const occupiedSlots = occupancyMap.size;
    const freeSlots = totalSlots - occupiedSlots;

    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
            <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-bold text-lg text-slate-900">Ocupación por unidad</h3>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                            <span className="text-slate-600">
                                Ocupado <span className="font-semibold text-slate-900">({occupiedSlots})</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></div>
                            <span className="text-slate-600">
                                Libre <span className="font-semibold text-slate-900">({freeSlots})</span>
                            </span>
                        </div>
                    </div>
                </div>
                {/* Fixed Header Label */}
                <div className="mt-4 pl-[60px] text-center text-[10px] uppercase tracking-wider font-semibold text-slate-400 hidden sm:block">
                    Días del mes
                </div>
                {/* Mobile version could just be centered or hidden if space is tight, but user asked for it. 
                   Let's make it visible always as requested, adjusting padding/margin. 
                   Actually, user said "el header que dice Dias del mes este fijo".
                */}
                <div className="mt-4 pl-[60px] text-center text-[10px] uppercase tracking-wider font-semibold text-slate-400 sm:hidden">
                    Días del mes
                </div>
            </div>

            <div className="overflow-x-auto relative pb-4">
                <div className="inline-block min-w-full align-middle h-full">
                    <table className="min-w-full border-collapse h-full">
                        <thead>
                            <tr>
                                <th className="sticky top-0 left-0 z-30 bg-white border-b border-r border-slate-200 p-1 min-w-[60px] text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-10 w-14">
                                    Unidad
                                </th>
                                {daysInMonth.map(day => {
                                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                    const feedbackIndex = date.getDay(); // 0 is Sunday
                                    const daysOfWeek = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

                                    return (
                                        <th key={day} className="sticky top-0 z-20 bg-white border-b border-slate-100 p-0.5 min-w-[28px] text-center text-[10px] font-medium text-slate-400 h-10">
                                            <div className="flex flex-col items-center justify-center gap-0.5">
                                                <span className="leading-none">{daysOfWeek[feedbackIndex]}</span>
                                                <span className="leading-none">{day}</span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {departments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="sticky left-0 z-10 bg-white border-r border-slate-200 p-1 text-xs font-medium text-slate-700 whitespace-nowrap shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] text-center w-14">
                                        {/* Extract number from "Depto 1 - ..." -> "1" */}
                                        <span className="inline-block bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-bold">
                                            {dept.nombre.match(/\d+/)?.[0] || dept.nombre}
                                        </span>
                                    </td>
                                    {daysInMonth.map(day => {
                                        const isOccupied = occupancyMap.has(`${dept.id}-${day}`);
                                        return (
                                            <td key={day} className="p-0.5 text-center">
                                                <div
                                                    className={`w-full h-6 mx-auto rounded ${isOccupied
                                                        ? 'bg-brand-500' // Blue rectangle for occupied
                                                        : 'bg-slate-50' // Light grey for free
                                                        }`}
                                                >
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OccupancyMatrix;
