import React, { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  RocketOutlined,
  GlobalOutlined,
  UserOutlined
} from '@ant-design/icons'

const { Header, Content, Sider } = Layout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/flight-plans', icon: <FileTextOutlined />, label: '飞行计划' },
  { key: '/approvals', icon: <CheckCircleOutlined />, label: '审批管理' },
  { key: '/approval-config', icon: <SettingOutlined />, label: '审批配置' },
  { key: '/aircrafts', icon: <RocketOutlined />, label: '飞机管理' },
  { key: '/airspaces', icon: <GlobalOutlined />, label: '空域管理' },
  { key: '/pilots', icon: <UserOutlined />, label: '飞行员管理' }
]

function MainLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const [collapsed, setCollapsed] = useState(false)

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/flight-plans')) return '/flight-plans'
    if (path.startsWith('/approvals')) return '/approvals'
    if (path.startsWith('/approval-config')) return '/approval-config'
    if (path.startsWith('/aircrafts')) return '/aircrafts'
    if (path.startsWith('/airspaces')) return '/airspaces'
    if (path.startsWith('/pilots')) return '/pilots'
    return '/'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{
          height: 64,
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? 'GAFPR' : '通航飞行报备'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0 }}>通用航空飞行计划报备系统</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>欢迎，管理员</span>
          </div>
        </Header>
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
