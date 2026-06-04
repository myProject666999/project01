import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  DesktopOutlined,
  BarChartOutlined,
  FileTextOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import LoomMonitor from './pages/LoomMonitor';
import OeeReport from './pages/OeeReport';
import ShiftReportPage from './pages/ShiftReportPage';
import Production from './pages/Production';
import Maintenance from './pages/Maintenance';
import Downtime from './pages/Downtime';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">总览看板</Link>,
    },
    {
      key: '/loom-monitor',
      icon: <DesktopOutlined />,
      label: <Link to="/loom-monitor">织机监控</Link>,
    },
    {
      key: '/oee-report',
      icon: <BarChartOutlined />,
      label: <Link to="/oee-report">OEE分析</Link>,
    },
    {
      key: '/shift-report',
      icon: <FileTextOutlined />,
      label: <Link to="/shift-report">班产报表</Link>,
    },
    {
      key: '/production',
      icon: <SettingOutlined />,
      label: <Link to="/production">排产排程</Link>,
    },
    {
      key: '/maintenance',
      icon: <ToolOutlined />,
      label: <Link to="/maintenance">保养管理</Link>,
    },
    {
      key: '/downtime',
      icon: <ClockCircleOutlined />,
      label: <Link to="/downtime">停机记录</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          织机产能采集系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer }}>
          <h2 style={{ margin: 0, lineHeight: '64px' }}>
            {menuItems.find(item => item.key === location.pathname)?.label?.props?.children || '织机产能采集系统'}
          </h2>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/loom-monitor" element={<LoomMonitor />} />
            <Route path="/oee-report" element={<OeeReport />} />
            <Route path="/shift-report" element={<ShiftReportPage />} />
            <Route path="/production" element={<Production />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/downtime" element={<Downtime />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
