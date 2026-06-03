import React, { useState } from 'react'
import { Layout, Menu, Dropdown, Avatar, Badge, List, Typography, Space, Button, message } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  CarOutlined,
  FileTextOutlined,
  PartitionOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  MoreOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout
const { Text } = Typography

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
      icon: <CrownOutlined />,
      label: '船舶管理'
    },
    {
      key: '/tug',
      icon: <CarOutlined />,
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

  const mockNotifications = [
    {
      id: 1,
      title: '任务顺延通知',
      content: '任务PO20260601001已顺延至下一班',
      time: '10分钟前',
      read: false,
      type: 'warning'
    },
    {
      id: 2,
      title: '新预约单待审核',
      content: '船舶中远之星提交了新的预约申请',
      time: '30分钟前',
      read: false,
      type: 'info'
    },
    {
      id: 3,
      title: '引航员排班提醒',
      content: '引航员张三明日有早班任务',
      time: '1小时前',
      read: true,
      type: 'success'
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
    } else if (key === 'profile') {
      message.info('个人中心功能开发中')
    } else if (key === 'settings') {
      message.info('设置功能开发中')
    }
  }

  const handleNotificationClick = (item) => {
    if (!item.read) {
      message.success(`已标记"${item.title}"为已读`)
    }
  }

  const handleViewAllNotifications = () => {
    navigate('/notification')
  }

  const notificationDropdown = (
    <div style={{ width: 360, padding: '8px 0' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>消息通知</Text>
        <Text type="secondary" style={{ fontSize: 12, cursor: 'pointer' }} onClick={handleViewAllNotifications}>
          查看全部 <MoreOutlined />
        </Text>
      </div>
      <List
        dataSource={mockNotifications}
        style={{ maxHeight: 350, overflowY: 'auto' }}
        renderItem={(item) => (
          <List.Item
            style={{ padding: '12px 16px', cursor: 'pointer', background: item.read ? '#fff' : '#f6ffed', borderBottom: '1px solid #f0f0f0' }}
            onClick={() => handleNotificationClick(item)}
          >
            <List.Item.Meta
              avatar={
                <Badge dot={!item.read}>
                  <Avatar
                    size="small"
                    style={{
                      backgroundColor: item.type === 'warning' ? '#faad14' : item.type === 'success' ? '#52c41a' : '#1890ff'
                    }}
                    icon={<BellOutlined />}
                  />
                </Badge>
              }
              title={<Text strong style={{ fontWeight: item.read ? 'normal' : 600 }}>{item.title}</Text>}
              description={
                <div>
                  <div style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>{item.content}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{item.time}</Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )

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
            <Dropdown
              popupRender={() => notificationDropdown}
              placement="bottomRight"
              trigger={['click']}
            >
              <Badge count={mockNotifications.filter(n => !n.read).length} size="small">
                <BellOutlined style={{ fontSize: 20, cursor: 'pointer', color: '#666' }} />
              </Badge>
            </Dropdown>
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
        <Content style={{ margin: '16px', minHeight: 'calc(100vh - 112px)', background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
