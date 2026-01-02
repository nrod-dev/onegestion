import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { dummyDepartamentos } from '../lib/dummyData';

const ReservationForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL if editing
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
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
        cant_huespedes: ''
    });

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

    // Fetch reservation data if editing
    useEffect(() => {
        if (id) {
            const fetchReservation = async () => {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .from('reservas')
                        .select(`
                            *,
                            huespedes (*)
                        `)
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
                            cant_huespedes: data.cant_huespedes || ''
                        });
                    }
                } catch (error) {
                    console.error('Error fetching reservation:', error);
                    alert('Error al cargar la reserva');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Check Availability
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
                    alert('El departamento está reservado para esta fecha (o se superpone con otra reserva).');
                    setLoading(false);
                    return;
                }
            }

            // 2. Handle Guest (Find, Create or Update)
            let guestId;

            const findOrCreateHuesped = async (guestData) => {
                // Determine if we have enough info to search/create a specific guest
                const hasIdentityInfo = guestData.dni || (guestData.nombre && guestData.apellido);

                if (!hasIdentityInfo) {
                    // Create a placeholder guest
                    const placeholderData = {
                        ...guestData,
                        nombre: guestData.nombre || 'Huesped',
                        apellido: guestData.apellido || 'Provisorio',
                        dni: guestData.dni || `PROV-${Date.now()}` // Generate unique temp DNI
                    };

                    const { data: newGuest, error: createError } = await supabase
                        .from('huespedes')
                        .insert([placeholderData])
                        .select('id')
                        .single();

                    if (createError) throw createError;
                    return newGuest.id;
                }

                // Paso 1: Buscar Huésped Existente
                let query = supabase.from('huespedes').select('id');

                if (guestData.dni) {
                    query = query.eq('dni', guestData.dni);
                } else if (guestData.nombre && guestData.apellido) {
                    // Solo buscar por nombre si hay nombre y apellido pero no DNI
                    query = query
                        .ilike('nombre', guestData.nombre)
                        .ilike('apellido', guestData.apellido);
                }

                const { data: existingGuest, error: searchError } = await query.maybeSingle();

                if (searchError) {
                    // Si hay error en la búsqueda (diferente a "no encontrado"), lanzar error
                    throw searchError;
                }

                // Paso 2: Retornar ID si existe
                if (existingGuest) {
                    return existingGuest.id;
                }

                // Paso 3: Crear Nuevo Huésped (si no existe)
                // Usar placeholder DNI si no se proveyó uno pero sí nombre/apellido
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
                return newGuest.id;
            };

            const guestData = {
                nombre: formData.nombre,
                dni: formData.dni,
                apellido: formData.apellido,
                telefono: formData.telefono,
                localidad: formData.localidad,
                patente_vehiculo: formData.patente_vehiculo
            };

            if (id) {
                // Si estamos editando una reserva existente
                const { data: currentRes } = await supabase.from('reservas').select('huesped_id').eq('id', id).single();

                if (currentRes) {
                    guestId = currentRes.huesped_id;
                    // Actualizamos los datos del huésped existente
                    const { error: guestError } = await supabase
                        .from('huespedes')
                        .update(guestData)
                        .eq('id', guestId);
                    if (guestError) throw guestError;
                }
            } else {
                // Nueva Reserva
                guestId = await findOrCreateHuesped(guestData);
            }

            // 3. Handle Reservation (Create or Update)
            const reservationData = {
                departamento_id: formData.departamento_id,
                huesped_id: guestId,
                fecha_entrada: formData.fecha_entrada,
                fecha_salida: formData.fecha_salida,
                estado_pago: formData.estado_pago,
                monto_total_pagar: formData.monto_total_pagar || null,
                monto_sena: formData.estado_pago === 'seña' ? (formData.monto_sena || null) : null,
                cant_huespedes: formData.cant_huespedes || null
            };

            if (id) {
                const { error: resError } = await supabase
                    .from('reservas')
                    .update(reservationData)
                    .eq('id', id);
                if (resError) throw resError;
                alert('Reserva actualizada correctamente!');
            } else {
                const { error: resError } = await supabase
                    .from('reservas')
                    .insert([reservationData]);
                if (resError) throw resError;
                alert('Reserva creada correctamente!');
            }

            navigate('/');
        } catch (error) {
            console.error('Error saving reservation:', error);
            alert('Error al guardar la reserva: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-6">{id ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Apartment Selection */}
                <div>
                    <label htmlFor="departamento_id" className="block text-sm font-medium text-gray-700">
                        Departamento
                    </label>
                    <select
                        id="departamento_id"
                        name="departamento_id"
                        required
                        value={formData.departamento_id}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                    >
                        <option value="">Seleccionar un departamento</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                                {dept.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="fecha_entrada" className="block text-sm font-medium text-gray-700">
                            Fecha de Ingreso
                        </label>
                        <input
                            type="date"
                            name="fecha_entrada"
                            id="fecha_entrada"
                            required
                            value={formData.fecha_entrada}
                            onChange={handleChange}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="fecha_salida" className="block text-sm font-medium text-gray-700">
                            Fecha de Egreso
                        </label>
                        <input
                            type="date"
                            name="fecha_salida"
                            id="fecha_salida"
                            required
                            value={formData.fecha_salida}
                            onChange={handleChange}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Guest Details */}
                <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Detalles del huesped</h4>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        {/* DNI Field */}
                        <div>
                            <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                                DNI
                            </label>
                            <input
                                type="text"
                                name="dni"
                                id="dni"
                                value={formData.dni}
                                onChange={handleChange}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                id="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                                Apellido
                            </label>
                            <input
                                type="text"
                                name="apellido"
                                id="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                                Telefono
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                id="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="localidad" className="block text-sm font-medium text-gray-700">
                                Ciudad - Provincia
                            </label>
                            <input
                                type="text"
                                name="localidad"
                                id="localidad"
                                value={formData.localidad}
                                onChange={handleChange}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="patente_vehiculo" className="block text-sm font-medium text-gray-700">
                                Patente Vehículo
                            </label>
                            <input
                                type="text"
                                name="patente_vehiculo"
                                id="patente_vehiculo"
                                value={formData.patente_vehiculo}
                                onChange={handleChange}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="cant_huespedes" className="block text-sm font-medium text-gray-700">
                                Cantidad de Huéspedes
                            </label>
                            <input
                                type="number"
                                name="cant_huespedes"
                                id="cant_huespedes"
                                min="1"
                                value={formData.cant_huespedes}
                                onChange={handleChange}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Status & Amounts */}
                <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Detalles del Pago</h4>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="monto_total_pagar" className="block text-sm font-medium text-gray-700">
                                Monto Total a Pagar
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="monto_total_pagar"
                                    id="monto_total_pagar"
                                    value={formData.monto_total_pagar}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md p-2 border"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="estado_pago" className="block text-sm font-medium text-gray-700">
                                Estado del Pago
                            </label>
                            <select
                                id="estado_pago"
                                name="estado_pago"
                                value={formData.estado_pago}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                            >
                                <option value="consultado">Pendiente de pago</option>
                                <option value="seña">Señado</option>
                                <option value="pagado">Pagado</option>
                            </select>
                        </div>

                        {formData.estado_pago === 'seña' && (
                            <div>
                                <label htmlFor="monto_sena" className="block text-sm font-medium text-gray-700">
                                    Monto Seña
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="monto_sena"
                                        id="monto_sena"
                                        value={formData.monto_sena}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md p-2 border"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : (id ? 'Actualizar Reserva' : 'Crear Reserva')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ReservationForm;
