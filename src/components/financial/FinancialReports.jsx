import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, subYears, addYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Sun, ArrowLeft, ArrowRight, DollarSign, Banknote, Hotel, ArrowLeftRight, TrendingUp, BarChart3 } from "lucide-react"

import KPICard from './KPICard';
import IncomeChart from './IncomeChart';

const FinancialReports = () => {
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('month'); // 'month' | 'season'
    const [isComparing, setIsComparing] = useState(false);

    // Date Management
    const [currentDate, setCurrentDate] = useState(new Date());
    const [comparisonDate, setComparisonDate] = useState(subMonths(new Date(), 1));

    // Data
    const [metrics, setMetrics] = useState({
        incomeARS: 0,
        incomeUSD: 0,
        prevIncomeARS: 0,
        prevIncomeUSD: 0,
        incomeARSChange: "0%",
        incomeUSDChange: "0%",
        incomeARSTrend: "neutral",
        incomeUSDTrend: "neutral",
        reservations: 0,
        prevReservations: 0,
        resChange: "0%",
        resTrend: "neutral"
    });
    const [incomeData, setIncomeData] = useState([]);

    useEffect(() => {
        fetchData();
    }, [currentDate, comparisonDate, isComparing, mode]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let start = startOfMonth(currentDate);
            let end = endOfMonth(currentDate);

            if (mode === 'season') {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                let seasonStartYear = year;
                if (month < 6) seasonStartYear = year - 1;

                start = new Date(seasonStartYear, 11, 1); // Dec 1st
                end = endOfMonth(new Date(seasonStartYear + 1, 2, 1)); // End of Mar
            }

            // Main Period Queries
            const { data: mainReservations, error: mainError } = await supabase
                .from('reservas')
                .select('monto_total_pagar, fecha_entrada, moneda')
                .gte('fecha_entrada', format(start, 'yyyy-MM-dd'))
                .lte('fecha_entrada', format(end, 'yyyy-MM-dd'));

            if (mainError) throw mainError;

            // Calculate Metrics by Currency
            const totalIncomeARS = mainReservations
                .filter(r => (r.moneda || 'ARS') === 'ARS')
                .reduce((sum, r) => sum + (Number(r.monto_total_pagar) || 0), 0);
            const totalIncomeUSD = mainReservations
                .filter(r => r.moneda === 'USD')
                .reduce((sum, r) => sum + (Number(r.monto_total_pagar) || 0), 0);
            const totalRes = mainReservations.length;

            // Comparison Data
            let prevIncomeARS = 0;
            let prevIncomeUSD = 0;
            let prevRes = 0;

            if (isComparing) {
                let compStart = startOfMonth(comparisonDate);
                let compEnd = endOfMonth(comparisonDate);

                if (mode === 'season') {
                    const compYear = comparisonDate.getFullYear();
                    const compMonth = comparisonDate.getMonth();
                    let compSeasonStartYear = compYear;
                    if (compMonth < 6) compSeasonStartYear = compYear - 1;

                    compStart = new Date(compSeasonStartYear, 11, 1); // Dec 1st
                    compEnd = endOfMonth(new Date(compSeasonStartYear + 1, 2, 1)); // End of Mar
                }

                const { data: compReservations } = await supabase
                    .from('reservas')
                    .select('monto_total_pagar, moneda')
                    .gte('fecha_entrada', format(compStart, 'yyyy-MM-dd'))
                    .lte('fecha_entrada', format(compEnd, 'yyyy-MM-dd'));

                if (compReservations) {
                    prevIncomeARS = compReservations
                        .filter(r => (r.moneda || 'ARS') === 'ARS')
                        .reduce((sum, r) => sum + (Number(r.monto_total_pagar) || 0), 0);
                    prevIncomeUSD = compReservations
                        .filter(r => r.moneda === 'USD')
                        .reduce((sum, r) => sum + (Number(r.monto_total_pagar) || 0), 0);
                    prevRes = compReservations.length;
                }
            }

            // Calculate Changes
            const calculateChange = (current, previous) => {
                if (!previous || previous === 0) return { change: "+0%", trend: "neutral" };
                const percent = ((current - previous) / previous) * 100;
                const trend = percent > 0 ? "up" : percent < 0 ? "down" : "neutral";
                const sign = percent > 0 ? "+" : "";
                return {
                    change: `${sign}${percent.toFixed(1).replace('.0', '')}%`,
                    trend
                };
            };

            const incomeARSMetrics = calculateChange(totalIncomeARS, prevIncomeARS);
            const incomeUSDMetrics = calculateChange(totalIncomeUSD, prevIncomeUSD);
            const resMetrics = calculateChange(totalRes, prevRes);

            setMetrics({
                incomeARS: totalIncomeARS,
                incomeUSD: totalIncomeUSD,
                prevIncomeARS: isComparing ? prevIncomeARS : undefined,
                prevIncomeUSD: isComparing ? prevIncomeUSD : undefined,
                incomeARSChange: isComparing ? incomeARSMetrics.change : null,
                incomeUSDChange: isComparing ? incomeUSDMetrics.change : null,
                incomeARSTrend: isComparing ? incomeARSMetrics.trend : null,
                incomeUSDTrend: isComparing ? incomeUSDMetrics.trend : null,
                reservations: totalRes,
                prevReservations: isComparing ? prevRes : undefined,
                resChange: isComparing ? resMetrics.change : null,
                resTrend: isComparing ? resMetrics.trend : null
            });

            // Income Chart Data
            let chartData = [];

            if (isComparing) {
                if (mode === 'season') {
                    // Season Comparison: 4 Months vs 4 Months
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    let seasonStartYear = year;
                    if (month < 6) seasonStartYear = year - 1;

                    // Comparison Season Start Year
                    const compYear = comparisonDate.getFullYear();
                    const compMonth = comparisonDate.getMonth();
                    let compSeasonStartYear = compYear;
                    if (compMonth < 6) compSeasonStartYear = compYear - 1;

                    // Main Season Months: Dec, Jan, Feb, Mar
                    const mainMonths = [
                        new Date(seasonStartYear, 11, 1),
                        new Date(seasonStartYear + 1, 0, 1),
                        new Date(seasonStartYear + 1, 1, 1),
                        new Date(seasonStartYear + 1, 2, 1)
                    ];

                    // Comparison Season Months
                    const compMonths = [
                        new Date(compSeasonStartYear, 11, 1),
                        new Date(compSeasonStartYear + 1, 0, 1),
                        new Date(compSeasonStartYear + 1, 1, 1),
                        new Date(compSeasonStartYear + 1, 2, 1)
                    ];

                    // Initialize Map with 4 placeholders
                    const dataMap = {};
                    mainMonths.forEach((d, index) => {
                        const key = index; // 0=Dec, 1=Jan, etc.
                        dataMap[key] = {
                            name: format(d, 'MMM', { locale: es }).charAt(0).toUpperCase() + format(d, 'MMM', { locale: es }).slice(1),
                            total: 0,
                            prevTotal: 0
                        };
                    });

                    // Fetch Main Data (Reuse mainReservations if range covers strictly, but safest to specific query if needed)
                    // mainReservations already covers the month logic roughly, but let's be precise or reuse
                    // mainReservations logic in 'month' mode was strictly startOfMonth(current)..endOfMonth(current)
                    // BUT in 'Season' mode (handled in 'else' block currently?), wait.
                    // We need to fetch specific ranges for comparison mode too if main fetch was just 1 month.
                    // Actually, let's look at Lines 45-50. It fetches based on 'currentDate' start/end.
                    // If mode is 'season', 'currentDate' might not represent the whole season range in that main query unless we changed it.
                    // The previous logic for SINGLE view (lines 159+) fetched its own data.
                    // The logic for COMPARISON (lines 107+) assumed 'mainReservations' was correct.
                    // CRITICAL: We need to ensure 'mainReservations' or a new query fetches the 4 months if mode is season.

                    // Let's explicitly fetch for Chart Aggregation to be safe and clear
                    const mainStart = startOfMonth(mainMonths[0]);
                    const mainEnd = endOfMonth(mainMonths[3]);
                    const { data: mainSeasonData } = await supabase
                        .from('reservas')
                        .select('monto_total_pagar, fecha_entrada')
                        .gte('fecha_entrada', format(mainStart, 'yyyy-MM-dd'))
                        .lte('fecha_entrada', format(mainEnd, 'yyyy-MM-dd'));

                    if (mainSeasonData) {
                        mainSeasonData.forEach(r => {
                            const d = new Date(r.fecha_entrada);
                            // Map date to index 0-3 (Dec, Jan, Feb, Mar)
                            // Basic check:
                            const m = d.getMonth();
                            let idx = -1;
                            if (m === 11) idx = 0;
                            else if (m === 0) idx = 1;
                            else if (m === 1) idx = 2;
                            else if (m === 2) idx = 3;

                            if (idx !== -1 && dataMap[idx]) {
                                dataMap[idx].total += (Number(r.monto_total_pagar) || 0);
                            }
                        });
                    }

                    // Fetch Comparison Data
                    const compStart = startOfMonth(compMonths[0]);
                    const compEnd = endOfMonth(compMonths[3]);
                    const { data: compSeasonData } = await supabase
                        .from('reservas')
                        .select('monto_total_pagar, fecha_entrada')
                        .gte('fecha_entrada', format(compStart, 'yyyy-MM-dd'))
                        .lte('fecha_entrada', format(compEnd, 'yyyy-MM-dd'));

                    if (compSeasonData) {
                        compSeasonData.forEach(r => {
                            const d = new Date(r.fecha_entrada);
                            const m = d.getMonth();
                            let idx = -1;
                            if (m === 11) idx = 0; // Dec
                            else if (m === 0) idx = 1; // Jan
                            else if (m === 1) idx = 2; // Feb
                            else if (m === 2) idx = 3; // Mar

                            if (idx !== -1 && dataMap[idx]) {
                                dataMap[idx].prevTotal += (Number(r.monto_total_pagar) || 0);
                            }
                        });
                    }

                    chartData = Object.values(dataMap);

                } else {
                    // Month Comparison (Weekly breakdown)
                    const weeklyMap = {};
                    for (let i = 1; i <= 5; i++) {
                        weeklyMap[i] = {
                            name: `Semana ${i}`,
                            total: 0,
                            prevTotal: 0
                        };
                    }

                    const getWeekNumber = (date) => {
                        const day = date.getDate();
                        if (day <= 7) return 1;
                        if (day <= 14) return 2;
                        if (day <= 21) return 3;
                        if (day <= 28) return 4;
                        return 5;
                    };

                    if (mainReservations) {
                        mainReservations.forEach(r => {
                            const date = new Date(r.fecha_entrada);
                            const week = getWeekNumber(date);
                            weeklyMap[week].total += (Number(r.monto_total_pagar) || 0);
                        });
                    }

                    if (comparisonDate) {
                        const compStart = startOfMonth(comparisonDate);
                        const compEnd = endOfMonth(comparisonDate);
                        const { data: compRows } = await supabase
                            .from('reservas')
                            .select('monto_total_pagar, fecha_entrada')
                            .gte('fecha_entrada', format(compStart, 'yyyy-MM-dd'))
                            .lte('fecha_entrada', format(compEnd, 'yyyy-MM-dd'));

                        if (compRows) {
                            compRows.forEach(r => {
                                const date = new Date(r.fecha_entrada);
                                const week = getWeekNumber(date);
                                weeklyMap[week].prevTotal += (Number(r.monto_total_pagar) || 0);
                            });
                        }
                    }
                    chartData = Object.values(weeklyMap);
                }

            } else {
                // Non-Comparison Trend/View
                let queryStart, queryEnd;
                let orderedKeys = [];
                const dataMap = {};

                if (mode === 'season') {
                    // Season: Dec (Year X) - Mar (Year X+1)
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    let seasonStartYear = year;
                    if (month < 6) seasonStartYear = year - 1;

                    // Define the 4 months: Dec, Jan, Feb, Mar
                    const months = [
                        new Date(seasonStartYear, 11, 1), // Dec
                        new Date(seasonStartYear + 1, 0, 1), // Jan
                        new Date(seasonStartYear + 1, 1, 1), // Feb
                        new Date(seasonStartYear + 1, 2, 1)  // Mar
                    ];

                    queryStart = startOfMonth(months[0]);
                    queryEnd = endOfMonth(months[3]);

                    months.forEach(d => {
                        const key = format(d, 'MMM yyyy', { locale: es }); // Unique key
                        orderedKeys.push(key);
                        dataMap[key] = {
                            name: format(d, 'MMM yyyy', { locale: es }).charAt(0).toUpperCase() + format(d, 'MMM yyyy', { locale: es }).slice(1),
                            total: 0
                        };
                    });

                } else {
                    // 6 Months Trend (Bar Chart)
                    const sixMonthsAgo = subMonths(currentDate, 5);
                    queryStart = startOfMonth(sixMonthsAgo);
                    queryEnd = endOfMonth(currentDate);

                    for (let i = 0; i < 6; i++) {
                        const d = subMonths(currentDate, 5 - i);
                        const key = format(d, 'MMM yyyy', { locale: es });
                        orderedKeys.push(key);
                        dataMap[key] = {
                            name: format(d, 'MMM', { locale: es }).charAt(0).toUpperCase() + format(d, 'MMM', { locale: es }).slice(1),
                            total: 0
                        };
                    }
                }

                const { data: trendReservations } = await supabase
                    .from('reservas')
                    .select('monto_total_pagar, fecha_entrada')
                    .gte('fecha_entrada', format(queryStart, 'yyyy-MM-dd'))
                    .lte('fecha_entrada', format(queryEnd, 'yyyy-MM-dd'));

                if (trendReservations) {
                    trendReservations.forEach(r => {
                        const date = new Date(r.fecha_entrada);
                        const key = format(date, 'MMM yyyy', { locale: es });
                        if (dataMap[key]) {
                            dataMap[key].total += (Number(r.monto_total_pagar) || 0);
                        }
                    });
                }

                chartData = orderedKeys.map(key => dataMap[key]);
            }

            setIncomeData(chartData);

        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        if (mode === 'season') {
            setCurrentDate(subYears(currentDate, 1));
        } else {
            setCurrentDate(subMonths(currentDate, 1));
        }
    };

    const handleNextMonth = () => {
        if (mode === 'season') {
            setCurrentDate(addYears(currentDate, 1));
        } else {
            setCurrentDate(addMonths(currentDate, 1));
        }
    };

    const handlePrevComparisonYear = () => setComparisonDate(subYears(comparisonDate, 1));
    const handleNextComparisonYear = () => setComparisonDate(addYears(comparisonDate, 1));

    // Helpers for Display
    const getMainPeriodLabel = () => {
        if (mode === 'season') {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            let seasonStartYear = year;
            if (month < 6) seasonStartYear = year - 1;

            return `Verano ${seasonStartYear}/${seasonStartYear + 1}`;
        }
        return format(currentDate, 'MMMM yyyy', { locale: es });
    };

    const getPeriodSubtitle = () => {
        if (mode === 'season') {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            let seasonStartYear = year;
            if (month < 6) seasonStartYear = year - 1;
            return `Dic ${seasonStartYear} - Mar ${seasonStartYear + 1}`;
        }
        return "";
    };

    const getComparisonLabel = () => {
        if (mode === 'season') {
            const year = comparisonDate.getFullYear();
            const month = comparisonDate.getMonth();
            let seasonStartYear = year;
            if (month < 6) seasonStartYear = year - 1;
            return `Verano ${seasonStartYear}/${seasonStartYear + 1}`;
        }
        return format(comparisonDate, 'MMMM yyyy', { locale: es });
    };

    const formatCurrency = (val, currency = 'ARS') => new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Reportes de ingresos</h1>
            {/* Header */}
            <div className="flex justify-center md:justify-end mb-6">
                <div className="flex items-center p-1 bg-muted/60 rounded-lg border border-border/50 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode('month')}
                        className={`flex-1 md:w-24 rounded-md text-sm font-medium transition-all duration-200 ${mode === 'month' ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-transparent hover:text-foreground'}`}
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Mes
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode('season')}
                        className={`flex-1 md:w-24 rounded-md text-sm font-medium transition-all duration-200 ${mode === 'season' ? 'bg-blue-600 text-white shadow-md' : 'text-muted-foreground hover:bg-transparent hover:text-foreground'}`}
                    >
                        <Sun className="w-4 h-4 mr-2" />
                        Temporada
                    </Button>
                </div>
            </div>

            {/* Main Controls */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 space-y-8">
                <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {mode === 'season' ? (
                            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm shrink-0">
                                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-orange-500" />
                            </div>
                        ) : (
                            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
                                <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-500" />
                            </div>
                        )}
                        <span className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                            {mode === 'season' ? 'Temporada Principal' : 'Período Principal'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Comparar</span>
                        <Switch
                            checked={isComparing}
                            onCheckedChange={setIsComparing}
                            className="data-[state=checked]:bg-blue-600 scale-90 sm:scale-100"
                        />
                    </div>
                </div>

                {/* Split Selector (Month/Year) */}
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                        {mode === 'season' ? (
                            <div className="bg-background border border-border px-4 py-2 rounded-lg text-sm font-medium shadow-sm min-w-[200px] text-center">
                                {getMainPeriodLabel()}
                            </div>
                        ) : (
                            <>
                                <Select
                                    value={currentDate.getMonth().toString()}
                                    onValueChange={(val) => {
                                        const newDate = new Date(currentDate);
                                        newDate.setMonth(parseInt(val));
                                        setCurrentDate(newDate);
                                    }}
                                >
                                    <SelectTrigger className="w-[110px] sm:w-[130px] bg-background border-border h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <SelectItem key={i} value={i.toString()}>
                                                {format(new Date(2024, i, 1), 'MMMM', { locale: es }).charAt(0).toUpperCase() + format(new Date(2024, i, 1), 'MMMM', { locale: es }).slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={currentDate.getFullYear().toString()}
                                    onValueChange={(val) => {
                                        const newDate = new Date(currentDate);
                                        newDate.setFullYear(parseInt(val));
                                        setCurrentDate(newDate);
                                    }}
                                >
                                    <SelectTrigger className="w-[90px] sm:w-[100px] bg-background border-border h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 5 }).map((_, i) => {
                                            const year = new Date().getFullYear() - 2 + i;
                                            return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        })}
                                    </SelectContent>
                                </Select>
                            </>
                        )}
                    </div>

                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full shrink-0">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>

                {isComparing && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                        <div className="border-2 border-dashed border-violet-200 rounded-2xl p-4 sm:p-6 bg-violet-50/30 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-violet-600 mb-1">
                                <ArrowLeftRight className="w-4 h-4" />
                                <span className="text-xs sm:text-sm font-medium">Comparar con</span>
                            </div>

                            <div className="flex justify-center w-full">
                                {mode === 'season' ? (
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <Button variant="ghost" size="icon" onClick={handlePrevComparisonYear} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full shrink-0">
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="bg-background border border-border px-4 py-2 rounded-lg text-sm font-medium shadow-sm min-w-[200px] text-center">
                                            {getComparisonLabel()}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={handleNextComparisonYear} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full shrink-0">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Select
                                            value={comparisonDate.getMonth().toString()}
                                            onValueChange={(val) => {
                                                const newDate = new Date(comparisonDate);
                                                newDate.setMonth(parseInt(val));
                                                setComparisonDate(newDate);
                                            }}
                                        >
                                            <SelectTrigger className="w-[110px] sm:w-[130px] bg-background border-border h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <SelectItem key={i} value={i.toString()}>
                                                        {format(new Date(2024, i, 1), 'MMMM', { locale: es }).charAt(0).toUpperCase() + format(new Date(2024, i, 1), 'MMMM', { locale: es }).slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={comparisonDate.getFullYear().toString()}
                                            onValueChange={(val) => {
                                                const newDate = new Date(comparisonDate);
                                                newDate.setFullYear(parseInt(val));
                                                setComparisonDate(newDate);
                                            }}
                                        >
                                            <SelectTrigger className="w-[90px] sm:w-[100px] bg-background border-border h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 5 }).map((_, i) => {
                                                    const year = new Date().getFullYear() - 2 + i;
                                                    return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                    title="Ingresos en Pesos"
                    value={formatCurrency(metrics.incomeARS, 'ARS')}
                    valueFull={metrics.incomeARS.toString()}
                    change={metrics.incomeARSChange}
                    trend={metrics.incomeARSTrend}
                    icon={DollarSign}
                    description={isComparing
                        ? `vs ${getComparisonLabel().charAt(0).toUpperCase() + getComparisonLabel().slice(1)}`
                        : getMainPeriodLabel().charAt(0).toUpperCase() + getMainPeriodLabel().slice(1)
                    }
                    compareValue={isComparing ? formatCurrency(metrics.prevIncomeARS || 0, 'ARS') : undefined}
                />
                <KPICard
                    title="Ingresos en Dólares"
                    value={formatCurrency(metrics.incomeUSD, 'USD')}
                    valueFull={metrics.incomeUSD.toString()}
                    change={metrics.incomeUSDChange}
                    trend={metrics.incomeUSDTrend}
                    icon={Banknote}
                    description={isComparing
                        ? `vs ${getComparisonLabel().charAt(0).toUpperCase() + getComparisonLabel().slice(1)}`
                        : getMainPeriodLabel().charAt(0).toUpperCase() + getMainPeriodLabel().slice(1)
                    }
                    compareValue={isComparing ? formatCurrency(metrics.prevIncomeUSD || 0, 'USD') : undefined}
                />
                <KPICard
                    title="Reservas"
                    value={metrics.reservations.toString()}
                    valueFull={metrics.reservations.toString()}
                    change={metrics.resChange}
                    trend={metrics.resTrend}
                    icon={Hotel}
                    description={isComparing
                        ? `vs ${getComparisonLabel().charAt(0).toUpperCase() + getComparisonLabel().slice(1)}`
                        : getMainPeriodLabel().charAt(0).toUpperCase() + getMainPeriodLabel().slice(1)
                    }
                    compareValue={isComparing ? metrics.prevReservations?.toString() : undefined}
                />
            </div>

            {/* Charts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {isComparing ? <BarChart3 className="text-blue-500 w-5 h-5" /> : <TrendingUp className="text-blue-500 w-5 h-5" />}
                        {isComparing ? 'Comparativa de Ingresos' : 'Ingresos Mensuales'}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium pl-0 ml-0">
                        {isComparing
                            ? `${getMainPeriodLabel().charAt(0).toUpperCase() + getMainPeriodLabel().slice(1)} vs ${getComparisonLabel().charAt(0).toUpperCase() + getComparisonLabel().slice(1)}`
                            : 'Ingresos en Millones'
                        }
                    </p>
                </div>

                <IncomeChart
                    data={incomeData}
                    compareMode={isComparing}
                    periodType={mode}
                    period1Label={getMainPeriodLabel()}
                    period2Label={isComparing ? getComparisonLabel() : undefined}
                />
            </div>
        </div>
    );
};

export default FinancialReports;
// Forced HMR update
