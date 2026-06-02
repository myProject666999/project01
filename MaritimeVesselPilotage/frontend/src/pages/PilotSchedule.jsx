import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Space,
  Typography,
  Card,
  DatePicker,
  Select,
  Button,
  Modal,
  Form,
  Alert,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PilotSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState(null);
  const [selectedPilot, setSelectedPilot] = useState(null);

  useEffect(() => {
    const mockPilots = [
      { id: 1, name: '张三', licenseLevel: '一级引航员', status: '在岗' },
      { id: 2, name: '李四', licenseLevel: '一级引航员', status: '在岗' },
      { id: 3, name: '王五', licenseLevel: '二级引航员', status: '在岗' },
      { id: 4, name: '赵六', licenseLevel: '二级引航员', status: '休假' },
      { id: 5, name: '孙七', licenseLevel: '三级引航员', status: '在岗' },
      { id: 6, name: '周八', licenseLevel: '三级引航员', status: '在岗' }
    ];

    const mockSchedules = [
      {
        id: 1,
        pilotId: 1,
        pilotName: '张三',
        date: '2026-06-01',
        startTime: '08:00',
        endTime: '16:00',
        shiftType: '白班',
        taskCount: 3,
        taskDetails: ['中远之星 进港 08:30', '长江七号 移泊 14:30'],
        hasConflict: false
      },
      {
        id: 2,
        pilotId: 2,
        pilotName: '李四',
        date: '2026-06-01',
        startTime: '08:00',
        endTime: '16:00',
        shiftType: '白班',
        taskCount: 2,
        taskDetails: ['海洋一号 出港 10:00'],
        hasConflict: false
      },
      {
        id: 3,
        pilotId: 1,
        pilotName: '张三',
        date: '2026-06-02',
        startTime: '16:00',
        endTime: '24:00',
        shiftType: '夜班',
        taskCount: 2,
        taskDetails: ['夜航一号 进港 18:00', '夜航二号 出港 22:00'],
        hasConflict: false
      },
      {
        id: 4,
        pilotId: 3,
        pilotName: '王五',
        date: '2026-06-02',
        startTime: '08:00',
        endTime: '12:00',
        shiftType: '半天班',
        taskCount: 1,
        taskDetails: ['海巡168 进港 09:00'],
        hasConflict: true
      },
      {
        id: 5,
        pilotId: 3,
        pilotName: '王五',
        date: '2026-06-02',
        startTime: '11:00',
        endTime: '19:00',
        shiftType: '白班',
        taskCount: 2,
        taskDetails: ['东方明珠 出港 15:00'],
        hasConflict: true
      },
      {
        id: 6,
        pilotId: 5,
        pilotName: '孙七',
        date: '2026-06-03',
        startTime: '08:00',
        endTime: '16:00',
        shiftType: '白班',
        taskCount: 3,
        taskDetails: ['远洋一号 进港 07:00', '南海明珠 出港 11:00'],
        hasConflict: false
      },
      {
        id: 7,
        pilotId: 6,
        pilotName: '周八',
        date: '2026-06-03',
        startTime: '16:00',
        endTime: '24:00',
        shiftType: '夜班',
        taskCount: 1,
        taskDetails: ['中海之星 进港 20:00'],
        hasConflict: false
      }
    ];

    const mockConflicts = [
      {
        id: 1,
        pilotName: '王五',
        date: '2026-06-02',
        description: '排班时间重叠：08:00-12:00 与 11:00-19:00',
        scheduleIds: [4, 5]
      }
    ];

    setPilots(mockPilots);
    setSchedules(mockSchedules);
    setFilteredSchedules(mockSchedules);
    setConflicts(mockConflicts);
  }, []);

  const detectConflicts = (newSchedule) => {
    const pilotSchedules = schedules.filter(
      (s) => s.pilotId === newSchedule.pilotId && s.date === newSchedule.date
    );

    const newStart = dayjs(`${newSchedule.date} ${newSchedule.startTime}`);
    const newEnd = dayjs(`${newSchedule.date} ${newSchedule.endTime}`);

    for (const schedule of pilotSchedules) {
      const existStart = dayjs(`${schedule.date} ${schedule.startTime}`);
      const existEnd = dayjs(`${schedule.date} ${schedule.endTime}`);

      if (newStart.isBefore(existEnd) && newEnd.isAfter(existStart)) {
        return {
          hasConflict: true,
          conflictWith: schedule,
          message: `与现有排班冲突：${schedule.pilotName} ${schedule.startTime}-${schedule.endTime}`
        };
      }
    }

    return { hasConflict: false };
  };

  const handleSearch = () => {
    let result = [...schedules];

    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      result = result.filter((s) => s.date >= startDate && s.date <= endDate);
    }

    if (selectedPilot) {
      result = result.filter((s) => s.pilotId === selectedPilot);
    }

    setFilteredSchedules(result);
  };

  const handleReset = () => {
    setDateRange(null);
    setSelectedPilot(null);
    setFilteredSchedules(schedules);
    form.resetFields();
  };

  const handleAddSchedule = () => {
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const newSchedule = {
        id: schedules.length + 1,
        pilotId: values.pilotId,
        pilotName: pilots.find((p) => p.id === values.pilotId)?.name,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        shiftType: values.shiftType,
        taskCount: 0,
        taskDetails: [],
        hasConflict: false
      };

      const conflictResult = detectConflicts(newSchedule);
      if (conflictResult.hasConflict) {
        Modal.warning({
          title: '排班冲突警告',
          content: conflictResult.message
        });
        return;
      }

      const updatedSchedules = [...schedules, newSchedule];
      setSchedules(updatedSchedules);
      setFilteredSchedules(updatedSchedules);
      setModalVisible(false);
      form.resetFields();
    });
  };

  const getShiftTypeColor = (type) => {
    const colorMap = {
      '白班': 'blue',
      '夜班': 'purple',
      '半天班': 'orange',
      '休息': 'default'
    };
    return colorMap[type] || 'default';
  };

  const columns = [
    {
      title: '引航员',
      dataIndex: 'pilotName',
      key: 'pilotName',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <Text strong>{text}</Text>
          {record.hasConflict && <WarningOutlined style={{ color: '#ff4d4f' }} />}
        </Space>
      )
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (
        <Space>
          <CalendarOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '时间',
      key: 'time',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          <span>{record.startTime} - {record.endTime}</span>
        </Space>
      )
    },
    {
      title: '班次类型',
      dataIndex: 'shiftType',
      key: 'shiftType',
      render: (type) => <Tag color={getShiftTypeColor(type)}>{type}</Tag>
    },
    {
      title: '任务数量',
      dataIndex: 'taskCount',
      key: 'taskCount',
      render: (count) => <Tag color="processing">{count} 项</Tag>
    },
    {
      title: '任务详情',
      dataIndex: 'taskDetails',
      key: 'taskDetails',
      render: (details) => (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {details.map((detail, index) => (
            <li key={index} style={{ fontSize: '12px' }}>{detail}</li>
          ))}
        </ul>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) =>
        record.hasConflict ? (
          <Tag color="error">存在冲突</Tag>
        ) : (
          <Tag color="success">正常</Tag>
        )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <Title level={3} style={{ marginBottom: '24px' }}>引航员排班管理</Title>

        {conflicts.length > 0 && (
          <Alert
            message="排班冲突提醒"
            description={conflicts.map((c, idx) => (
              <div key={idx}>
                <WarningOutlined style={{ color: '#faad14', marginRight: '8px' }} />
                {c.pilotName} - {c.date}: {c.description}
              </div>
            ))}
            type="warning"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Card
          style={{ marginBottom: '24px' }}
          bodyStyle={{ padding: '16px' }}
        >
          <Form layout="inline" form={form}>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col>
                <Form.Item name="dateRange" label="日期范围">
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates)}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="pilotId" label="引航员">
                  <Select
                    placeholder="请选择引航员"
                    style={{ width: 150 }}
                    value={selectedPilot}
                    onChange={(value) => setSelectedPilot(value)}
                    allowClear
                  >
                    {pilots.map((pilot) => (
                      <Option key={pilot.id} value={pilot.id}>
                        {pilot.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Space>
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
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddSchedule}
                  >
                    新增排班
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredSchedules}
          rowKey="id"
          rowClassName={(record) => record.hasConflict ? 'conflict-row' : ''}
        />

        <Modal
          title="新增排班"
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={() => setModalVisible(false)}
          width={500}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="pilotId"
              label="引航员"
              rules={[{ required: true, message: '请选择引航员' }]}
            >
              <Select placeholder="请选择引航员">
                {pilots.filter(p => p.status === '在岗').map((pilot) => (
                  <Option key={pilot.id} value={pilot.id}>
                    {pilot.name} - {pilot.licenseLevel}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="date"
              label="排班日期"
              rules={[{ required: true, message: '请选择日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startTime"
                  label="开始时间"
                  rules={[{ required: true, message: '请选择开始时间' }]}
                >
                  <DatePicker.TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endTime"
                  label="结束时间"
                  rules={[{ required: true, message: '请选择结束时间' }]}
                >
                  <DatePicker.TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="shiftType"
              label="班次类型"
              rules={[{ required: true, message: '请选择班次类型' }]}
            >
              <Select placeholder="请选择班次类型">
                <Option value="白班">白班 (08:00-16:00)</Option>
                <Option value="夜班">夜班 (16:00-24:00)</Option>
                <Option value="半天班">半天班 (08:00-12:00)</Option>
                <Option value="休息">休息</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default PilotSchedule;
