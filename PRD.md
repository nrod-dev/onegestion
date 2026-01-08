# PRD - oneGestion
## Sistema de Gestión de Reservas para Departamentos

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Autor:** Equipo oneGestion

---

## 1. Resumen Ejecutivo

oneGestion es una aplicación web de gestión de reservas diseñada para administrar departamentos de alquiler temporal. El sistema permite gestionar reservas, huéspedes, disponibilidad y pagos de manera centralizada, con una interfaz intuitiva optimizada tanto para desktop como para dispositivos móviles.

### Objetivo del Producto
Facilitar la administración de múltiples departamentos de alquiler, automatizando el control de disponibilidad, la gestión de huéspedes y el seguimiento de pagos.

### Usuarios Objetivo
- Administradores de propiedades de alquiler temporal
- Gestores de departamentos turísticos
- Pequeños y medianos emprendimientos hoteleros

---

## 2. Arquitectura Técnica

### Stack Tecnológico
- **Frontend:** React 19.2.1 con Vite
- **Routing:** React Router DOM 7.9.6
- **Backend/Base de Datos:** Supabase (PostgreSQL)
- **Estilos:** Tailwind CSS 3.4.10
- **Iconos:** Lucide React 0.554.0
- **Manejo de Fechas:** date-fns 4.1.0
- **Autenticación:** Supabase Auth

### Modelo de Datos

#### Tablas Principales

**departamentos**
- `id` (UUID, PK)
- `nombre` (string)
- `max_huespedes` (integer)

**huespedes**
- `id` (UUID, PK)
- `nombre` (string)
- `apellido` (string)
- `dni` (string, unique)
- `telefono` (string)
- `localidad` (string)
- `patente_vehiculo` (string)

**reservas**
- `id` (UUID, PK)
- `departamento_id` (UUID, FK → departamentos)
- `huesped_id` (UUID, FK → huespedes)
- `fecha_entrada` (date)
- `fecha_salida` (date)
- `estado_pago` (enum: 'consultado', 'seña', 'pagado')
- `monto_total_pagar` (decimal)
- `monto_sena` (decimal)
- `cant_huespedes` (integer)
- `created_at` (timestamp)

**audit_logs**
- `id` (UUID, PK)
- `table_name` (string)
- `record_id` (UUID)
- `action` (enum: 'INSERT', 'UPDATE', 'DELETE')
- `old_data` (jsonb)
- `new_data` (jsonb)
- `changed_at` (timestamp)
- `changed_by` (UUID)
- `user_email` (string)

---

## 3. Funcionalidades Principales

### 3.1 Dashboard (Página Principal)

**Descripción:** Vista principal que muestra el estado de ocupación del mes actual.

**Componentes:**
- **Selector de Mes:** Permite navegar entre meses (desde diciembre 2025 en adelante)
- **Indicador de Ocupación:** Muestra el porcentaje de ocupación del mes seleccionado
- **Matriz de Ocupación:** Visualización tipo calendario que muestra:
  - Días del mes (columnas)
  - Departamentos (filas)
  - Estado de ocupación por día (ocupado/libre)

**Funcionalidad Clave:**
- Cálculo automático de porcentaje de ocupación
- Visualización intuitiva con código de colores
- Navegación fluida entre meses
- Responsive design (sticky headers en mobile)

### 3.2 Gestión de Reservas

#### 3.2.1 Lista de Reservas

**Características:**
- Paginación (10 reservas por página)
- Filtros:
  - Por rango de fechas
  - Próximas reservas (no en progreso)
- Ordenamiento:
  - Por defecto: fecha de creación (más recientes primero)
  - Con filtro "próximas": por fecha de entrada (más cercanas primero)
- Información mostrada:
  - Nombre del huésped
  - Departamento asignado
  - Fechas de entrada/salida
  - Cantidad de noches
  - Estado de pago
  - Número de huéspedes

#### 3.2.2 Crear/Editar Reserva

**Campos Obligatorios:**
- Departamento
- Fecha de entrada
- Fecha de salida

**Campos Opcionales:**
- Datos del huésped (DNI, nombre, apellido, teléfono, localidad, patente)
- Cantidad de huéspedes
- Monto total a pagar
- Estado de pago
- Monto de seña (si estado = "seña")

**Validaciones:**
- Verificación de disponibilidad del departamento
- Prevención de solapamiento de reservas
- Validación de fechas (salida > entrada)

**Lógica de Huéspedes:**
- Búsqueda automática por DNI o nombre+apellido
- Creación automática si no existe
- Generación de DNI provisional si no se proporciona
- Actualización de datos en edición

### 3.3 Gestión de Departamentos

**Funcionalidades:**
- Listado de todos los departamentos
- Visualización de estado actual (ocupado/disponible)
- Capacidad máxima de huéspedes
- Modal de detalle con:
  - Calendario de disponibilidad mensual
  - Navegación entre meses
  - Acceso rápido a crear nueva reserva

### 3.4 Búsqueda de Disponibilidad

**Criterios de Búsqueda:**
- Rango de fechas
- Cantidad de huéspedes

**Resultados:**
- Lista de departamentos disponibles
- Información de capacidad
- Opción de reservar directamente

### 3.5 Gestión de Huéspedes

**Funcionalidades:**
- Lista completa de huéspedes registrados
- Búsqueda por nombre, apellido o DNI
- Visualización de datos de contacto
- Ordenamiento alfabético

### 3.6 Configuración y Auditoría

#### 3.6.1 Configuración
- Acceso a historial de cambios
- Opciones de cierre de sesión

#### 3.6.2 Historial de Cambios
- Registro automático de todas las operaciones (INSERT, UPDATE, DELETE)
- Filtrado por rango de fechas
- Visualización de:
  - Tipo de acción
  - Tabla afectada
  - ID del registro
  - Usuario responsable
  - Fecha y hora
  - Datos anteriores y nuevos (en formato JSON)

### 3.7 Autenticación

**Características:**
- Login con email y contraseña
- Sesión persistente
- Rutas protegidas
- Redirección automática según estado de autenticación

---

## 4. Interfaz de Usuario

### 4.1 Diseño Responsive

**Desktop:**
- Sidebar fijo con navegación principal
- Header superior con botón de nueva reserva
- Contenido principal con máximo aprovechamiento del espacio

**Mobile:**
- Header superior con menú hamburguesa
- Bottom navigation bar con accesos rápidos
- Drawer lateral para opciones adicionales
- Optimización de tablas y matrices para scroll horizontal

### 4.2 Navegación

**Menú Principal:**
- Inicio (Dashboard)
- Reservas
- Departamentos
- Disponibilidad
- Lista de Huéspedes
- Configuración

**Acciones Rápidas:**
- Nueva Reserva (botón destacado)
- Búsqueda rápida
- Filtros contextuales

### 4.3 Paleta de Colores

- **Primary (Brand):** Azul (#configurado en Tailwind como brand-*)
- **Estados:**
  - Ocupado: Azul (brand-500)
  - Libre: Gris claro (slate-50)
  - Pagado: Verde
  - Seña: Azul
  - Pendiente: Gris

---

## 5. Casos de Uso Principales

### 5.1 Crear Nueva Reserva
1. Usuario accede a "Nueva Reserva"
2. Selecciona departamento y fechas
3. Sistema valida disponibilidad
4. Usuario ingresa datos del huésped (opcional)
5. Sistema busca o crea huésped
6. Usuario define estado de pago y montos
7. Sistema guarda reserva y actualiza disponibilidad

### 5.2 Consultar Disponibilidad
1. Usuario accede al Dashboard o Disponibilidad
2. Selecciona mes o rango de fechas
3. Sistema muestra matriz de ocupación
4. Usuario identifica períodos libres
5. Opcionalmente crea reserva directamente

### 5.3 Editar Reserva Existente
1. Usuario busca reserva en lista
2. Hace clic en reserva para ver detalle
3. Selecciona "Editar"
4. Modifica datos necesarios
5. Sistema valida cambios (especialmente fechas)
6. Sistema actualiza reserva y huésped

### 5.4 Auditar Cambios
1. Usuario accede a Configuración → Historial
2. Define rango de fechas
3. Sistema muestra log de cambios
4. Usuario puede ver detalles de cada cambio
5. Visualiza datos anteriores y nuevos

---

## 6. Requisitos No Funcionales

### 6.1 Rendimiento
- Carga inicial < 3 segundos
- Navegación entre páginas instantánea (SPA)
- Paginación para listas grandes

### 6.2 Seguridad
- Autenticación obligatoria
- Rutas protegidas
- Validación de datos en cliente y servidor
- Auditoría completa de cambios

### 6.3 Usabilidad
- Interfaz intuitiva sin curva de aprendizaje
- Feedback visual inmediato
- Mensajes de error claros
- Confirmaciones para acciones destructivas

### 6.4 Compatibilidad
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Dispositivos móviles (iOS, Android)
- Tablets

### 6.5 Mantenibilidad
- Código modular y componentizado
- Separación de lógica de negocio
- Uso de hooks personalizados
- Convenciones de nomenclatura consistentes

---

## 7. Roadmap y Mejoras Futuras

### Fase 2 (Potencial)
- [ ] Notificaciones automáticas (email/SMS)
- [ ] Integración con calendarios externos (Airbnb, Booking)
- [ ] Reportes y estadísticas avanzadas
- [ ] Gestión de tareas de limpieza
- [ ] Sistema de precios dinámicos
- [ ] Multi-idioma
- [ ] Exportación de datos (PDF, Excel)
- [ ] Dashboard de métricas financieras
- [ ] Gestión de gastos y mantenimiento
- [ ] App móvil nativa

---

## 8. Métricas de Éxito

### KPIs Principales
- Tiempo promedio para crear una reserva: < 2 minutos
- Tasa de error en reservas: < 1%
- Satisfacción del usuario: > 4/5
- Disponibilidad del sistema: > 99%
- Tiempo de respuesta promedio: < 500ms

---

## 9. Dependencias y Limitaciones

### Dependencias Externas
- Supabase (base de datos y autenticación)
- Conexión a internet estable

### Limitaciones Conocidas
- No soporta reservas recurrentes
- No incluye gestión de inventario
- No tiene integración con pasarelas de pago
- Auditoría limitada a 30 días por defecto en UI

---

## 10. Glosario

- **Departamento:** Unidad de alquiler (apartamento, cabaña, etc.)
- **Huésped:** Persona que realiza la reserva
- **Seña:** Pago parcial anticipado
- **Ocupación:** Porcentaje de días reservados vs. días disponibles
- **Audit Log:** Registro de cambios en la base de datos
