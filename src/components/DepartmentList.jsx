import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Users, ChevronRight, Calendar as CalendarIcon, PlusCircle, X } from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            // Fetch departments
            const { data: depts, error: deptError } = await supabase
                .from('departamentos')
                .select('*')
                .order('nombre');

            if (deptError) throw deptError;

            // Fetch active reservations to determine status
            const today = new Date().toISOString().split('T')[0];
            const { data: reservations, error: resError } = await supabase
                .from('reservas')
                .select('departamento_id, fecha_entrada, fecha_salida')
                .gte('fecha_salida', today);

            if (resError) throw resError;

            // Map status to departments
            const departmentsWithStatus = depts.map(dept => {
                const isOccupied = reservations.some(res =>
                    res.departamento_id === dept.id &&
                    res.fecha_entrada <= today &&
                    res.fecha_salida >= today
                );
                return { ...dept, status: isOccupied ? 'ocupado' : 'disponible' };
            });

            setDepartments(departmentsWithStatus);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8">Cargando departamentos...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Departamentos</h2>
                <p className="text-gray-500">Gestión de unidades y disponibilidad.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                    <div
                        key={dept.id}
                        onClick={() => setSelectedDept(dept)}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{dept.nombre}</h3>
                                <div className="flex items-center gap-1 text-sm text-blue-500 font-medium">
                                    <Users size={14} />
                                    <span>{dept.max_huespedes || 2} máx</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${dept.status === 'ocupado'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                                }`}>
                                {dept.status === 'ocupado' ? 'Ocupado' : 'Disponible'}
                            </span>
                            <ChevronRight size={16} className="text-gray-300" />
                        </div>
                    </div>
                ))}
            </div>

            {selectedDept && (
                <DepartmentDetailModal
                    department={selectedDept}
                    onClose={() => setSelectedDept(null)}
                />
            )}
        </div>
    );
};

const DepartmentDetailModal = ({ department, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const fetchReservations = async () => {
            const { data } = await supabase
                .from('reservas')
                .select('fecha_entrada, fecha_salida')
                .eq('departamento_id', department.id);
            setReservations(data || []);
        };
        fetchReservations();
    }, [department.id]);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const isReserved = (date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        return reservations.some(res =>
            res.fecha_entrada <= dateString &&
            res.fecha_salida >= dateString
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen sm:pt-4 sm:px-4 sm:pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-lg">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{department.nombre}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <Users size={16} />
                                    <span>Capacidad: {department.max_huespedes || 2} pax</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase">ESTADO ACTUAL</p>
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Building2 size={20} />
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${department.status === 'ocupado'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                                }`}>
                                {department.status === 'ocupado' ? 'Ocupado' : 'Disponible'}
                            </span>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CalendarIcon size={20} className="text-blue-600" />
                                <h4 className="font-bold text-gray-900">Disponibilidad</h4>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-gray-200 rounded">
                                        <ChevronRight className="rotate-180" size={20} />
                                    </button>
                                    <span className="font-semibold text-gray-900 capitalize">
                                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                                    </span>
                                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-gray-200 rounded">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-px bg-gray-200 text-center text-xs font-medium text-gray-500">
                                    {['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'].map(day => (
                                        <div key={day} className="bg-white py-2">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-px bg-gray-200">
                                    {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                                        <div key={`empty-${i}`} className="bg-white h-10" />
                                    ))}
                                    {daysInMonth.map(day => {
                                        const reserved = isReserved(day);
                                        return (
                                            <div
                                                key={day.toString()}
                                                className={`h-10 flex items-center justify-center text-sm ${reserved
                                                    ? 'bg-red-100 text-red-700 font-medium'
                                                    : 'bg-white text-gray-900'
                                                    }`}
                                            >
                                                {format(day, 'd')}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/new-reservation"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusCircle size={18} />
                            Nueva Reserva
                        </Link>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default DepartmentList;
