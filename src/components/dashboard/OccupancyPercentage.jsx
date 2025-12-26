import React, { useState } from 'react';
import { Percent, Info, X, Calculator, Lightbulb, BookOpen } from 'lucide-react';

const OccupancyPercentage = ({ percentage }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                            Ocupación en el mes
                        </h3>
                        <button
                            onClick={() => setShowInfo(true)}
                            className="text-slate-400 hover:text-brand-600 transition-colors rounded-full p-0.5 hover:bg-brand-50"
                            aria-label="Ver explicación del cálculo"
                        >
                            <Info size={16} />
                        </button>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">
                            {percentage}%
                        </span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center">
                    <Percent size={24} className="text-brand-600" />
                </div>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                            <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Calculator size={20} className="text-brand-600" />
                                ¿Cómo se calcula?
                            </h4>
                            <button
                                onClick={() => setShowInfo(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                            {/* Formula */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                                <p className="text-sm font-medium text-slate-600 mb-2">Porcentaje de ocupación =</p>
                                <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                                    <div className="flex flex-col items-center">
                                        <span className="border-b border-slate-800 pb-1 font-semibold text-brand-700 px-2">
                                            Total de noches reservadas
                                        </span>
                                        <span className="pt-1 font-semibold text-slate-700">
                                            Unidades × Días del mes
                                        </span>
                                    </div>
                                    <span className="font-bold text-slate-400">×</span>
                                    <span className="font-bold text-slate-900">100</span>
                                </div>
                            </div>

                            {/* Detailed Explanation */}
                            <div>
                                <h5 className="flex items-center gap-2 font-bold text-slate-900 mb-4">
                                    <Lightbulb size={18} className="text-amber-500" />
                                    Explicado fácil
                                </h5>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                        <div>
                                            <span className="font-semibold text-slate-900 block">Total de noches reservadas en el mes</span>
                                            <p className="text-sm text-slate-600">👉 Cuántas noches se alquilaron realmente.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                        <div>
                                            <span className="font-semibold text-slate-900 block">Cantidad de unidades</span>
                                            <p className="text-sm text-slate-600">👉 Cuántos departamentos / habitaciones tenés.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                        <div>
                                            <span className="font-semibold text-slate-900 block">Cantidad de días del mes</span>
                                            <p className="text-sm text-slate-600">👉 Cuántos días tiene el mes.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                        <div>
                                            <span className="font-semibold text-slate-900 block">Cantidad de unidades × días del mes</span>
                                            <p className="text-sm text-slate-600">👉 La cantidad total de noches que podrías haber alquilado como máximo (si todo estuviera ocupado todos los días).</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Summary */}
                            <div className="flex gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <BookOpen size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-bold text-blue-900 text-sm">En una sola frase</p>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        El porcentaje de ocupación muestra qué parte del total de noches posibles se alquilaron en un mes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OccupancyPercentage;
