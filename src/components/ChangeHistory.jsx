import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format, subDays, endOfDay, startOfDay } from 'date-fns';
import { ArrowLeft, Filter, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChangeHistory = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('audit_logs')
                    .select('*')
                    .order('changed_at', { ascending: false });

                if (startDate) {
                    const start = new Date(`${startDate}T00:00:00`);
                    query = query.gte('changed_at', start.toISOString());
                }
                if (endDate) {
                    const end = new Date(`${endDate}T23:59:59.999`);
                    query = query.lte('changed_at', end.toISOString());
                }

                const { data, error } = await query;

                if (error) throw error;
                setLogs(data || []);
            } catch (error) {
                console.error('Error fetching audit logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [startDate, endDate]);

    const getActionBadge = (action) => {
        const styles = {
            INSERT: 'bg-green-100 text-green-800',
            UPDATE: 'bg-blue-100 text-blue-800',
            DELETE: 'bg-red-100 text-red-800',
        };
        const labels = {
            INSERT: 'CREADO',
            UPDATE: 'ACTUALIZADO',
            DELETE: 'ELIMINADO',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[action] || 'bg-gray-100 text-gray-800'}`}>
                {labels[action] || action}
            </span>
        );
    };

    const formatTableName = (table) => {
        const names = {
            reservas: 'Reserva',
            huespedes: 'Huésped',
            departamentos: 'Departamento',
        };
        return names[table] || table;
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Historial de Cambios</h2>
                        <p className="mt-1 text-sm text-gray-500">Registro de actividad de los últimos 30 días.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 px-2 border-r border-gray-200">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 hidden sm:inline">Filtrar:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm border-none focus:ring-0 text-gray-600 bg-transparent w-32 sm:w-auto"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm border-none focus:ring-0 text-gray-600 bg-transparent w-32 sm:w-auto"
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acción
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registro
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Detalles
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha y Hora
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Ver</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                                        Cargando historial...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                                        No se encontraron registros en este rango de fechas.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatTableName(log.table_name)}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono">
                                                ID: {log.record_id.slice(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-600 max-w-xs truncate">
                                                {log.action === 'UPDATE' ? (
                                                    <span>Cambio detectado en campos</span>
                                                ) : log.action === 'INSERT' ? (
                                                    <span>Nuevo registro creado</span>
                                                ) : (
                                                    <span>Registro eliminado</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(log.changed_at), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.user_email || 'Usuario del Sistema'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile List View */}
            <div className="sm:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-8 text-sm text-gray-500">Cargando historial...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-500">No se encontraron registros.</div>
                ) : (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2">
                                {getActionBadge(log.action)}
                                <span className="text-xs text-gray-500">
                                    {format(new Date(log.changed_at), 'dd/MM HH:mm')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatTableName(log.table_name)}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-2">
                                        #{log.record_id.slice(0, 6)}
                                    </span>
                                </div>
                                <Eye size={16} className="text-gray-400" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedLog(null)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Detalles del Cambio
                                    </h3>
                                    <button
                                        onClick={() => setSelectedLog(null)}
                                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</label>
                                        <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Tabla</label>
                                            <div className="mt-1 text-sm text-gray-900">{formatTableName(selectedLog.table_name)}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">ID Registro</label>
                                            <div className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.record_id}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</label>
                                        <div className="mt-1 text-sm text-gray-900">
                                            {format(new Date(selectedLog.changed_at), 'dd/MM/yyyy HH:mm:ss')}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</label>
                                        <div className="mt-1 text-sm text-gray-900">
                                            {selectedLog.user_email || 'Desconocido (ID: ' + selectedLog.changed_by + ')'}
                                        </div>
                                    </div>

                                    {/* Show raw data differences if needed, or just raw JSON for now */}
                                    {selectedLog.old_data && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Datos Anteriores</label>
                                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto border border-gray-100">
                                                {JSON.stringify(selectedLog.old_data, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    {selectedLog.new_data && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Datos Nuevos</label>
                                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto border border-gray-100">
                                                {JSON.stringify(selectedLog.new_data, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setSelectedLog(null)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangeHistory;
