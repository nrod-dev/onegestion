import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import StatusBadge from './StatusBadge';
import ReservationCard from './ReservationCard';
import { format, isBefore, startOfDay } from 'date-fns';
import { Search, Filter, Home, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { dummyReservas } from '../lib/dummyData';

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchReservations();
    }, [page]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error, count } = await supabase
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
        `, { count: 'exact' })
                .gte('fecha_salida', today) // Auto-archive: Only show reservations ending today or in future
                .order('fecha_entrada', { ascending: true })
                .range(from, to);

            if (error) {
                console.log('Error fetching reservations:', error);
                // Fallback to dummy data only on error, or handle error appropriately
                setReservations(dummyReservas);
            } else {
                setReservations(data || []);
                // Check if there are more results for the next page
                // If we got full page of items, assume there might be more, or use count if available
                setHasMore(count ? (from + data.length < count) : (data.length === ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setReservations(dummyReservas);
        } finally {
            setLoading(false);
        }
    };

    const [selectedReservation, setSelectedReservation] = useState(null);

    const handlePrevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const handleNextPage = () => {
        if (hasMore) setPage(p => p + 1);
    };

    const navigate = useNavigate();

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
            fetchReservations();
            setSelectedReservation(null);
        } catch (error) {
            console.error('Error deleting reservation:', error);
            alert('Error al eliminar la reserva: ' + error.message);
        }
    };

    if (loading && page === 1) return <div className="text-center py-4">Cargando reservas...</div>;

    return (
        <>
            <div className="bg-white shadow-sm sm:rounded-lg border border-gray-100">
                {/* Header Section */}
                <div className="px-6 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Reservas Activas</h3>
                        <p className="mt-1 text-sm text-gray-500">Gestiona y visualiza las estadías actuales.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Buscar huésped..."
                            />
                        </div>
                    </div>
                </div>

                <div className="">
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-white">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        DEPARTAMENTO / ALOJAMIENTO
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        FECHAS
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        HUÉSPED
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        ESTADO
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {reservations.map((reservation) => (
                                    <tr
                                        key={reservation.id}
                                        onClick={() => setSelectedReservation(reservation)}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors group"
                                    >
                                        {/* Departamento */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                    <Home size={20} />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {reservation.departamentos?.nombre || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Fechas */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-blue-400" />
                                                    <span>{format(new Date(reservation.fecha_entrada), 'dd-MM-yyyy')}</span>
                                                </div>
                                                <ArrowRight size={14} className="text-gray-300" />
                                                <span className="text-gray-600">{format(new Date(reservation.fecha_salida), 'dd-MM-yyyy')}</span>
                                            </div>
                                        </td>

                                        {/* Huesped */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                                                    {reservation.huespedes?.nombre?.charAt(0) || 'G'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {reservation.huespedes?.nombre} {reservation.huespedes?.apellido}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {reservation.huespedes?.telefono}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Estado */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <StatusBadge status={reservation.estado_pago} />
                                        </td>
                                    </tr>
                                ))}
                                {reservations.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Search size={32} className="text-gray-300" />
                                                <p>No se encontraron reservas activas.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View (Kept for responsiveness but styled slightly to match) */}
                    <div className="sm:hidden">
                        <ul className="divide-y divide-gray-100">
                            {reservations.map((reservation) => (
                                <li
                                    key={reservation.id}
                                    className="px-4 py-4 active:bg-gray-50"
                                    onClick={() => setSelectedReservation(reservation)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                                                <Home size={16} />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {reservation.departamentos?.nombre || 'Unknown'}
                                            </span>
                                        </div>
                                        <StatusBadge status={reservation.estado_pago} />
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 pl-9">
                                        <Calendar size={14} className="text-blue-400" />
                                        <span>{format(new Date(reservation.fecha_entrada), 'dd-MM-yyyy')}</span>
                                        <ArrowRight size={12} className="text-gray-300" />
                                        <span>{format(new Date(reservation.fecha_salida), 'dd-MM-yyyy')}</span>
                                    </div>

                                    <div className="flex items-center gap-3 pl-9">
                                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                                            {reservation.huespedes?.nombre?.charAt(0) || 'G'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {reservation.huespedes?.nombre} {reservation.huespedes?.apellido}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {reservations.length === 0 && (
                                <li className="px-4 py-8 text-center text-sm text-gray-500">
                                    No se encontraron reservas.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                        onClick={handlePrevPage}
                        disabled={page === 1 || loading}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                        Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                        Página <span className="font-medium text-gray-900">{page}</span>
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={!hasMore || loading}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Reservation Card Modal */}
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
