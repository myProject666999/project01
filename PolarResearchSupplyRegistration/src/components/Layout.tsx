import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Ship, Package, FileText, AlertTriangle, ClipboardCheck,
  Database, ChevronLeft, ChevronRight, ChevronDown, Warehouse, Tag, Users, FolderKanban,
  Snowflake, Menu,
} from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  children?: { label: string; path: string; icon: React.ReactNode }[]
}

const navItems: NavItem[] = [
  { label: '仪表盘', path: '/', icon: <LayoutDashboard size={20} /> },
  { label: '补给航次', path: '/voyages', icon: <Ship size={20} /> },
  { label: '物资库存', path: '/inventory', icon: <Package size={20} /> },
  { label: '领用管理', path: '/requisitions', icon: <FileText size={20} /> },
  { label: '库存预警', path: '/alerts', icon: <AlertTriangle size={20} /> },
  { label: '盘点管理', path: '/stocktaking', icon: <ClipboardCheck size={20} /> },
  {
    label: '基础数据',
    path: '/base',
    icon: <Database size={20} />,
    children: [
      { label: '仓库管理', path: '/base/warehouses', icon: <Warehouse size={18} /> },
      { label: '分类管理', path: '/base/categories', icon: <Tag size={18} /> },
      { label: '队员管理', path: '/base/members', icon: <Users size={18} /> },
      { label: '项目管理', path: '/base/projects', icon: <FolderKanban size={18} /> },
    ],
  },
]

function NavItemRow({ item, collapsed, baseOpen, toggleBase }: {
  item: NavItem
  collapsed: boolean
  baseOpen: boolean
  toggleBase: () => void
}) {
  const location = useLocation()
  const isBaseActive = item.path === '/base' && location.pathname.startsWith('/base')

  if (item.children) {
    return (
      <div>
        <button
          onClick={toggleBase}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
            isBaseActive ? 'bg-polar-500/20 text-polar-300' : 'text-snow/60 hover:bg-polar-500/10 hover:text-snow'
          }`}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronDown size={16} className={`transition-transform ${baseOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
        {!collapsed && baseOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    isActive ? 'bg-polar-500/20 text-polar-300' : 'text-snow/50 hover:bg-polar-500/10 hover:text-snow'
                  }`
                }
              >
                <span className="flex-shrink-0">{child.icon}</span>
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isActive ? 'bg-polar-500/20 text-polar-300' : 'text-snow/60 hover:bg-polar-500/10 hover:text-snow'
        }`
      }
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
    </NavLink>
  )
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [baseOpen, setBaseOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      <aside
        className={`hidden md:flex flex-col border-r border-polar-500/10 bg-dark-500/50 backdrop-blur-sm transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`flex items-center h-14 border-b border-polar-500/10 px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <Snowflake size={28} className="text-polar-400 flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-snow whitespace-nowrap">极地科考物资</h1>
              <p className="text-[10px] text-polar-400 whitespace-nowrap">Supply Management</p>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavItemRow
              key={item.path}
              item={item}
              collapsed={collapsed}
              baseOpen={baseOpen}
              toggleBase={() => setBaseOpen(!baseOpen)}
            />
          ))}
        </nav>
        <div className="border-t border-polar-500/10 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-snow/50 hover:bg-polar-500/10 hover:text-snow transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span className="text-sm">收起菜单</span></>}
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-dark-500 border-r border-polar-500/10 p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 h-14 mb-2">
              <Snowflake size={28} className="text-polar-400" />
              <div>
                <h1 className="text-base font-bold text-snow">极地科考物资</h1>
                <p className="text-[10px] text-polar-400">Supply Management</p>
              </div>
            </div>
            {navItems.map((item) => (
              <NavItemRow
                key={item.path}
                item={item}
                collapsed={false}
                baseOpen={baseOpen}
                toggleBase={() => setBaseOpen(!baseOpen)}
              />
            ))}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center h-14 border-b border-polar-500/10 bg-dark-500/30 backdrop-blur-sm px-4 md:px-6 gap-4">
          <button
            className="md:hidden text-snow/60 hover:text-snow"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-polar-500/20 flex items-center justify-center">
              <Snowflake size={16} className="text-polar-400" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-dark">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
