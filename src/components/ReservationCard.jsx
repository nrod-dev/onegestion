import React from 'react';
import { X, Home, Calendar, Phone, MapPin, Car, CreditCard, User, Edit } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from './StatusBadge';
import { parseDateLocal } from '../lib/utils';

const ReservationCard = ({ reservation, onClose, onEdit, onDelete }) => {
    if (!reservation) return null;

    const {
        id,
        departamentos,
        huespedes,
        fecha_entrada,
        fecha_salida,
        estado_pago,
        monto_total_pagar,
        monto_sena,
        cant_huespedes
    } = reservation;

    const checkIn = parseDateLocal(fecha_entrada);
    const checkOut = parseDateLocal(fecha_salida);
    const nights = differenceInDays(checkOut, checkIn);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <div className="z-50 fixed sm:inset-0 top-16 bottom-16 left-0 right-0" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Desktop Overlay */}
            <div className="hidden sm:block fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

            {/* Wrapper for positioning */}
            <div className="h-full w-full sm:flex sm:items-center sm:justify-center sm:min-h-screen sm:pt-4 sm:px-4 sm:pb-20 text-center pointer-events-none">

                {/* Card */}
                <div className="pointer-events-auto bg-white text-left shadow-xl transform transition-all w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-lg sm:inline-block sm:align-middle overflow-y-auto animate-slide-in-left sm:animate-none">

                    {/* Header */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-bold text-gray-900" id="modal-title">
                                        {huespedes?.nombre} {huespedes?.apellido}
                                    </h3>
                                    <StatusBadge status={estado_pago} />
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500 gap-2">
                                    <span className="font-mono text-blue-600">#{id.toString().padStart(4, '0')}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <User size={14} />
                                        <span>{cant_huespedes ? `${cant_huespedes} Huéspedes` : 'Huésped'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <span className="sr-only">Cerrar</span>
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="px-4 py-5 sm:p-6 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Left Column: Accommodation & Dates */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        Datos de Alojamiento
                                    </h4>
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                                <Home size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Departamento</p>
                                                <p className="font-semibold text-gray-900">{departamentos?.nombre || 'Sin asignar'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Ingreso</p>
                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                            <Calendar size={16} className="text-blue-500" />
                                            {format(checkIn, 'dd-MM-yyyy', { locale: es })}
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Egreso</p>
                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                            <Calendar size={16} className="text-blue-500" />
                                            {format(checkOut, 'dd-MM-yyyy', { locale: es })}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-100 rounded-lg p-2 text-center text-sm text-gray-600 font-medium">
                                    Duración de la estadía: <span className="text-gray-900">{nights} noches</span>
                                </div>
                            </div>

                            {/* Right Column: Guest Info */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    Datos del Huésped
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Teléfono</p>
                                            <p className="text-sm font-medium text-gray-900">{huespedes?.telefono || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Ciudad-Provincia</p>
                                            <p className="text-sm font-medium text-gray-900">{huespedes?.localidad || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                            <Car size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Vehículo-Patente</p>
                                            <p className="text-sm font-medium text-gray-900">{huespedes?.patente_vehiculo || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="mt-8">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                Detalles del Pago
                            </h4>
                            <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-800 rounded-lg">
                                            <CreditCard size={24} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs">Monto Total</p>
                                            <p className="text-2xl font-bold">{formatCurrency(monto_total_pagar)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400 text-xs mb-1">Estado Actual</p>
                                        <StatusBadge status={estado_pago} />
                                    </div>
                                </div>
                                {estado_pago === 'seña' && monto_sena && (
                                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-sm">
                                        <span className="text-slate-400">Seña abonada:</span>
                                        <span className="font-medium text-emerald-400">{formatCurrency(monto_sena)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-white px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 border-t border-gray-100">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm items-center gap-2"
                            onClick={() => onEdit && onEdit(reservation)}
                        >
                            <Edit size={16} />
                            Editar
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-50 text-base font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm items-center gap-2"
                            onClick={() => {
                                if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
                                    onDelete && onDelete(reservation.id);
                                }
                            }}
                        >
                            Eliminar
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ReservationCard;
