import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Wine,
  Warehouse,
  Clapperboard,
  Bell,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/wines', icon: Wine, label: 'Wines' },
  { to: '/cellar', icon: Warehouse, label: 'Cellar' },
  { to: '/tasting', icon: Clapperboard, label: 'Tasting' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/valuation', icon: TrendingUp, label: 'Valuation' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } min-h-screen bg-cellar-mid border-r border-gold/10 flex flex-col transition-all duration-300 relative`}
    >
      <div className="p-6 border-b border-gold/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-burgundy flex items-center justify-center flex-shrink-0">
            <Wine className="w-6 h-6 text-gold" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-lg text-gold font-semibold leading-tight">
                Red Cellar
              </h1>
              <p className="text-xs text-gray-500 font-body">Wine Management</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-burgundy/30 text-gold shadow-lg shadow-burgundy/20'
                  : 'text-gray-400 hover:text-gold hover:bg-white/5'
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-gold' : 'text-gray-500 group-hover:text-gold'
                }`}
              />
              {!collapsed && (
                <span className="font-body text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-cellar-mid border border-gold/20 rounded-full flex items-center justify-center text-gold hover:bg-burgundy/30 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      <div className="p-4 border-t border-gold/10">
        {!collapsed && (
          <div className="glass-effect rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 font-body">Cellar Status</p>
            <p className="text-gold font-display text-sm mt-1">Active</p>
          </div>
        )}
      </div>
    </aside>
  );
}
