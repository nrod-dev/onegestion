import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { dummyDepartamentos } from '../lib/dummyData';
import { useToast } from '../context/ToastContext';
import { Car } from 'lucide-react';

const ReservationForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addToast } = useToast();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        departamento_id: '',
        fecha_entrada: '',
        fecha_salida: '',
        nombre: '',
        dni: '',
        apellido: '',
        telefono: '',
        localidad: '',
        patente_vehiculo: '',
        estado_pago: 'consultado',
        monto_total_pagar: '',
        monto_sena: '',
        cant_huespedes: '',
        moneda: 'ARS'
    });

    // Departments and Reservation Data Loading (Same as before)
    useEffect(() => {
        const fetchDepartments = async () => {
            const { data, error } = await supabase.from('departamentos').select('*');
            if (error) {
                console.log('Error fetching departments, using dummy data:', error);
                setDepartments(dummyDepartamentos);
            } else {
                setDepartments(data || []);
            }
        };
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchReservation = async () => {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .from('reservas')
                        .select(`*, huespedes (*)`)
                        .eq('id', id)
                        .single();

                    if (error) throw error;

                    if (data) {
                        setFormData({
                            departamento_id: data.departamento_id,
                            fecha_entrada: data.fecha_entrada,
                            fecha_salida: data.fecha_salida,
                            nombre: data.huespedes?.nombre || '',
                            dni: data.huespedes?.dni || '',
                            apellido: data.huespedes?.apellido || '',
                            telefono: data.huespedes?.telefono || '',
                            localidad: data.huespedes?.localidad || '',
                            patente_vehiculo: data.huespedes?.patente_vehiculo || '',
                            estado_pago: data.estado_pago,
                            monto_total_pagar: data.monto_total_pagar || '',
                            monto_sena: data.monto_sena || '',
                            cant_huespedes: data.cant_huespedes || '',
                            moneda: data.moneda || 'ARS'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching reservation:', error);
                    addToast('Error al cargar la reserva', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchReservation();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const steps = [
        {
            number: 1, label: 'Reserva', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            number: 2, label: 'Huésped', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            number: 3, label: 'Vehículo', icon: <Car className="h-6 w-6" />
        },
        {
            number: 4, label: 'Pago', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        }
    ];

    const validateStep = (step) => {
        if (step === 1) {
            return formData.departamento_id && formData.fecha_entrada && formData.fecha_salida;
        }
        if (step === 2) {
            // Basic validation for guest, can be relaxed if fields are optional
            // Assuming at least name or DNI is required to track guest
            return true; // formData.nombre || formData.dni; 
        }
        return true;
    };

    const handleNext = async (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) {
            addToast('Por favor complete los campos obligatorios.', 'warning');
            return;
        }

        if (currentStep === 1) {
            // Validate functionality: Date overlap
            setLoading(true);
            try {
                // 1. Check Department
                const { data: department, error: deptError } = await supabase
                    .from('departamentos')
                    .select()
                    .eq('id', formData.departamento_id)
                    .single();

                if (deptError) throw deptError;

                if (department) {
                    const { data: reservationData, error: checkError } = await supabase
                        .from('reservas')
                        .select('id')
                        .eq('departamento_id', formData.departamento_id)
                        .lt('fecha_entrada', formData.fecha_salida)
                        .gt('fecha_salida', formData.fecha_entrada)
                        .neq('id', id || -1);

                    if (checkError) throw checkError;

                    if (reservationData && reservationData.length > 0) {
                        addToast('El departamento está reservado para esta fecha (o se superpone con otra reserva).', 'error');
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error(err);
                addToast('Error verificando disponibilidad', 'error');
                setLoading(false);
                return;
            }
            setLoading(false);
        }

        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 2. Handle Guest - ALWAYS CREATE NEW (Copy-on-Write / Snapshot strategy)
            // We do not check for existing guests. We always create a new record.
            // This ensures that editing a reservation's guest does not affecting other reservations.

            const guestData = {
                nombre: formData.nombre?.trim(),
                dni: formData.dni?.trim(),
                apellido: formData.apellido?.trim(),
                telefono: formData.telefono?.trim(),
                localidad: formData.localidad?.trim(),
                patente_vehiculo: formData.patente_vehiculo?.trim()
            };

            // If DNI is missing, we use the same provisional logic as before to ensure a value exists
            // if the database requires it or to keep consistency.
            const finalGuestData = {
                ...guestData,
                dni: guestData.dni || `PROV-${Date.now()}`
            };

            const { data: newGuest, error: createError } = await supabase
                .from('huespedes')
                .insert([finalGuestData])
                .select('id')
                .single();

            if (createError) throw createError;
            const guestId = newGuest.id;

            // 3. Handle Reservation
            const reservationData = {
                departamento_id: formData.departamento_id,
                huesped_id: guestId, // Link to the newly created specific guest record
                fecha_entrada: formData.fecha_entrada,
                fecha_salida: formData.fecha_salida,
                estado_pago: formData.estado_pago,
                monto_total_pagar: formData.monto_total_pagar || null,
                monto_sena: formData.estado_pago === 'seña' ? (formData.monto_sena || null) : null,
                cant_huespedes: formData.cant_huespedes || null,
                moneda: formData.moneda
            };

            if (id) {
                // Update existing reservation to point to the new guest ID
                const { error: resError } = await supabase.from('reservas').update(reservationData).eq('id', id);
                if (resError) throw resError;
                addToast('Reserva actualizada correctamente!', 'success');
            } else {
                const { error: resError } = await supabase.from('reservas').insert([reservationData]);
                if (resError) throw resError;
                addToast('Reserva creada correctamente!', 'success');
            }
            navigate('/');
        } catch (error) {
            console.error('Error saving:', error);
            addToast('Error al guardar: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{id ? 'Editar Reserva' : 'Nueva Reserva'}</h3>

            {/* Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-0"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-blue-900 transition-all duration-300 -z-0" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>

                    {steps.map((step) => (
                        <div key={step.number} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${step.number <= currentStep ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-gray-300 text-gray-500'
                                }`}>
                                {step.number < currentStep ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    step.icon
                                )}
                            </div>
                            <span className={`mt-2 text-sm font-medium ${step.number <= currentStep ? 'text-blue-900' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <form className="space-y-6">

                {/* Step 1: Reserva */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Departamento</label>
                            <select
                                name="departamento_id"
                                required
                                value={formData.departamento_id}
                                onChange={handleChange}
                                className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50"
                            >
                                <option value="">Seleccionar un departamento</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Fecha de Ingreso</label>
                                <input
                                    type="date"
                                    name="fecha_entrada"
                                    required
                                    value={formData.fecha_entrada}
                                    onChange={handleChange}
                                    className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Fecha de Egreso</label>
                                <input
                                    type="date"
                                    name="fecha_salida"
                                    required
                                    value={formData.fecha_salida}
                                    onChange={handleChange}
                                    className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Huesped */}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">DNI</label>
                                <input type="text" name="dni" value={formData.dni} onChange={handleChange} className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Teléfono</label>
                                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-blue-900 mb-1">Nombre</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-blue-900 mb-1">Apellido</label>
                                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-blue-900 mb-1">Ciudad - Provincia</label>
                                <input type="text" name="localidad" value={formData.localidad} onChange={handleChange} className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Cantidad de Huéspedes</label>
                                <input type="number" name="cant_huespedes" min="1" value={formData.cant_huespedes} onChange={handleChange} className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Vehiculo */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Patente del Vehículo</label>
                            <input type="text" name="patente_vehiculo" value={formData.patente_vehiculo} onChange={handleChange} className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50" placeholder="Ej: AA 123 BB" />
                        </div>
                    </div>
                )}

                {/* Step 4: Pago */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-fadeIn">

                        {/* Currency Selector */}
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-2">Moneda</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${formData.moneda === 'ARS' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 hover:border-blue-200'}`}>
                                    <input type="radio" name="moneda" value="ARS" checked={formData.moneda === 'ARS'} onChange={handleChange} className="sr-only" />
                                    <span>$ ARS Pesos</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${formData.moneda === 'USD' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200 hover:border-green-200'}`}>
                                    <input type="radio" name="moneda" value="USD" checked={formData.moneda === 'USD'} onChange={handleChange} className="sr-only" />
                                    <span>USD Dólares</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Monto Total a Pagar</label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">{formData.moneda === 'USD' ? 'USD' : '$'}</span>
                                </div>
                                <input type="number" name="monto_total_pagar" value={formData.monto_total_pagar} onChange={handleChange} className={`block w-full py-3 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${formData.moneda === 'USD' ? 'pl-12' : 'pl-7'}`} placeholder="0.00" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Estado del Pago</label>
                            <select name="estado_pago" value={formData.estado_pago} onChange={handleChange} className="block w-full py-3 px-4 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50">
                                <option value="consultado">Pendiente de pago</option>
                                <option value="seña">Señado</option>
                                <option value="pagado">Pagado</option>
                            </select>
                        </div>

                        {formData.estado_pago === 'seña' && (
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Monto Seña</label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">{formData.moneda === 'USD' ? 'USD' : '$'}</span>
                                    </div>
                                    <input type="number" name="monto_sena" value={formData.monto_sena} onChange={handleChange} className={`block w-full py-3 border-gray-300 rounded-lg border focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${formData.moneda === 'USD' ? 'pl-12' : 'pl-7'}`} placeholder="0.00" />
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h5 className="font-medium text-blue-900 mb-2">Resumen de la Reserva</h5>
                            <p className="text-sm text-gray-600">Verifica que todos los datos sean correctos antes de confirmar.</p>
                        </div>

                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-100 mt-8">
                    <button
                        type="button"
                        onClick={handleBack}
                        className={`px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${currentStep === 1 ? 'invisible' : ''}`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            Anterior
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={loading}
                        className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md flex items-center gap-2"
                    >
                        {loading ? 'Procesando...' : (currentStep === 4 ? (id ? 'Actualizar Reserva' : 'Crear Reserva') : 'Siguiente')}
                        {!loading && currentStep < 4 && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        )}
                        {!loading && currentStep === 4 && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ReservationForm;
