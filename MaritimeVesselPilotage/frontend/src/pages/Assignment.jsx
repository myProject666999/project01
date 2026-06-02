import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Space,
  Typography,
  Card,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  message,
  Row,
  Col,
  Descriptions,
  List,
  Input,
  Checkbox,
  Alert
} from 'antd';
import {
  UserOutlined,
  ScheduleOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [form] = Form.useForm();
  const [pilots, setPilots] = useState([]);
  const [tugs, setTugs] = useState([]);
  const [tideWindows, setTideWindows] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedTugs, setSelectedTugs] = useState([]);

  useEffect(() => {
    const mockAssignments = [
      {
        id: 1,
        assignmentNo: 'ASG-20260605-001',
        orderNo: 'ORD-20260601-001',
        vesselName: '中远之星',
        vesselType: '集装箱船',
        draft: 8.5,
        pilotageType: '进港',
        fromPort: '上海港',
        toPort: '宁波舟山港',
        requestDate: '2026-06-05',
        requestTime: '08:00',
        pilot: null,
        tideWindow: null,
        tugs: [],
        status: 'pending',
        remark: '需要大型拖轮协助',
        createTime: '2026-06-01 10:30:00'
      },
      {
        id: 2,
        assignmentNo: 'ASG-20260605-002',
        orderNo: 'ORD-20260601-002',
        vesselName: '海洋一号',
        vesselType: '散货船',
        draft: 10.2,
        pilotageType: '出港',
        fromPort: '宁波舟山港',
        toPort: '新加坡港',
        requestDate: '2026-06-05',
        requestTime: '14:00',
        pilot: { id: 1, name: '张三', level: '一级引航员' },
        tideWindow: { id: 1, startTime: '13:00', endTime: '17:00', maxHeight: 11.2 },
        tugs: [{ id: 1, name: '拖轮001', type: '大型' }],
        status: 'assigned',
        remark: '',
        createTime: '2026-06-01 11:45:00'
      },
      {
        id: 3,
        assignmentNo: 'ASG-20260606-001',
        orderNo: 'ORD-20260602-003',
        vesselName: '长江七号',
        vesselType: '油轮',
        draft: 9.8,
        pilotageType: '移泊',
        fromPort: '1号码头',
        toPort: '3号码头',
        requestDate: '2026-06-06',
        requestTime: '10:00',
        pilot: { id: 2, name: '李四', level: '一级引航员' },
        tideWindow: { id: 2, startTime: '09:00', endTime: '14:00', maxHeight: 10.8 },
        tugs: [
          { id: 1, name: '拖轮001', type: '大型' },
          { id: 2, name: '拖轮002', type: '中型' }
        ],
        status: 'in_progress',
        remark: '危险品船舶，需要特殊防护',
        createTime: '2026-06-02 09:15:00'
      },
      {
        id: 4,
        assignmentNo: 'ASG-20260607-001',
        orderNo: 'ORD-20260603-005',
        vesselName: '东方明珠',
        vesselType: '客滚轮',
        draft: 6.8,
        pilotageType: '出港',
        fromPort: '宁波舟山港',
        toPort: '上海港',
        requestDate: '2026-06-07',
        requestTime: '16:00',
        pilot: null,
        tideWindow: null,
        tugs: [],
        status: 'pending',
        remark: '载有乘客250人',
        createTime: '2026-06-03 08:00:00'
      }
    ];

    const mockPilots = [
      { id: 1, name: '张三', licenseLevel: '一级引航员', status: 'available', todayTasks: 2 },
      { id: 2, name: '李四', licenseLevel: '一级引航员', status: 'available', todayTasks: 1 },
      { id: 3, name: '王五', licenseLevel: '二级引航员', status: 'available', todayTasks: 0 },
      { id: 5, name: '孙七', licenseLevel: '三级引航员', status: 'on_duty', todayTasks: 3 },
      { id: 6, name: '周八', licenseLevel: '三级引航员', status: 'available', todayTasks: 0 }
    ];

    const mockTugs = [
      { id: 1, name: '拖轮001', type: '大型', power: '5000HP', status: 'available' },
      { id: 2, name: '拖轮002', type: '中型', power: '3000HP', status: 'available' },
      { id: 3, name: '拖轮003', type: '小型', power: '2000HP', status: 'available' },
      { id: 4, name: '拖轮004', type: '大型', power: '5000HP', status: 'in_use' },
      { id: 5, name: '拖轮005', type: '中型', power: '3000HP', status: 'maintenance' }
    ];

    const mockTideWindows = [
      { id: 1, date: '2026-06-05', startTime: '06:00', endTime: '10:00', maxHeight: 10.5, minHeight: 8.0 },
      { id: 2, date: '2026-06-05', startTime: '13:00', endTime: '17:00', maxHeight: 11.2, minHeight: 8.5 },
      { id: 3, date: '2026-06-05', startTime: '19:00', endTime: '23:00', maxHeight: 10.8, minHeight: 8.2 },
      { id: 4, date: '2026-06-06', startTime: '07:00', endTime: '11:00', maxHeight: 10.3, minHeight: 7.8 },
      { id: 5, date: '2026-06-06', startTime: '14:00', endTime: '18:00', maxHeight: 11.0, minHeight: 8.3 }
    ];

    setAssignments(mockAssignments);
    setFilteredAssignments(mockAssignments);
    setPilots(mockPilots);
    setTugs(mockTugs);
    setTideWindows(mockTideWindows);
  }, []);

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'warning', text: '待分配' },
      assigned: { color: 'processing', text: '已分配' },
      in_progress: { color: 'processing', text: '进行中' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'error', text: '已取消' }
    };
    const info = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const getPilotageTypeTag = (type) => {
    const colorMap = {
      '进港': 'blue',
      '出港': 'green',
      '移泊': 'orange'
    };
    return <Tag color={colorMap[type]}>{type}</Tag>;
  };

  const handleSearch = () => {
    let result = [...assignments];
    if (statusFilter) {
      result = result.filter((a) => a.status === statusFilter);
    }
    setFilteredAssignments(result);
  };

  const handleReset = () => {
    setStatusFilter(null);
    setFilteredAssignments(assignments);
  };

  const handleAssign = (record) => {
    if (record.status !== 'pending') {
      message.warning('只能分配待分配状态的任务');
      return;
    }
    setCurrentAssignment(record);
    setSelectedTugs([]);
    form.resetFields();
    form.setFieldsValue({
      pilotId: null,
      tideWindowId: null
    });
    setModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setCurrentAssignment(record);
    setDetailVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const selectedPilot = pilots.find((p) => p.id === values.pilotId);
      const selectedTideWindow = tideWindows.find((t) => t.id === values.tideWindowId);
      const selectedTugObjects = tugs.filter((t) => selectedTugs.includes(t.id));

      if (selectedTideWindow && currentAssignment) {
        const minHeight = selectedTideWindow.minHeight;
        const requiredHeight = currentAssignment.draft + 0.5;
        if (minHeight < requiredHeight) {
          Modal.confirm({
            title: '潮汐窗口警告',
            content: `所选潮汐窗口最低潮高 ${minHeight} 米，低于船舶安全吃水要求 ${requiredHeight} 米，是否继续？`,
            okText: '继续',
            cancelText: '重新选择',
            onOk: () => {
              saveAssignment(values, selectedPilot, selectedTideWindow, selectedTugObjects);
            }
          });
          return;
        }
      }

      saveAssignment(values, selectedPilot, selectedTideWindow, selectedTugObjects);
    });
  };

  const saveAssignment = (values, pilot, tideWindow, selectedTugObjects) => {
    const updatedAssignments = assignments.map((a) =>
      a.id === currentAssignment.id
        ? {
            ...a,
            pilot,
            tideWindow,
            tugs: selectedTugObjects,
            status: 'assigned'
          }
        : a
    );
    setAssignments(updatedAssignments);
    setFilteredAssignments(updatedAssignments);
    setModalVisible(false);
    message.success('分配成功');
  };

  const handleTugChange = (checkedValues) => {
    setSelectedTugs(checkedValues);
  };

  const columns = [
    {
      title: '任务编号',
      dataIndex: 'assignmentNo',
      key: 'assignmentNo',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '船名',
      dataIndex: 'vesselName',
      key: 'vesselName'
    },
    {
      title: '引航类型',
      dataIndex: 'pilotageType',
      key: 'pilotageType',
      render: (type) => getPilotageTypeTag(type)
    },
    {
      title: '计划日期',
      dataIndex: 'requestDate',
      key: 'requestDate'
    },
    {
      title: '引航员',
      dataIndex: 'pilot',
      key: 'pilot',
      render: (pilot) => pilot ? pilot.name : <Text type="secondary">未分配</Text>
    },
    {
      title: '潮汐窗口',
      dataIndex: 'tideWindow',
      key: 'tideWindow',
      render: (window) =>
        window ? `${window.startTime}-${window.endTime}` : <Text type="secondary">未选择</Text>
    },
    {
      title: '拖轮',
      dataIndex: 'tugs',
      key: 'tugs',
      render: (tugs) =>
        tugs.length > 0 ? tugs.map((t) => t.name).join(', ') : <Text type="secondary">未安排</Text>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
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
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<ScheduleOutlined />}
              onClick={() => handleAssign(record)}
            >
              分配
            </Button>
          )}
        </Space>
      )
    }
  ];

  const availablePilots = pilots.filter((p) => p.status === 'available');
  const availableTugs = tugs.filter((t) => t.status === 'available');

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <Title level={3} style={{ marginBottom: '24px' }}>任务分配</Title>

        <Card
          style={{ marginBottom: '24px' }}
          bodyStyle={{ padding: '16px' }}
        >
          <Space>
            <Text strong>状态：</Text>
            <Select
              placeholder="全部状态"
              style={{ width: 120 }}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              allowClear
            >
              <Option value="pending">待分配</Option>
              <Option value="assigned">已分配</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
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
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredAssignments}
          rowKey="id"
        />

        <Modal
          title="任务分配"
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={() => setModalVisible(false)}
          width={700}
          destroyOnClose
        >
          {currentAssignment && (
            <Alert
              message={
                <Space>
                  <RocketOutlined />
                  {currentAssignment.vesselName} - {currentAssignment.pilotageType}
                  <Tag color="blue">吃水 {currentAssignment.draft}m</Tag>
                  <Tag color="orange">安全水深 {currentAssignment.draft + 0.5}m</Tag>
                </Space>
              }
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />
          )}
          <Form form={form} layout="vertical">
            <Form.Item
              name="pilotId"
              label="分配引航员"
              rules={[{ required: true, message: '请选择引航员' }]}
            >
              <Select placeholder="请选择引航员">
                {availablePilots.map((pilot) => (
                  <Option key={pilot.id} value={pilot.id}>
                    <Space>
                      <UserOutlined />
                      {pilot.name}
                      <Tag color="blue">{pilot.licenseLevel}</Tag>
                      <Text type="secondary">今日任务: {pilot.todayTasks}</Text>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="tideWindowId"
              label="选择潮汐窗口"
              rules={[{ required: true, message: '请选择潮汐窗口' }]}
            >
              <Select placeholder="请选择潮汐窗口">
                {tideWindows
                  .filter((t) => currentAssignment && t.date === currentAssignment.requestDate)
                  .map((window) => {
                    const isSuitable = currentAssignment && window.minHeight >= currentAssignment.draft + 0.5;
                    return (
                      <Option key={window.id} value={window.id}>
                        <Space>
                          {isSuitable ? (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          ) : (
                            <WarningOutlined style={{ color: '#faad14' }} />
                          )}
                          <span>{window.startTime} - {window.endTime}</span>
                          <Tag color={isSuitable ? 'green' : 'orange'}>
                            潮高 {window.minHeight}-{window.maxHeight}m
                          </Tag>
                        </Space>
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>

            <Form.Item
              label="安排拖轮"
              required
            >
              <Checkbox.Group
                style={{ width: '100%' }}
                onChange={handleTugChange}
                value={selectedTugs}
              >
                <Row gutter={[16, 16]}>
                  {availableTugs.map((tug) => (
                    <Col span={12} key={tug.id}>
                      <Card size="small" style={{ height: '100%' }}>
                        <Checkbox value={tug.id}>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text strong>{tug.name}</Text>
                            <Space>
                              <Tag>{tug.type}</Tag>
                              <Text type="secondary">{tug.power}</Text>
                            </Space>
                          </Space>
                        </Checkbox>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
              {selectedTugs.length === 0 && (
                <Text type="danger" style={{ fontSize: '12px' }}>
                  请至少选择一艘拖轮
                </Text>
              )}
            </Form.Item>

            <Form.Item
              name="remark"
              label="备注"
            >
              <TextArea rows={3} placeholder="请输入备注" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="任务详情"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          width={700}
        >
          {currentAssignment && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="任务编号">{currentAssignment.assignmentNo}</Descriptions.Item>
                <Descriptions.Item label="关联订单">{currentAssignment.orderNo}</Descriptions.Item>
                <Descriptions.Item label="船名">{currentAssignment.vesselName}</Descriptions.Item>
                <Descriptions.Item label="船舶类型">{currentAssignment.vesselType}</Descriptions.Item>
                <Descriptions.Item label="吃水">{currentAssignment.draft} 米</Descriptions.Item>
                <Descriptions.Item label="引航类型">{getPilotageTypeTag(currentAssignment.pilotageType)}</Descriptions.Item>
                <Descriptions.Item label="状态">{getStatusTag(currentAssignment.status)}</Descriptions.Item>
                <Descriptions.Item label="计划时间">{currentAssignment.requestDate} {currentAssignment.requestTime}</Descriptions.Item>
              </Descriptions>

              <Card size="small" title="引航员信息">
                {currentAssignment.pilot ? (
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="姓名">{currentAssignment.pilot.name}</Descriptions.Item>
                    <Descriptions.Item label="资质等级">{currentAssignment.pilot.level}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Text type="secondary">未分配</Text>
                )}
              </Card>

              <Card size="small" title="潮汐窗口">
                {currentAssignment.tideWindow ? (
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="时间">{currentAssignment.tideWindow.startTime} - {currentAssignment.tideWindow.endTime}</Descriptions.Item>
                    <Descriptions.Item label="最高潮高">{currentAssignment.tideWindow.maxHeight} 米</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Text type="secondary">未选择</Text>
                )}
              </Card>

              <Card size="small" title="拖轮安排">
                {currentAssignment.tugs && currentAssignment.tugs.length > 0 ? (
                  <List
                    dataSource={currentAssignment.tugs}
                    renderItem={(tug) => (
                      <List.Item key={tug.id}>
                        <Space>
                          <RocketOutlined />
                          <Text strong>{tug.name}</Text>
                          <Tag>{tug.type}</Tag>
                        </Space>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">未安排</Text>
                )}
              </Card>

              <Card size="small" title="备注">
                <Text>{currentAssignment.remark || '无'}</Text>
              </Card>
            </Space>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Assignment;
