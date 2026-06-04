import { Layout, Menu } from 'antd'
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  BookOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/dashboard', icon: <HomeOutlined />, label: '首页' },
  { key: '/patients', icon: <TeamOutlined />, label: '患者管理' },
  { key: '/herbs', icon: <MedicineBoxOutlined />, label: '草药库' },
  { key: '/compatibility', icon: <AlertOutlined />, label: '配伍禁忌' }
]

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/patients')) return '/patients'
    if (path.startsWith('/prescriptions')) return '/patients'
    if (path.startsWith('/consultations')) return '/patients'
    return menuItems.find(item => path.startsWith(item.key))?.key || '/dashboard'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          background: 'linear-gradient(135deg, #8B4513, #5D3A1A)'
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <h1 className="text-xl font-bold text-white font-kai m-0">
            中医脉案诊疗记录系统
          </h1>
        </div>
        <div className="ml-auto text-white/80 text-sm">
          望闻问切 · 辨证施治
        </div>
      </Header>
      <Layout>
        <Sider
          width={220}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          style={{
            background: '#FAF8F5',
            borderRight: '1px solid #E8E0D5'
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: 'transparent',
              borderRight: 'none',
              paddingTop: '16px'
            }}
          />
        </Sider>
        <Content style={{ padding: '24px', overflow: 'auto' }}>
          <div className="bg-tcm-pattern min-h-full">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
