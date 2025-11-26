import { Link } from 'react-router-dom';
import { History, ChevronRight } from 'lucide-react';

const Settings = () => {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
                <p className="mt-1 text-sm text-gray-500">Administra las preferencias y visualiza el historial del sistema.</p>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                    <Link
                        to="/settings/history"
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <History size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Historial de Cambios</h3>
                                <p className="text-sm text-gray-500">Ver registro de actividad de usuarios (últimos 30 días)</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600" />
                    </Link>

                    {/* Future settings can go here */}
                </div>
            </div>
        </div>
    );
};

export default Settings;
