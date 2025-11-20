export const dummyDepartamentos = [
    { id: 1, nombre: 'Depto A - Sea View', direccion: 'Av. Costanera 123', precio_base: 100 },
    { id: 2, nombre: 'Depto B - Garden', direccion: 'Calle 2 456', precio_base: 80 },
    { id: 3, nombre: 'Depto C - Penthouse', direccion: 'Av. Costanera 123', precio_base: 200 },
];

export const dummyHuespedes = [
    { id: 1, nombre: 'John', apellido: 'Doe', telefono: '123-456-7890', localidad: 'New York' },
    { id: 2, nombre: 'Jane', apellido: 'Smith', telefono: '987-654-3210', localidad: 'London' },
    { id: 3, nombre: 'Bob', apellido: 'Johnson', telefono: '555-555-5555', localidad: 'Paris' },
];

export const dummyReservas = [
    {
        id: 1,
        departamento_id: 1,
        huesped_id: 1,
        fecha_entrada: '2023-11-20',
        fecha_salida: '2023-11-25',
        estado_pago: 'pagado',
        departamentos: { nombre: 'Depto A - Sea View' },
        huespedes: { nombre: 'John', apellido: 'Doe', telefono: '123-456-7890' }
    },
    {
        id: 2,
        departamento_id: 2,
        huesped_id: 2,
        fecha_entrada: '2023-12-01',
        fecha_salida: '2023-12-05',
        estado_pago: 'seña',
        departamentos: { nombre: 'Depto B - Garden' },
        huespedes: { nombre: 'Jane', apellido: 'Smith', telefono: '987-654-3210' }
    },
    {
        id: 3,
        departamento_id: 3,
        huesped_id: 3,
        fecha_entrada: '2023-12-10',
        fecha_salida: '2023-12-15',
        estado_pago: 'consultado',
        departamentos: { nombre: 'Depto C - Penthouse' },
        huespedes: { nombre: 'Bob', apellido: 'Johnson', telefono: '555-555-5555' }
    },
];
