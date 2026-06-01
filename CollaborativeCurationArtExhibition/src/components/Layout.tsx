import { Outlet } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-charcoal">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-charcoal-lighter bg-charcoal-light px-6">
          <div />
          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-charcoal-lighter hover:text-cream">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-gold">
                <User size={16} />
              </div>
              <span className="text-sm text-cream">{user?.username || '用户'}</span>
              <button
                onClick={logout}
                className="rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:text-coral"
              >
                退出
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
