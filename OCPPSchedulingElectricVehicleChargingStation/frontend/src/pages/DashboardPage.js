import React, { useState, useEffect } from 'react';
import { Card, Row, Col, List, Tag, Statistic, Table, Typography } from 'antd';
import { 
  ThunderboltOutlined, 
  CheckCircleOutlined, 
  UserOutlined, 
  DollarOutlined,
  DashboardOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { dashboardAPI } from '../services/api';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const { Title } = Typography;

function DashboardPage() {
  const [stats, setStats] = useState({});
  const [chargePoints, setChargePoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, cpRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getChargePoints()
      ]);
      setStats(statsRes.data);
      setChargePoints(cpRes.data.charge_points);
    } catch (error) {
      console.error('Load dashboard error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status, isOnline) => {
    if (!isOnline) return <Tag color="red">离线</Tag>;
    switch (status) {
      case 'Available': return <Tag color="green">空闲</Tag>;
      case 'Charging': return <Tag color="blue">充电中</Tag>;
      case 'Reserved': return <Tag color="gold">已预约</Tag>;
      case 'Faulted': return <Tag color="red">故障</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: '充电桩',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.cp_serial}</div>
        </div>
      )
    },
    {
      title: '所属充电站',
      dataIndex: 'station_name',
      key: 'station_name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => getStatusTag(status, record.is_online)
    },
    {
      title: '功率',
      dataIndex: 'power_kw',
      key: 'power_kw',
      render: (val) => `${val}kW`
    },
    {
      title: '最后心跳',
      dataIndex: 'last_heartbeat',
      key: 'last_heartbeat',
      render: (val) => val ? dayjs(val).format('HH:mm:ss') : '-'
    }
  ];

  const chartData = [
    { time: '00:00', kwh: 120, count: 8 },
    { time: '04:00', kwh: 80, count: 5 },
    { time: '08:00', kwh: 200, count: 15 },
    { time: '12:00', kwh: 280, count: 22 },
    { time: '16:00', kwh: 320, count: 25 },
    { time: '20:00', kwh: 250, count: 18 },
    { time: '23:59', kwh: 150, count: 10 },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        <DashboardOutlined /> 充电桩运营看板
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-card">
            <Statistic
              title={<><GlobalOutlined /> 充电桩总数</>}
              value={stats.total_cp || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-card">
            <Statistic
              title={<><CheckCircleOutlined /> 在线数量</>}
              value={stats.online_cp || 0}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${stats.total_cp || 0}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-card">
            <Statistic
              title={<><ThunderboltOutlined /> 充电中</>}
              value={stats.charging_cp || 0}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-card">
            <Statistic
              title={<><DollarOutlined /> 今日营收</>}
              value={stats.today_revenue || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="今日充电量 (kWh)" className="dashboard-card">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="kwh" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="今日充电次数" className="dashboard-card">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="充电桩实时状态">
            <Table
              columns={columns}
              dataSource={chargePoints}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Card title="数据统计概览" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{stats.today_transactions || 0}</div>
              <div className="dashboard-stat-label">今日订单数</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{(stats.today_kwh || 0).toFixed(1)}</div>
              <div className="dashboard-stat-label">今日充电量 (kWh)</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{stats.today_active_users || 0}</div>
              <div className="dashboard-stat-label">今日活跃用户</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{stats.total_users || 0}</div>
              <div className="dashboard-stat-label">累计用户数</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default DashboardPage;
