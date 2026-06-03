import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Receipt, Link2, Percent, FileCheck, ChevronLeft, ChevronRight, Bell, User, LogOut } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

const navItems = [
  { path: '/', label: '工作台', icon: LayoutDashboard },
  { path: '/documents/customs', label: '报关单管理', icon: FileText },
  { path: '/documents/invoices', label: '发票管理', icon: Receipt },
  { path: '/matching', label: '智能匹配', icon: Link2 },
  { path: '/tax-rates', label: '退税率管理', icon: Percent },
  { path: '/declarations', label: '申报管理', icon: FileCheck },
]

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebar, currentUser, notifications } = useAppStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={cn(
          'bg-primary-900 text-white flex flex-col transition-all duration-300 shrink-0',
          sidebarCollapsed ? 'w-16' : 'w-56'
        )}
      >
        <div className={cn('flex items-center h-16 px-4 border-b border-white/10', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center font-bold text-sm shrink-0">
            退
          </div>
          {!sidebarCollapsed && <span className="text-base font-semibold truncate">退税申报助手</span>}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  sidebarCollapsed && 'justify-center px-0',
                  active
                    ? 'bg-primary-500 text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center h-12 border-t border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-semibold text-gray-800">
            {navItems.find((item) => isActive(item.path))?.label || '出口退税申报助手'}
          </h1>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                  {currentUser?.name?.[0] || 'U'}
                </div>
                <span className="text-sm text-gray-700">{currentUser?.name || '用户'}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User size={16} />
                    个人信息
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-gray-50">
                    <LogOut size={16} />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
