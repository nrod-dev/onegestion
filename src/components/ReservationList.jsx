import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import StatusBadge from './StatusBadge';
import ReservationCard from './ReservationCard';
import { format, differenceInDays } from 'date-fns';
import { Search, Home, Calendar, ArrowRight, ChevronLeft, ChevronRight, User, Building2 } from 'lucide-react';

import { dummyReservas } from '../lib/dummyData';
import { parseDateLocal } from '../lib/utils';

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [activeTab, setActiveTab] = useState('activas');
    const [selectedReservation, setSelectedReservation] = useState(null);
    const ITEMS_PER_PAGE = 10;

    const navigate = useNavigate();

    useEffect(() => {
        setPage(1); // Reset page on tab change
        fetchReservations(1);
    }, [activeTab]);

    useEffect(() => {
        if (page > 1) {
            fetchReservations(page);
        }
    }, [page]);

    const fetchReservations = async (currentPage) => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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

            // Apply filters based on activeTab
            if (activeTab === 'activas') {
                query = query.gte('fecha_salida', today);
            } else if (activeTab === 'pasadas') {
                query = query.lt('fecha_salida', today);
            } else if (activeTab === 'senadas') {
                query = query.gte('fecha_salida', today).eq('estado_pago', 'seña');
            }

            // Order by date
            if (activeTab === 'pasadas') {
                query = query.order('fecha_entrada', { ascending: false });
            } else {
                query = query.order('fecha_entrada', { ascending: true });
            }

            const { data, error, count } = await query.range(from, to);

            if (error) {
                console.log('Error fetching reservations:', error);
                setReservations(dummyReservas);
            } else {
                if (currentPage === 1) {
                    setReservations(data || []);
                } else {
                    setReservations(prev => [...prev, ...(data || [])]);
                }
                setHasMore(count ? (from + data.length < count) : (data.length === ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setReservations(dummyReservas);
        } finally {
            setLoading(false);
        }
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
            alert('Error al eliminar la reserva: ' + error.message);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const tabs = [
        { id: 'activas', label: 'Activas' },
        { id: 'pasadas', label: 'Pasadas' },
        { id: 'senadas', label: 'Señadas' },
        // { id: 'pendientes', label: 'Pendientes' } // Optional based on image, but sticking to request
    ];

    return (
        <>
            <div className="space-y-6">
                {/* Header & Tabs */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-slate-900">Mis Reservas</h3>
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {reservations.length}
                        </span>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors
                                    ${activeTab === tab.id
                                        ? 'bg-brand-600 text-white shadow-sm'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reservation List */}
                <div className="space-y-4">
                    {loading && page === 1 ? (
                        <div className="text-center py-12 text-slate-500">Cargando reservas...</div>
                    ) : reservations.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Search size={32} className="text-slate-300" />
                                <p className="text-slate-500">No hay reservas en esta sección.</p>
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
