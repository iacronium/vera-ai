import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  LineChart, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  LogOut,
  Bell,
  Rocket
} from 'lucide-react';
import AIPulse from './AIPulse';
import Avatar from './Avatar';
import {
  useProfile,
  useLogout,
  useUnreadNotifications,
  useClearNotifications,
} from '../store/useAppStore';

const Layout = () => {
  const navigate = useNavigate();
  const profile = useProfile();
  const logout = useLogout();
  const unreadNotifications = useUnreadNotifications();
  const clearNotifications = useClearNotifications();

  const navItems = [
    { icon: LayoutDashboard, label: 'Resumen', path: '/dashboard' },
    { icon: BrainCircuit, label: 'Entrenamiento IA', path: '/sandbox' },
    { icon: LineChart, label: 'Métricas', path: '/metrics' },
    { icon: MessageSquare, label: 'Chat de Ventas', path: '/chat' },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleBellClick = () => {
    clearNotifications();
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-surface overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-6 px-4 z-50">
        <div className="px-4 mb-8 flex items-center space-x-3">
          <div className="rounded-xl overflow-hidden border border-outline-variant/20">
            <Avatar
              src={profile.avatarUrl}
              name={profile.agencyName}
              size={40}
            />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">{profile.agencyName}</p>
            <p className="text-[10px] uppercase tracking-widest text-primary">Modo Autónomo</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all transition-colors duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary border-r-2 border-primary translate-x-1' 
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon className="mr-3 w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/10 space-y-2">
          <button 
            onClick={() => navigate('/sandbox')}
            className="w-full mb-4 bg-primary/10 text-primary px-4 py-3 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-all flex items-center justify-between group"
          >
            Desplegar Nuevo Agente
            <Rocket className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
          
          <NavLink to="/help" className="flex items-center px-4 py-2 text-on-surface-variant hover:text-white transition-all text-xs uppercase tracking-widest">
            <HelpCircle className="mr-3 w-4 h-4" />
            Ayuda
          </NavLink>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-on-surface-variant hover:text-white transition-all text-xs uppercase tracking-widest"
          >
            <LogOut className="mr-3 w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        {/* Navbar */}
        <header className="h-20 bg-surface/80 backdrop-blur-xl sticky top-0 flex justify-between items-center px-8 z-40 border-b border-outline-variant/5">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2">
              <img src="/vera-logo.png" alt="Vera" className="h-8" />
            </NavLink>
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
              <Link to="/#platform" className="hover:text-primary transition-colors">Platform</Link>
              <Link to="/#cases" className="hover:text-primary transition-colors">Case Studies</Link>
              <Link to="/#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBellClick}
                className="relative p-2 text-on-surface-variant hover:bg-white/5 rounded-full transition-all"
                aria-label={unreadNotifications > 0 ? `${unreadNotifications} unread notifications` : 'Notifications'}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>
              <button className="p-2 text-on-surface-variant hover:bg-white/5 rounded-full transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <Link to="/dashboard" className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed px-6 py-2 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center">
              Comenzar
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
