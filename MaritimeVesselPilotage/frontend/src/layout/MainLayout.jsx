import React, { useState } from 'react'
import { Layout, Menu, Dropdown, Avatar, Badge } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  ThunderboltOutlined,
  ShipOutlined,
  RocketOutlined,
  FileTextOutlined,
  PartitionOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: '引航日历'
    },
    {
      key: '/pilot-schedule',
      icon: <UserOutlined />,
      label: '引航员排班'
    },
    {
      key: '/tide',
      icon: <ThunderboltOutlined />,
      label: '潮汐管理'
    },
    {
      key: '/vessel',
      icon: <ShipOutlined />,
      label: '船舶管理'
    },
    {
      key: '/tug',
      icon: <RocketOutlined />,
      label: '拖轮管理'
    },
    {
      key: '/order',
      icon: <FileTextOutlined />,
      label: '预约管理'
    },
    {
      key: '/assignment',
      icon: <PartitionOutlined />,
      label: '任务分配'
    },
    {
      key: '/completion',
      icon: <CheckCircleOutlined />,
      label: '完成单管理'
    },
    {
      key: '/billing',
      icon: <DollarOutlined />,
      label: '计费管理'
    },
    {
      key: '/notification',
      icon: <BellOutlined />,
      label: '系统通知'
    }
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      navigate('/login')
    }
  }

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: collapsed ? 16 : 20, fontWeight: 'bold' }}>
          {collapsed ? '引航' : '船舶引航管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            {menuItems.find(item => item.key === location.pathname)?.label || '首页'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer', color: '#666' }} />
            </Badge>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={userInfo.avatar} />
                <span>{userInfo.realName || userInfo.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px', padding: 24, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
