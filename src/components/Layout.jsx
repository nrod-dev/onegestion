import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarSearch, PlusCircle, Building2, LogOut, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const NavItem = ({ to, icon: Icon, label, mobile, onClick }) => {
    const location = useLocation();
    const isActive = to ? location.pathname === to : false;

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className={clsx(
                    'flex items-center transition-colors',
                    mobile
                        ? 'flex-col justify-center w-full h-full py-1 gap-1 text-xs'
                        : 'gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
            >
                <Icon size={mobile ? 24 : 20} />
                <span>{label}</span>
            </button>
        );
    }

    return (
        <Link
            to={to}
            className={clsx(
                'flex items-center transition-colors',
                mobile
                    ? 'flex-col justify-center w-full h-full py-1 gap-1 text-xs'
                    : 'gap-2 px-4 py-2 rounded-md',
                isActive
                    ? (mobile ? 'text-brand-600 font-medium' : 'bg-brand-800 text-white')
                    : (mobile ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' : 'text-brand-100 hover:bg-brand-800 hover:text-white')
            )}
        >
            <Icon size={mobile ? 24 : 20} />
            <span>{label}</span>
        </Link>
    );
};

const Layout = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-16 sm:pb-0">
            {/* Top Navigation - Desktop */}
            <nav className="bg-brand-900 border-b border-brand-800 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Usamos justify-between para separar izquierda y derecha */}
                    <div className="flex justify-between h-16">

                        {/* --- IZQUIERDA: Logo + Menú de Navegación --- */}
                        <div className="flex items-center">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-white">One Gestion</span>
                            </div>

                            {/* Settings - Moved to Left */}
                            <div className="hidden sm:flex sm:items-center sm:ml-4">
                                <Link
                                    to="/settings"
                                    className="p-2 text-brand-100 hover:text-white transition-colors"
                                    title="Configuración"
                                >
                                    <Settings size={20} />
                                </Link>
                            </div>

                            {/* Links (Inicio, Disponibilidad) */}
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-6 items-center">
                                <NavItem to="/" icon={LayoutDashboard} label="Inicio" />
                                <NavItem to="/departments" icon={Building2} label="Departamentos" />
                                <NavItem to="/availability" icon={CalendarSearch} label="Disponibilidad" />
                            </div>
                        </div>

                        {/* --- DERECHA: Botón de Acción --- */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Settings Button */}
                            <div className="sm:hidden flex items-center">
                                <Link
                                    to="/settings"
                                    className="p-2 text-brand-100 hover:text-white transition-colors"
                                >
                                    <Settings size={24} />
                                </Link>
                            </div>

                            <div className="hidden sm:flex sm:items-center">
                                <NavItem onClick={handleLogout} icon={LogOut} label="Salir" />
                            </div>
                            <div className="hidden sm:flex sm:items-center">
                                {/* Usamos Link directamente aquí para darle estilo de botón azul */}
                                <Link
                                    to="/new-reservation"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                                >
                                    <PlusCircle size={18} className="mr-2" />
                                    Nueva Reserva
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Bottom Navigation - Mobile */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
                <div className="flex justify-around items-center h-16">
                    <NavItem to="/" icon={LayoutDashboard} label="Inicio" mobile />
                    <NavItem to="/departments" icon={Building2} label="Depto" mobile />
                    <NavItem to="/new-reservation" icon={PlusCircle} label="Nueva" mobile />
                    <NavItem to="/availability" icon={CalendarSearch} label="Disp" mobile />
                    <NavItem onClick={handleLogout} icon={LogOut} label="Salir" mobile />
                </div>
            </div>
        </div>
    );
};

export default Layout;
