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
                        : 'w-full gap-3 px-4 py-3 rounded-lg text-brand-100 hover:bg-brand-800 hover:text-white'
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
                    : 'w-full gap-3 px-4 py-3 rounded-lg',
                isActive
                    ? (mobile ? 'text-brand-600 font-medium' : 'bg-brand-800 text-white shadow-sm')
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
        <div className="min-h-screen bg-slate-50 flex flex-col sm:flex-row">
            {/* Sidebar - Desktop */}
            <aside className="hidden sm:flex sm:flex-col w-64 bg-brand-900 border-r border-brand-800 fixed inset-y-0 left-0 z-30">
                {/* Logo */}
                <div className="flex items-center h-16 px-6 border-b border-brand-800">
                    <span className="text-xl font-bold text-white tracking-tight">One Gestion</span>
                </div>

                {/* Nav Links */}
                <div className="flex-1 flex flex-col px-3 py-6 gap-1 overflow-y-auto">
                    <NavItem to="/" icon={LayoutDashboard} label="Inicio" />
                    <NavItem to="/departments" icon={Building2} label="Departamentos" />
                    <NavItem to="/availability" icon={CalendarSearch} label="Disponibilidad" />
                </div>

                {/* Bottom Sidebar Items */}
                <div className="p-3 border-t border-brand-800 gap-1 flex flex-col bg-brand-900">
                    <Link
                        to="/settings"
                        className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-brand-100 hover:bg-brand-800 hover:text-white transition-colors"
                    >
                        <Settings size={20} />
                        <span>Configuración</span>
                    </Link>
                    <NavItem onClick={handleLogout} icon={LogOut} label="Salir" />
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col sm:ml-64 min-h-screen transition-all duration-300">
                {/* Top Header - Desktop */}
                <header className="hidden sm:flex items-center justify-end h-16 px-8 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                    <Link
                        to="/new-reservation"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                    >
                        <PlusCircle size={18} className="mr-2" />
                        Nueva Reserva
                    </Link>
                </header>

                {/* Main Content */}
                <main className="flex-1 px-4 sm:px-8 py-8 pb-24 sm:pb-8">
                    <Outlet />
                </main>
            </div>

            {/* Bottom Navigation - Mobile */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
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
