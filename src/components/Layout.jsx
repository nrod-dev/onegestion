import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarSearch, PlusCircle, Building2, LogOut, Settings, Menu, X, Users, CalendarDays, Home } from 'lucide-react';
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
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col sm:flex-row">
            {/* Mobile Header */}
            <header className="sm:hidden fixed top-0 left-0 right-0 h-16 bg-brand-900 z-40 flex items-center justify-between px-4 shadow-md">
                <button onClick={toggleDrawer} className="text-white p-2">
                    <Menu size={24} />
                </button>
                <h1 className="text-white text-lg font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2">
                    One Gestión
                </h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            {/* Mobile Drawer */}
            <div className={clsx(
                "sm:hidden fixed inset-0 z-50 flex transition-all duration-300",
                isDrawerOpen ? "visible pointer-events-auto" : "invisible pointer-events-none delay-300"
            )}>
                {/* Backdrop */}
                <div
                    className={clsx(
                        "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out",
                        isDrawerOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setIsDrawerOpen(false)}
                />

                {/* Drawer Content */}
                <div className={clsx(
                    "relative w-64 bg-white h-full shadow-xl flex flex-col transition-transform duration-300 ease-out",
                    isDrawerOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="h-16 bg-brand-900 flex items-center px-6 justify-between">
                        <span className="text-xl font-bold text-white tracking-tight">Menu</span>
                        <button onClick={() => setIsDrawerOpen(false)} className="text-brand-100 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 py-6 px-4 flex flex-col gap-2">
                        <Link
                            to="/guests"
                            onClick={() => setIsDrawerOpen(false)}
                            className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Users size={20} className="text-brand-600" />
                            <span className="font-medium">Lista de Huespedes</span>
                        </Link>

                        <Link
                            to="/settings"
                            onClick={() => setIsDrawerOpen(false)}
                            className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Settings size={20} className="text-brand-600" />
                            <span className="font-medium">Configuración</span>
                        </Link>
                    </div>

                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar - Desktop */}
            <aside className="hidden sm:flex sm:flex-col w-64 bg-brand-900 border-r border-brand-800 fixed inset-y-0 left-0 z-30">
                {/* Logo */}
                <div className="flex items-center h-16 px-6 border-b border-brand-800">
                    <span className="text-xl font-bold text-white tracking-tight">One Gestión</span>
                </div>

                {/* Nav Links */}
                <div className="flex-1 flex flex-col px-3 py-6 gap-1 overflow-y-auto">
                    <NavItem to="/" icon={Home} label="Inicio" />
                    <NavItem to="/reservations" icon={CalendarDays} label="Reservas" />
                    <NavItem to="/departments" icon={Building2} label="Departamentos" />
                    <NavItem to="/availability" icon={CalendarSearch} label="Disponibilidad" />
                </div>

                {/* Bottom Sidebar Items */}
                <div className="p-3 border-t border-brand-800 gap-1 flex flex-col bg-brand-900">
                    <NavItem to="/guests" icon={Users} label="Lista de Huespedes" />
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
            <div className="flex-1 flex flex-col sm:ml-64 min-h-screen transition-all duration-300 pt-16 sm:pt-0">
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
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe">
                <div className="flex justify-around items-center h-16">
                    <NavItem to="/" icon={Home} label="Inicio" mobile />
                    <NavItem to="/reservations" icon={CalendarDays} label="Reservas" mobile />
                    <NavItem to="/new-reservation" icon={PlusCircle} label="Nueva" mobile />
                    <NavItem to="/departments" icon={Building2} label="Depto" mobile />
                    <NavItem to="/availability" icon={CalendarSearch} label="Disp" mobile />
                </div>
            </div>
        </div>
    );
};

export default Layout;
