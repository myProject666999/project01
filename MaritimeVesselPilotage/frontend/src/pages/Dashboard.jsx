import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, List, Tag, Space, Typography } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [statistics, setStatistics] = useState({
    todayTasks: 12,
    totalPilots: 25,
    pendingOrders: 8,
    monthlyRevenue: 1258000
  });

  useEffect(() => {
    const mockTodayTasks = [
      { id: 1, vesselName: '中远之星', time: '08:30', pilot: '张三', status: '进行中', type: '进港' },
      { id: 2, vesselName: '海洋一号', time: '10:00', pilot: '李四', status: '待开始', type: '出港' },
      { id: 3, vesselName: '长江七号', time: '14:30', pilot: '王五', status: '待开始', type: '移泊' },
      { id: 4, vesselName: '海巡168', time: '16:00', pilot: '赵六', status: '待开始', type: '进港' }
    ];

    const mockTodos = [
      { id: 1, content: '审核订单 #ORD-20260601-001', priority: 'high', time: '1小时内' },
      { id: 2, content: '确认引航员排班冲突', priority: 'high', time: '2小时内' },
      { id: 3, content: '处理计费单 #BIL-202605008', priority: 'medium', time: '今日' },
      { id: 4, content: '更新船舶信息 VSL-00256', priority: 'low', time: '本周' },
      { id: 5, content: '查看潮汐预报', priority: 'low', time: '本周' }
    ];

    setTodayTasks(mockTodayTasks);
    setTodos(mockTodos);
  }, []);

  const taskColumns = [
    {
      title: '船名',
      dataIndex: 'vesselName',
      key: 'vesselName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (text) => (
        <Space>
          <ClockCircleOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '引航员',
      dataIndex: 'pilot',
      key: 'pilot'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colorMap = {
          '进港': 'blue',
          '出港': 'green',
          '移泊': 'orange'
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          '进行中': 'processing',
          '待开始': 'warning',
          '已完成': 'success'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    }
  ];

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'medium':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      default:
        return 'green';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: '24px' }}>引航调度中心</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日任务"
              value={statistics.todayTasks}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在岗引航员"
              value={statistics.totalPilots}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审核订单"
              value={statistics.pendingOrders}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月营收(元)"
              value={statistics.monthlyRevenue}
              precision={2}
              prefix={<MoneyCollectOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="今日任务"
            extra={<Tag color="processing">{todayTasks.length} 项任务</Tag>}
          >
            <Table
              columns={taskColumns}
              dataSource={todayTasks}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="待办事项">
            <List
              dataSource={todos}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  style={{ paddingLeft: '0', paddingRight: '0' }}
                >
                  <List.Item.Meta
                    avatar={getPriorityIcon(item.priority)}
                    title={
                      <Space>
                        <span>{item.content}</span>
                        <Tag color={getPriorityColor(item.priority)} size="small">
                          {item.priority === 'high' ? '紧急' : item.priority === 'medium' ? '重要' : '普通'}
                        </Tag>
                      </Space>
                    }
                    description={<Text type="secondary">{item.time}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
