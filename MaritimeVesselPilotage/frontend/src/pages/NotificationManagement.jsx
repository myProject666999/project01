import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Space,
  Typography,
  Card,
  Button,
  Modal,
  Select,
  Input,
  message,
  Row,
  Col,
  Statistic,
  Radio,
  Empty,
  List,
  Descriptions,
  Divider
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ReadOutlined,
  CheckOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [readFilter, setReadFilter] = useState('all');
  const [statistics, setStatistics] = useState({
    totalCount: 0,
    unreadCount: 0,
    infoCount: 0,
    warningCount: 0,
    urgentCount: 0
  });

  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        title: '新引航订单已创建',
        content: '引航订单 ORD-20260608-001 已创建，请及时安排引航员。\n\n船舶：中远之星\n引航类型：进港\n预定时间：2026-06-10 09:00',
        type: 'info',
        priority: 'normal',
        isRead: false,
        sender: '系统',
        receiver: '引航调度员',
        relatedOrderNo: 'ORD-20260608-001',
        createTime: '2026-06-08 10:30:00',
        readTime: null
      },
      {
        id: 2,
        title: '潮汐预警通知',
        content: '预计2026年6月10日02:00-06:00期间潮高将低于6.0米，请调度人员注意安排吃水较深的船舶。\n\n最低潮高：5.2米\n影响时段：02:00-06:00',
        type: 'warning',
        priority: 'high',
        isRead: false,
        sender: '潮汐监测系统',
        receiver: '引航调度员',
        relatedOrderNo: null,
        createTime: '2026-06-08 09:15:00',
        readTime: null
      },
      {
        id: 3,
        title: '引航任务完成',
        content: '引航任务 ASG-20260607-001 已完成。\n\n船舶：东方明珠\n引航员：孙七\n完成时间：2026-06-07 16:30\n作业评价：优秀',
        type: 'success',
        priority: 'normal',
        isRead: true,
        sender: '引航员终端',
        receiver: '引航调度员',
        relatedOrderNo: 'ORD-20260603-005',
        createTime: '2026-06-07 16:32:00',
        readTime: '2026-06-07 17:00:00'
      },
      {
        id: 4,
        title: '拖轮状态变更',
        content: '拖轮「港拖三号」状态变更为「维修中」，预计2026年6月10日完成维修。\n\n请调度人员注意拖轮资源调配。',
        type: 'warning',
        priority: 'normal',
        isRead: true,
        sender: '拖轮管理系统',
        receiver: '引航调度员',
        relatedOrderNo: null,
        createTime: '2026-06-07 14:20:00',
        readTime: '2026-06-07 15:30:00'
      },
      {
        id: 5,
        title: '紧急通知：台风预警',
        content: '【紧急】根据气象部门预报，今年第3号台风「风神」预计将于6月12日夜间在本港附近登陆。\n\n请各部门立即做好以下工作：\n1. 通知所有在港船舶做好防风准备\n2. 暂停6月12日下午至6月13日的所有引航作业\n3. 检查港区设施，确保安全\n\n请各部门负责人务必重视！',
        type: 'urgent',
        priority: 'urgent',
        isRead: false,
        sender: '港务局应急指挥中心',
        receiver: '全体人员',
        relatedOrderNo: null,
        createTime: '2026-06-08 08:00:00',
        readTime: null
      },
      {
        id: 6,
        title: '引航员换班通知',
        content: '引航员「张三」因个人原因请假，其负责的6月10日引航任务已临时调整给「李四」。\n\n涉及订单：ORD-20260610-001、ORD-20260610-002\n请相关调度人员注意跟进。',
        type: 'info',
        priority: 'normal',
        isRead: true,
        sender: '人事管理系统',
        receiver: '引航调度员',
        relatedOrderNo: 'ORD-20260610-001',
        createTime: '2026-06-06 16:45:00',
        readTime: '2026-06-06 17:20:00'
      },
      {
        id: 7,
        title: '账单支付提醒',
        content: '账单 BIL-20260601-001 已超过30天未支付，请及时跟进。\n\n账单金额：¥10,500\n船舶：中远之星\n到期日期：2026-06-05',
        type: 'warning',
        priority: 'high',
        isRead: false,
        sender: '计费系统',
        receiver: '财务人员',
        relatedOrderNo: 'ORD-20260601-001',
        createTime: '2026-06-08 09:00:00',
        readTime: null
      },
      {
        id: 8,
        title: '系统维护通知',
        content: '为提升系统性能，计划于2026年6月10日22:00-次日02:00进行系统维护升级。\n\n维护期间系统将暂停服务，请提前做好相关工作安排。\n\n如有紧急事务，请联系技术支持：138-xxxx-xxxx',
        type: 'info',
        priority: 'normal',
        isRead: true,
        sender: '系统管理员',
        receiver: '全体人员',
        relatedOrderNo: null,
        createTime: '2026-06-05 11:00:00',
        readTime: '2026-06-05 14:30:00'
      }
    ];

    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
    updateStatistics(mockNotifications);
  }, []);

  const updateStatistics = (data) => {
    const totalCount = data.length;
    const unreadCount = data.filter((n) => !n.isRead).length;
    const infoCount = data.filter((n) => n.type === 'info').length;
    const warningCount = data.filter((n) => n.type === 'warning').length;
    const urgentCount = data.filter((n) => n.type === 'urgent').length;

    setStatistics({
      totalCount,
      unreadCount,
      infoCount,
      warningCount,
      urgentCount
    });
  };

  const getTypeConfig = (type) => {
    const typeMap = {
      info: { color: 'blue', text: '通知', icon: <InfoCircleOutlined /> },
      success: { color: 'success', text: '成功', icon: <CheckCircleOutlined /> },
      warning: { color: 'warning', text: '警告', icon: <WarningOutlined /> },
      urgent: { color: 'error', text: '紧急', icon: <ExclamationCircleOutlined /> }
    };
    return typeMap[type] || { color: 'default', text: '其他', icon: <BellOutlined /> };
  };

  const getPriorityTag = (priority) => {
    const priorityMap = {
      low: { color: 'default', text: '低' },
      normal: { color: 'blue', text: '普通' },
      high: { color: 'orange', text: '高' },
      urgent: { color: 'red', text: '紧急' }
    };
    const config = priorityMap[priority] || { color: 'default', text: '普通' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleSearch = () => {
    let result = [...notifications];

    if (searchText) {
      result = result.filter(
        (n) =>
          n.title.includes(searchText) ||
          n.content.includes(searchText) ||
          n.sender.includes(searchText)
      );
    }

    if (typeFilter) {
      result = result.filter((n) => n.type === typeFilter);
    }

    if (readFilter === 'unread') {
      result = result.filter((n) => !n.isRead);
    } else if (readFilter === 'read') {
      result = result.filter((n) => n.isRead);
    }

    setFilteredNotifications(result);
    updateStatistics(result);
  };

  const handleReset = () => {
    setSearchText('');
    setTypeFilter(null);
    setReadFilter('all');
    setFilteredNotifications(notifications);
    updateStatistics(notifications);
  };

  const handleViewDetail = (record) => {
    setCurrentNotification(record);
    setDetailVisible(true);
    if (!record.isRead) {
      handleMarkAsRead(record.id);
    }
  };

  const handleMarkAsRead = (id) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === id
        ? { ...n, isRead: true, readTime: new Date().toLocaleString('zh-CN') }
        : n
    );
    setNotifications(updatedNotifications);
    setFilteredNotifications(updatedNotifications);
    updateStatistics(updatedNotifications);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map((n) =>
      !n.isRead
        ? { ...n, isRead: true, readTime: new Date().toLocaleString('zh-CN') }
        : n
    );
    setNotifications(updatedNotifications);
    setFilteredNotifications(updatedNotifications);
    updateStatistics(updatedNotifications);
    message.success('已全部标记为已读');
  };

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newNotification = {
        ...values,
        id: Math.max(...notifications.map((n) => n.id)) + 1,
        isRead: false,
        readTime: null,
        createTime: new Date().toLocaleString('zh-CN'),
        sender: '管理员'
      };
      const updatedNotifications = [newNotification, ...notifications];
      setNotifications(updatedNotifications);
      setFilteredNotifications(updatedNotifications);
      updateStatistics(updatedNotifications);
      message.success('通知发布成功');
      setModalVisible(false);
    });
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {!record.isRead && <Badge color="red" />}
          {getTypeConfig(record.type).icon}
          <Text strong={!record.isRead} style={{ color: record.isRead ? '#666' : '#000' }}>
            {text}
          </Text>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => {
        const config = getTypeConfig(type);
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => getPriorityTag(priority)
    },
    {
      title: '发送人',
      dataIndex: 'sender',
      key: 'sender',
      width: 120
    },
    {
      title: '接收人',
      dataIndex: 'receiver',
      key: 'receiver',
      width: 120
    },
    {
      title: '发送时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180
    },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 80,
      render: (isRead) => (
        <Tag color={isRead ? 'default' : 'processing'}>
          {isRead ? '已读' : '未读'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {!record.isRead && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleMarkAsRead(record.id)}
            >
              标已读
            </Button>
          )}
        </Space>
      )
    }
  ];

  const Badge = ({ color, children }) => (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color === 'red' ? '#ff4d4f' : '#d9d9d9',
        marginRight: 4
      }}
    >
      {children}
    </span>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <Title level={3} style={{ marginBottom: '24px' }}>系统通知</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="通知总数"
                value={statistics.totalCount}
                prefix={<BellOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="未读通知"
                value={statistics.unreadCount}
                prefix={<ReadOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="警告通知"
                value={statistics.warningCount}
                prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="紧急通知"
                value={statistics.urgentCount}
                prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          style={{ marginBottom: '24px' }}
          bodyStyle={{ padding: '16px' }}
        >
          <Space wrap>
            <Space>
              <Text strong>关键词：</Text>
              <Input
                placeholder="标题/内容/发送人"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            </Space>
            <Space>
              <Text strong>类型：</Text>
              <Select
                placeholder="全部类型"
                style={{ width: 120 }}
                value={typeFilter}
                onChange={(value) => setTypeFilter(value)}
                allowClear
              >
                <Option value="info">通知</Option>
                <Option value="success">成功</Option>
                <Option value="warning">警告</Option>
                <Option value="urgent">紧急</Option>
              </Select>
            </Space>
            <Space>
              <Text strong>状态：</Text>
              <Radio.Group value={readFilter} onChange={(e) => setReadFilter(e.target.value)}>
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="unread">未读</Radio.Button>
                <Radio.Button value="read">已读</Radio.Button>
              </Radio.Group>
            </Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
            <Space style={{ marginLeft: 'auto' }}>
              <Button
                icon={<CheckOutlined />}
                onClick={handleMarkAllAsRead}
                disabled={statistics.unreadCount === 0}
              >
                全部已读
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                发布通知
              </Button>
            </Space>
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredNotifications}
          rowKey="id"
          locale={{
            emptyText: <Empty description="暂无通知" />
          }}
        />

        <Modal
          title="查看通知详情"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          width={700}
          destroyOnClose
        >
          {currentNotification && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card
                bordered={false}
                style={{ background: '#fafafa' }}
                bodyStyle={{ padding: '16px' }}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space size="middle">
                    {getTypeConfig(currentNotification.type).icon}
                    <Title level={4} style={{ margin: 0 }}>
                      {currentNotification.title}
                    </Title>
                    {getPriorityTag(currentNotification.priority)}
                  </Space>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="发送人">{currentNotification.sender}</Descriptions.Item>
                    <Descriptions.Item label="接收人">{currentNotification.receiver}</Descriptions.Item>
                    <Descriptions.Item label="发送时间">{currentNotification.createTime}</Descriptions.Item>
                    <Descriptions.Item label="阅读时间">
                      {currentNotification.readTime || '未读'}
                    </Descriptions.Item>
                    {currentNotification.relatedOrderNo && (
                      <Descriptions.Item label="关联订单">
                        {currentNotification.relatedOrderNo}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Space>
              </Card>

              <Divider style={{ margin: '12px 0' }} />

              <Card bordered={false} bodyStyle={{ padding: '0 16px' }}>
                <List
                  dataSource={currentNotification.content.split('\n')}
                  renderItem={(item) => (
                    <List.Item style={{ borderBottom: 'none', padding: '4px 0' }}>
                      {item || <br />}
                    </List.Item>
                  )}
                />
              </Card>
            </Space>
          )}
        </Modal>

        <Modal
          title="发布系统通知"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSubmit}
          okText="发布"
          cancelText="取消"
          width={600}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ type: 'info', priority: 'normal', receiver: '全体人员' }}
          >
            <Form.Item
              name="title"
              label="通知标题"
              rules={[{ required: true, message: '请输入通知标题' }]}
            >
              <Input placeholder="请输入通知标题" maxLength={100} showCount />
            </Form.Item>
            <Form.Item
              name="type"
              label="通知类型"
              rules={[{ required: true, message: '请选择通知类型' }]}
            >
              <Select>
                <Option value="info">通知</Option>
                <Option value="success">成功</Option>
                <Option value="warning">警告</Option>
                <Option value="urgent">紧急</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select>
                <Option value="low">低</Option>
                <Option value="normal">普通</Option>
                <Option value="high">高</Option>
                <Option value="urgent">紧急</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="receiver"
              label="接收人"
              rules={[{ required: true, message: '请输入接收人' }]}
            >
              <Select placeholder="请选择或输入接收人">
                <Option value="全体人员">全体人员</Option>
                <Option value="引航调度员">引航调度员</Option>
                <Option value="引航员">引航员</Option>
                <Option value="财务人员">财务人员</Option>
                <Option value="管理人员">管理人员</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="content"
              label="通知内容"
              rules={[{ required: true, message: '请输入通知内容' }]}
            >
              <TextArea
                rows={6}
                placeholder="请输入通知内容..."
                maxLength={2000}
                showCount
              />
            </Form.Item>
            <Form.Item
              name="relatedOrderNo"
              label="关联订单号"
            >
              <Input placeholder="请输入关联订单号（选填）" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default NotificationManagement;
