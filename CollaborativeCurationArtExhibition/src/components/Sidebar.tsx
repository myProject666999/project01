import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Image,
  Users,
  Palette,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/exhibitions', icon: Image, label: '展览管理' },
  { to: '/artists', icon: Palette, label: '艺术家' },
  { to: '/guests', icon: Users, label: '嘉宾管理' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-charcoal-lighter bg-charcoal transition-all duration-300',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-charcoal-lighter px-4">
        <Palette size={24} className="shrink-0 text-gold" />
        {!collapsed && (
          <span className="font-display text-lg font-semibold text-cream whitespace-nowrap">
            策展协作
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'bg-gold/10 text-gold'
                : 'text-gray-400 hover:bg-charcoal-lighter hover:text-cream',
            )}
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-12 items-center justify-center border-t border-charcoal-lighter text-gray-400 transition-colors hover:text-cream"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
