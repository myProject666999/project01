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
  Input,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  TruckOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ToolOutlined,
  StopOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const TugManagement = () => {
  const [tugs, setTugs] = useState([]);
  const [filteredTugs, setFilteredTugs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTug, setEditingTug] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [statistics, setStatistics] = useState({
    totalCount: 0,
    availableCount: 0,
    workingCount: 0,
    maintenanceCount: 0,
    inactiveCount: 0
  });

  useEffect(() => {
    const mockTugs = [
      {
        id: 1,
        tugName: '港拖一号',
        tugNo: 'TG-001',
        imoNo: 'IMO8900001',
        callSign: 'TUG1',
        power: 3200,
        bollardPull: 50,
        length: 35,
        width: 10,
        draft: 4.5,
        maxSpeed: 12,
        tugType: '全回转拖轮',
        flag: '中国',
        buildYear: 2010,
        owner: '港务局拖轮公司',
        status: 'available',
        currentLocation: '一号锚地',
        operator: '王船长',
        crewCount: 8,
        nextMaintenance: '2026-07-15',
        createTime: '2026-01-10 09:00:00',
        remark: '主力拖轮，适用于大型船舶'
      },
      {
        id: 2,
        tugName: '港拖二号',
        tugNo: 'TG-002',
        imoNo: 'IMO8900002',
        callSign: 'TUG2',
        power: 2800,
        bollardPull: 45,
        length: 32,
        width: 9,
        draft: 4.2,
        maxSpeed: 11,
        tugType: '全回转拖轮',
        flag: '中国',
        buildYear: 2012,
        owner: '港务局拖轮公司',
        status: 'working',
        currentLocation: '作业中 - 中远之星',
        operator: '李船长',
        crewCount: 8,
        nextMaintenance: '2026-08-20',
        createTime: '2026-01-12 10:30:00',
        remark: ''
      },
      {
        id: 3,
        tugName: '港拖三号',
        tugNo: 'TG-003',
        imoNo: 'IMO8950003',
        callSign: 'TUG3',
        power: 4000,
        bollardPull: 65,
        length: 38,
        width: 11,
        draft: 4.8,
        maxSpeed: 13,
        tugType: '全回转拖轮',
        flag: '中国',
        buildYear: 2015,
        owner: '港务局拖轮公司',
        status: 'maintenance',
        currentLocation: '船厂维修',
        operator: '张船长',
        crewCount: 8,
        nextMaintenance: '2026-06-10',
        createTime: '2026-02-01 14:20:00',
        remark: '发动机大修，预计6月10日完成'
      },
      {
        id: 4,
        tugName: '港拖四号',
        tugNo: 'TG-004',
        imoNo: 'IMO8850004',
        callSign: 'TUG4',
        power: 2400,
        bollardPull: 40,
        length: 30,
        width: 8.5,
        draft: 4.0,
        maxSpeed: 10,
        tugType: '常规拖轮',
        flag: '中国',
        buildYear: 2008,
        owner: '港务局拖轮公司',
        status: 'available',
        currentLocation: '码头待命',
        operator: '刘船长',
        crewCount: 7,
        nextMaintenance: '2026-06-25',
        createTime: '2026-02-15 11:00:00',
        remark: ''
      },
      {
        id: 5,
        tugName: '港拖五号',
        tugNo: 'TG-005',
        imoNo: 'IMO9000005',
        callSign: 'TUG5',
        power: 3600,
        bollardPull: 55,
        length: 36,
        width: 10.5,
        draft: 4.6,
        maxSpeed: 12.5,
        tugType: '全回转拖轮',
        flag: '中国',
        buildYear: 2018,
        owner: '港务局拖轮公司',
        status: 'available',
        currentLocation: '二号锚地',
        operator: '陈船长',
        crewCount: 8,
        nextMaintenance: '2026-09-10',
        createTime: '2026-03-05 09:30:00',
        remark: '新型环保拖轮'
      },
      {
        id: 6,
        tugName: '港拖六号',
        tugNo: 'TG-006',
        imoNo: 'IMO8980006',
        callSign: 'TUG6',
        power: 3000,
        bollardPull: 48,
        length: 33,
        width: 9.5,
        draft: 4.3,
        maxSpeed: 11.5,
        tugType: '全回转拖轮',
        flag: '中国',
        buildYear: 2013,
        owner: '港务局拖轮公司',
        status: 'inactive',
        currentLocation: '长期停放',
        operator: '待分配',
        crewCount: 0,
        nextMaintenance: '2026-12-01',
        createTime: '2026-04-10 16:00:00',
        remark: '计划退役，待审批'
      },
      {
        id: 7,
        tugName: '港拖七号',
        tugNo: 'TG-007',
        imoNo: 'IMO9050007',
        callSign: 'TUG7',
        power: 4500,
        bollardPull: 75,
        length: 40,
        width: 12,
        draft: 5.0,
        maxSpeed: 14,
        tugType: '全回转拖轮',
        flag: '中国',
        buildYear: 2020,
        owner: '港务局拖轮公司',
        status: 'working',
        currentLocation: '作业中 - 长江七号',
        operator: '赵船长',
        crewCount: 9,
        nextMaintenance: '2026-10-15',
        createTime: '2026-05-01 08:00:00',
        remark: '重型拖轮，适用于超大型船舶'
      }
    ];

    setTugs(mockTugs);
    setFilteredTugs(mockTugs);
    updateStatistics(mockTugs);
  }, []);

  const updateStatistics = (data) => {
    const totalCount = data.length;
    const availableCount = data.filter((t) => t.status === 'available').length;
    const workingCount = data.filter((t) => t.status === 'working').length;
    const maintenanceCount = data.filter((t) => t.status === 'maintenance').length;
    const inactiveCount = data.filter((t) => t.status === 'inactive').length;

    setStatistics({
      totalCount,
      availableCount,
      workingCount,
      maintenanceCount,
      inactiveCount
    });
  };

  const getStatusConfig = (status) => {
    const statusMap = {
      available: { color: 'success', text: '待命', icon: <PlayCircleOutlined /> },
      working: { color: 'processing', text: '作业中', icon: <PauseCircleOutlined /> },
      maintenance: { color: 'warning', text: '维修中', icon: <ToolOutlined /> },
      inactive: { color: 'default', text: '停用', icon: <StopOutlined /> }
    };
    return statusMap[status] || { color: 'default', text: '未知', icon: null };
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <Badge
        status={config.color}
        text={
          <Space>
            {config.icon}
            <span>{config.text}</span>
          </Space>
        }
      />
    );
  };

  const getTugTypeTag = (type) => {
    const colorMap = {
      '全回转拖轮': 'blue',
      '常规拖轮': 'green',
      '消防拖轮': 'red',
      '救助拖轮': 'orange'
    };
    return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
  };

  const handleSearch = () => {
    let result = [...tugs];

    if (searchText) {
      result = result.filter(
        (t) =>
          t.tugName.includes(searchText) ||
          t.tugNo.includes(searchText) ||
          t.imoNo.includes(searchText) ||
          t.operator.includes(searchText)
      );
    }

    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    setFilteredTugs(result);
    updateStatistics(result);
  };

  const handleReset = () => {
    setSearchText('');
    setStatusFilter(null);
    setFilteredTugs(tugs);
    updateStatistics(tugs);
  };

  const handleAdd = () => {
    setEditingTug(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTug(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    const updatedTugs = tugs.filter((t) => t.id !== id);
    setTugs(updatedTugs);
    setFilteredTugs(updatedTugs);
    updateStatistics(updatedTugs);
    message.success('删除成功');
  };

  const handleStatusChange = (record, newStatus) => {
    const statusConfig = getStatusConfig(newStatus);
    Modal.confirm({
      title: '状态变更确认',
      content: `确定要将拖轮 "${record.tugName}" 状态变更为「${statusConfig.text}」吗？`,
      onOk: () => {
        const updatedTugs = tugs.map((t) =>
          t.id === record.id ? { ...t, status: newStatus } : t
        );
        setTugs(updatedTugs);
        setFilteredTugs(updatedTugs);
        updateStatistics(updatedTugs);
        message.success('状态更新成功');
      }
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingTug) {
        const updatedTugs = tugs.map((t) =>
          t.id === editingTug.id ? { ...t, ...values } : t
        );
        setTugs(updatedTugs);
        setFilteredTugs(updatedTugs);
        updateStatistics(updatedTugs);
        message.success('更新成功');
      } else {
        const newTug = {
          ...values,
          id: Math.max(...tugs.map((t) => t.id)) + 1,
          createTime: new Date().toLocaleString('zh-CN')
        };
        const updatedTugs = [...tugs, newTug];
        setTugs(updatedTugs);
        setFilteredTugs(updatedTugs);
        updateStatistics(updatedTugs);
        message.success('新增成功');
      }
      setModalVisible(false);
    });
  };

  const columns = [
    {
      title: '拖轮名称',
      dataIndex: 'tugName',
      key: 'tugName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.tugNo}
          </Text>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'tugType',
      key: 'tugType',
      render: (type) => getTugTypeTag(type)
    },
    {
      title: '功率',
      dataIndex: 'power',
      key: 'power',
      render: (power) => `${power} HP`
    },
    {
      title: '系柱拉力',
      dataIndex: 'bollardPull',
      key: 'bollardPull',
      render: (pull) => `${pull} 吨`
    },
    {
      title: '吃水',
      dataIndex: 'draft',
      key: 'draft',
      render: (draft) => `${draft} 米`
    },
    {
      title: '当前位置',
      dataIndex: 'currentLocation',
      key: 'currentLocation'
    },
    {
      title: '驾驶员',
      dataIndex: 'operator',
      key: 'operator'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Select
            size="small"
            style={{ width: 100 }}
            placeholder="变更状态"
            value={undefined}
            onChange={(value) => handleStatusChange(record, value)}
          >
            <Option value="available">待命</Option>
            <Option value="working">作业中</Option>
            <Option value="maintenance">维修中</Option>
            <Option value="inactive">停用</Option>
          </Select>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除拖轮 "${record.tugName}" 吗？`}
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <Title level={3} style={{ marginBottom: '24px' }}>拖轮管理</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="拖轮总数"
                value={statistics.totalCount}
                prefix={<TruckOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="待命"
                value={statistics.availableCount}
                prefix={<PlayCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="作业中"
                value={statistics.workingCount}
                prefix={<PauseCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="维修中"
                value={statistics.maintenanceCount}
                prefix={<ToolOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
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
                placeholder="拖轮名称/编号/IMO/驾驶员"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
            </Space>
            <Space>
              <Text strong>状态：</Text>
              <Select
                placeholder="全部状态"
                style={{ width: 120 }}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                allowClear
              >
                <Option value="available">待命</Option>
                <Option value="working">作业中</Option>
                <Option value="maintenance">维修中</Option>
                <Option value="inactive">停用</Option>
              </Select>
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ marginLeft: 'auto' }}
            >
              新增拖轮
            </Button>
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredTugs}
          rowKey="id"
        />

        <Modal
          title={editingTug ? '编辑拖轮' : '新增拖轮'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSubmit}
          okText="保存"
          cancelText="取消"
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ status: 'available', tugType: '全回转拖轮' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="tugName"
                  label="拖轮名称"
                  rules={[{ required: true, message: '请输入拖轮名称' }]}
                >
                  <Input placeholder="请输入拖轮名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="tugNo"
                  label="拖轮编号"
                  rules={[{ required: true, message: '请输入拖轮编号' }]}
                >
                  <Input placeholder="例如：TG-001" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="imoNo"
                  label="IMO编号"
                  rules={[{ required: true, message: '请输入IMO编号' }]}
                >
                  <Input placeholder="例如：IMO8900001" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="callSign"
                  label="呼号"
                  rules={[{ required: true, message: '请输入呼号' }]}
                >
                  <Input placeholder="请输入呼号" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="tugType"
                  label="拖轮类型"
                  rules={[{ required: true, message: '请选择拖轮类型' }]}
                >
                  <Select placeholder="请选择拖轮类型">
                    <Option value="全回转拖轮">全回转拖轮</Option>
                    <Option value="常规拖轮">常规拖轮</Option>
                    <Option value="消防拖轮">消防拖轮</Option>
                    <Option value="救助拖轮">救助拖轮</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="power"
                  label="功率（HP）"
                  rules={[{ required: true, message: '请输入功率' }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="请输入功率"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="bollardPull"
                  label="系柱拉力（吨）"
                  rules={[{ required: true, message: '请输入系柱拉力' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="请输入系柱拉力"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="maxSpeed"
                  label="最大航速（节）"
                >
                  <InputNumber
                    min={0}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="请输入最大航速"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="length"
                  label="船长（米）"
                  rules={[{ required: true, message: '请输入船长' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="请输入船长"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="width"
                  label="船宽（米）"
                  rules={[{ required: true, message: '请输入船宽' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="请输入船宽"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="draft"
                  label="吃水（米）"
                  rules={[{ required: true, message: '请输入吃水' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="请输入吃水"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="flag"
                  label="船旗"
                  rules={[{ required: true, message: '请输入船旗' }]}
                >
                  <Input placeholder="例如：中国" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="buildYear"
                  label="建造年份"
                >
                  <InputNumber
                    min={1900}
                    max={2100}
                    style={{ width: '100%' }}
                    placeholder="请输入建造年份"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="crewCount"
                  label="船员人数"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="请输入船员人数"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="owner"
                  label="所属单位"
                >
                  <Input placeholder="请输入所属单位" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="operator"
                  label="驾驶员"
                >
                  <Input placeholder="请输入驾驶员姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="currentLocation"
                  label="当前位置"
                >
                  <Input placeholder="请输入当前位置" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nextMaintenance"
                  label="下次维护日期"
                >
                  <Input placeholder="例如：2026-07-15" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Select placeholder="请选择状态">
                    <Option value="available">待命</Option>
                    <Option value="working">作业中</Option>
                    <Option value="maintenance">维修中</Option>
                    <Option value="inactive">停用</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="remark"
                  label="备注"
                >
                  <Input.TextArea rows={3} placeholder="请输入备注信息" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default TugManagement;
