import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import StatusBadge from './StatusBadge';
import ReservationCard from './ReservationCard';
import { format, differenceInDays } from 'date-fns';
import { Search, Calendar, ArrowRight, ChevronLeft, ChevronRight, User, Building2, Filter, X, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

import { dummyReservas } from '../lib/dummyData';
import { parseDateLocal } from '../lib/utils';

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [upcomingFilter, setUpcomingFilter] = useState(false);
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const ITEMS_PER_PAGE = 10;

    const navigate = useNavigate();

    const fetchReservations = useCallback(async (currentPage) => {
        setLoading(true);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('reservas')
                .select(`
          *,
          cant_huespedes,
          departamentos (
            nombre
          ),
          huespedes (
            nombre,
            apellido,
            telefono,
            localidad,
            patente_vehiculo
          )
        `, { count: 'exact' });

            // Apply date filters if they exist
            if (dateFilter.start) {
                query = query.gte('fecha_entrada', dateFilter.start);
            }
            if (dateFilter.end) {
                query = query.lte('fecha_entrada', dateFilter.end);
            }


            // Logic for "Upcoming" filter vs Default
            if (upcomingFilter) {
                // Upcoming: Entry date > Today (starts tomorrow or later, basically not currently in progress/today)
                // Request was: "reservas de fecha de entrada proxima pero que no esten en progreso"
                // e.g. check-in > now()
                const today = format(new Date(), 'yyyy-MM-dd');
                query = query.gt('fecha_entrada', today);

                // Sort by Nearest date first
                query = query.order('fecha_entrada', { ascending: true });
            } else {
                // Default: Rollback to Sort by Created At (Newest first)
                // "por defecto quiero que me las ordenes por la fecha de creacion de las mas recientes creadas a las mas antiguas"
                query = query.order('created_at', { ascending: false });
            }

            const { data, error, count } = await query.range(from, to);

            if (error) {
                console.log('Error fetching reservations:', error);
                setReservations(dummyReservas);
            } else {
                if (currentPage === 1) {
                    setReservations(data || []);
                } else {
                    // If it's a new page, append. But if filters changed, we should have reset page to 1
                    // so this logic holds.
                    setReservations(data || []);
                }
                setHasMore(count ? (from + data.length < count) : (data.length === ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setReservations(dummyReservas);
        } finally {
            setLoading(false);
        }
    }, [dateFilter, upcomingFilter]);

    useEffect(() => {
        fetchReservations(page);
    }, [page, fetchReservations]);

    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setDateFilter(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setDateFilter({ start: '', end: '' });
        setPage(1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const handleNextPage = () => {
        if (hasMore) setPage(p => p + 1);
    };

    const handleEdit = (reservation) => {
        navigate(`/edit-reservation/${reservation.id}`);
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('reservas')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Refresh list
            fetchReservations(1);
            setSelectedReservation(null);
        } catch (error) {
            console.error('Error deleting reservation:', error);
            addToast('Error al eliminar la reserva: ' + error.message, 'error');
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header & Filters */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-slate-900">Mis Reservas</h3>
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                {reservations.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setUpcomingFilter(!upcomingFilter)}
                                title="Ver próximas reservas"
                                className={`flex-1 sm:flex-none p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${upcomingFilter ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                            >
                                <Clock size={20} />
                                <span className="text-sm">Ver próximas reservas</span>
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg transition-colors shrink-0 ${showFilters ? 'bg-brand-100 text-brand-600' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                            >
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Desde</label>
                                    <input
                                        type="date"
                                        name="start"
                                        value={dateFilter.start}
                                        onChange={handleDateFilterChange}
                                        className="w-full sm:w-40 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
                                    <input
                                        type="date"
                                        name="end"
                                        value={dateFilter.end}
                                        onChange={handleDateFilterChange}
                                        className="w-full sm:w-40 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                                {(dateFilter.start || dateFilter.end) && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Reservation List */}
                <div className="space-y-4">
                    {loading && page === 1 ? (
                        <div className="text-center py-12 text-slate-500">Cargando reservas...</div>
                    ) : reservations.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Search size={32} className="text-slate-300" />
                                <p className="text-slate-500">No se encontraron reservas.</p>
                                {(dateFilter.start || dateFilter.end) && (
                                    <button onClick={clearFilters} className="text-brand-600 text-sm hover:underline">
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        reservations.map((reservation) => {
                            const checkIn = parseDateLocal(reservation.fecha_entrada);
                            const checkOut = parseDateLocal(reservation.fecha_salida);
                            const nights = differenceInDays(checkOut, checkIn);

                            return (
                                <div
                                    key={reservation.id}
                                    onClick={() => setSelectedReservation(reservation)}
                                    className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                                >
                                    {/* Card Header */}
                                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Building2 size={16} />
                                            <span className="text-sm font-medium">
                                                {reservation.departamentos?.nombre || 'Sin asignar'}
                                            </span>
                                        </div>
                                        <StatusBadge status={reservation.estado_pago} />
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">
                                                    {reservation.huespedes?.nombre} {reservation.huespedes?.apellido}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                    <span className="bg-blue-50 text-brand-600 px-1.5 py-0.5 rounded">
                                                        {nights} noches
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} />
                                                        {reservation.cant_huespedes || 1}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400">
                                                #{reservation.id}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            {/* Dates */}
                                            <div className="flex items-center gap-6 text-sm w-full">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Fecha de entrada</p>
                                                    <div className="flex items-center gap-2 font-medium text-slate-900">
                                                        <Calendar size={16} className="text-brand-500" />
                                                        {format(checkIn, 'dd-MM-yyyy')}
                                                    </div>
                                                </div>
                                                <ArrowRight size={16} className="text-slate-300 mt-4" />
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Fecha salida</p>
                                                    <div className="flex items-center gap-2 font-medium text-slate-900">
                                                        <Calendar size={16} className="text-brand-500" />
                                                        {format(checkOut, 'dd-MM-yyyy')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <div className="flex items-center gap-3">
                                                <ChevronRight size={20} className="text-brand-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {reservations.length > 0 && (
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={page === 1 || loading}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                            Anterior
                        </button>
                        <span className="text-sm text-slate-500">
                            Página {page}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={!hasMore || loading}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Reservation Card Modal/Slide-over */}
            {selectedReservation && (
                <ReservationCard
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
};

export default ReservationList;
