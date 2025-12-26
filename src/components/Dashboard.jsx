import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, getDaysInMonth, addDays } from 'date-fns';
import MonthSelector from './dashboard/MonthSelector';
import OccupancyPercentage from './dashboard/OccupancyPercentage';
import OccupancyMatrix from './dashboard/OccupancyMatrix';

const Dashboard = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [departments, setDepartments] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Departments
            const { data: depts, error: deptError } = await supabase
                .from('departamentos')
                .select('id, nombre')
                .order('nombre');

            if (deptError) throw deptError;

            // 2. Fetch Reservations for the selected month
            // We need reservations that overlap with the month range.
            // Overlap logic: (Start <= EndOfMonth) AND (End >= StartOfMonth)
            const startStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
            const endStr = format(endOfMonth(currentDate), 'yyyy-MM-dd');

            const { data: resData, error: resError } = await supabase
                .from('reservas')
                .select('id, departamento_id, fecha_entrada, fecha_salida')
                .or(`and(fecha_entrada.lte.${endStr},fecha_salida.gte.${startStr})`);

            if (resError) throw resError;

            setDepartments(depts || []);
            setReservations(resData || []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const occupancyPercentage = useMemo(() => {
        if (!departments.length) return 0;

        const daysInCurrentMonth = getDaysInMonth(currentDate);
        const totalSlots = departments.length * daysInCurrentMonth;
        let occupiedSlots = 0;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Iterate through every slot (dept, day)
        for (let day = 1; day <= daysInCurrentMonth; day++) {
            // Create date at noon to avoid timezone edge cases with pure dates
            const currentDayDate = new Date(year, month, day, 12, 0, 0);
            const currentDayStr = format(currentDayDate, 'yyyy-MM-dd');

            departments.forEach(dept => {
                const isOccupied = reservations.some(res =>
                    res.departamento_id === dept.id &&
                    res.fecha_entrada <= currentDayStr &&
                    res.fecha_salida > currentDayStr
                );
                if (isOccupied) occupiedSlots++;
            });
        }

        return Math.round((occupiedSlots / totalSlots) * 100);
    }, [departments, reservations, currentDate]);

    return (
        <div className="space-y-6 pb-20"> {/* pb-20 for bottom nav space */}
            <div className="flex flex-col gap-4">
                <MonthSelector
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                />

                <OccupancyPercentage percentage={occupancyPercentage} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
                    <div className="text-slate-400 animate-pulse">Cargando disponibilidad...</div>
                </div>
            ) : (
                <OccupancyMatrix
                    currentDate={currentDate}
                    departments={departments}
                    reservations={reservations}
                />
            )}
        </div>
    );
};

export default Dashboard;
