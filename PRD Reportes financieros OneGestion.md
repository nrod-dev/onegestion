
## Descripción General

Vista de reportes financieros para el sistema de gestión de reservas oneGestion, optimizada para dispositivos móviles y con capacidad de comparación de períodos.

## Flujos de Usuario

### Comparar dos meses

1. Activar toggle "Comparar"
2. Seleccionar período principal (ej: Enero 2025)
3. Seleccionar período de comparación (ej: Enero 2024)
4. Ver KPIs con variación % y gráficos comparativos


### Comparar temporadas de verano

1. Activar toggle "Comparar"
2. Cambiar a modo "Temporada"
3. Seleccionar temporada principal (ej: Verano 2025/26)
4. Seleccionar temporada de comparación (ej: Verano 2024/25)
5. Ver totales acumulados y desglose por mes


## Diseño UI/UX

### Optimización Móvil

- Header compacto con altura reducida
- KPIs en grid 2 columnas
- Selectores de período con navegación por flechas
- Gráficos con altura adaptativa (200px móvil / 280px desktop)
- Tipografía responsive


### Idioma

- Interfaz completamente en español
- Nombres de meses en español
- Formato de moneda: ARS con símbolo $

## 3. Gráficos

#### Ingresos Mensuales

- **Modo individual**: Área chart con evolución de 6 meses
- **Modo comparación mes**: Barras comparativas por día/semana
- **Modo temporada**: Barras por mes de la temporada (Dic, Ene, Feb, Mar)


#### Ingresos por Departamento

- Gráfico de barras horizontales
- Comparación lado a lado cuando está activo el modo comparación
- Ordenado por monto de mayor a menor


### 4. Esquema de Colores

| Elemento               | Color               |
| ---------------------- | ------------------- |
| Período Principal      | `#3b82f6` (Azul)    |
| Período Comparación    | `#8b5cf6` (Violeta) |
| Positivo/Crecimiento   | `#22c55e` (Verde)   |
| Negativo/Decrecimiento | `#ef4444` (Rojo)    |

### 2. Modos de Visualización

#### Modo Individual (por defecto)

- Selección de un único mes/año
- Navegación mediante flechas izquierda/derecha
- Gráfico de evolución mensual (últimos 6 meses)


#### Modo Comparación

- Toggle "Comparar" para activar
- Dos selectores de período: Principal y Comparación
- Gráficos de barras lado a lado


#### Modo Temporada

- Toggle "Mes / Temporada" para alternar
- Temporada de verano: Diciembre (año N) + Enero, Febrero, Marzo (año N+1)
- Ejemplo: "Verano 2024/25" = Dic 2024 + Ene/Feb/Mar 2025
- Comparación de temporadas completas


## Características Principales

### 1. KPIs Principales

| Métrica | Descripción
|-----|-----
| **Ingresos Totales** | Suma total de ingresos del período seleccionado, formateado en pesos argentinos (ARS)
| **Reservas** | Cantidad total de reservas en el período


- Ambos KPIs muestran variación porcentual respecto al período de comparación (cuando está activo)
- Indicadores visuales: verde (positivo), rojo (negativo)
- Formato abreviado en móvil (ej: $2.45M)
