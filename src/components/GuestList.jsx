import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, User } from 'lucide-react';

const GuestList = () => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGuests();
    }, []);

    const fetchGuests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('huespedes')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            setGuests(data || []);
        } catch (error) {
            console.error('Error fetching guests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredGuests = guests.filter(guest => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (guest.nombre?.toLowerCase() || '').includes(searchLower) ||
            (guest.apellido?.toLowerCase() || '').includes(searchLower) ||
            (guest.dni?.toLowerCase() || '').includes(searchLower)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-slate-900">Lista de Huéspedes</h3>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando huéspedes...</div>
                ) : filteredGuests.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No se encontraron huéspedes.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre Completo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        DNI
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredGuests.map((guest) => (
                                    <tr key={guest.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                                                    <User size={16} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {guest.nombre} {guest.apellido}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {guest.dni || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuestList;
