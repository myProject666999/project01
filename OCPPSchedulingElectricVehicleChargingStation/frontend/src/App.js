import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, EnvironmentOutlined } from '@ant-design/icons';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MapPage from './pages/MapPage';
import ChargePage from './pages/ChargePage';
import HistoryPage from './pages/HistoryPage';
import WalletPage from './pages/WalletPage';
import DashboardPage from './pages/DashboardPage';

const { Header, Content } = Layout;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  if (!localStorage.getItem('token')) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Header className="layout-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span className="layout-logo">🚗 OCPP充电桩</span>
          <Menu
            mode="horizontal"
            defaultSelectedKeys={['/map']}
            style={{ border: 'none', minWidth: 400 }}
            items={[
              { key: '/map', icon: <EnvironmentOutlined />, label: '找充电桩' },
              { key: '/charge', icon: <UserOutlined />, label: '充电中' },
              { key: '/history', icon: <UserOutlined />, label: '充电记录' },
              { key: '/wallet', icon: <UserOutlined />, label: '我的钱包' },
              { key: '/dashboard', icon: <DashboardOutlined />, label: '运营看板' },
            ]}
            onClick={({ key }) => window.location.href = key}
          />
        </div>
        <Dropdown overlay={userMenu}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.nickname || '用户'}</span>
          </Space>
        </Dropdown>
      </Header>
      <Content className="layout-content">
        <Routes>
          <Route path="/login" element={<Navigate to="/map" />} />
          <Route path="/register" element={<Navigate to="/map" />} />
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/charge" element={<ProtectedRoute><ChargePage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/map" />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
