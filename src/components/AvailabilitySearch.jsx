import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { dummyDepartamentos, dummyReservas } from '../lib/dummyData';

const AvailabilitySearch = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [availableApartments, setAvailableApartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) return;

        setLoading(true);
        setSearched(true);
        try {
            // 1. Get all apartments
            let allApartments = [];
            let busyReservations = [];

            const { data: apartmentsData, error: deptError } = await supabase
                .from('departamentos')
                .select('*');

            if (deptError) {
                console.log('Error fetching apartments, using dummy data:', deptError);
                allApartments = dummyDepartamentos;
            } else {
                allApartments = apartmentsData || [];
            }

            // 2. Get reservations that overlap with the requested dates
            const { data: reservationsData, error: resError } = await supabase
                .from('reservas')
                .select('departamento_id')
                .lt('fecha_entrada', endDate)
                .gt('fecha_salida', startDate);

            if (resError) {
                console.log('Error fetching reservations for availability, using dummy data:', resError);
                // Filter dummy reservations locally for overlap
                busyReservations = dummyReservas.filter(r =>
                    r.fecha_entrada < endDate && r.fecha_salida > startDate
                );
            } else {
                busyReservations = reservationsData || [];
            }

            const busyIds = new Set(busyReservations.map(r => r.departamento_id));

            const available = allApartments.filter(dept => !busyIds.has(dept.id));
            setAvailableApartments(available);

        } catch (error) {
            console.error('Error checking availability:', error);
            // Fallback to dummy data logic completely if crash
            const busyIds = new Set(dummyReservas.filter(r =>
                r.fecha_entrada < endDate && r.fecha_salida > startDate
            ).map(r => r.departamento_id));
            setAvailableApartments(dummyDepartamentos.filter(dept => !busyIds.has(dept.id)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Consultar Disponibilidad</h3>
                <form onSubmit={handleSearch} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 items-end">
                    <div className="sm:col-span-2">
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                            Fecha de Ingreso
                        </label>
                        <div className="mt-1">
                            <input
                                type="date"
                                id="start-date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                            Fecha de Egreso
                        </label>
                        <div className="mt-1">
                            <input
                                type="date"
                                id="end-date"
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                </form>
            </div>

            {searched && (
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Resultados</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            {availableApartments.length} departamento(s) disponible(s) del {format(new Date(startDate), 'MMM d, yyyy')} al {format(new Date(endDate), 'MMM d, yyyy')}.
                        </p>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {availableApartments.map((dept) => (
                            <li key={dept.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-blue-600 truncate">
                                        {dept.nombre}
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            ${dept.precio_base} /noche
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            {dept.direccion}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {availableApartments.length === 0 && !loading && (
                            <li className="px-4 py-4 sm:px-6 text-center text-gray-500 text-sm">
                                No hay departamentos disponibles para estas fechas.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AvailabilitySearch;
