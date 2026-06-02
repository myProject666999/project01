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
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CompassOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const VesselManagement = () => {
  const [vessels, setVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVessel, setEditingVessel] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [statistics, setStatistics] = useState({
    totalCount: 0,
    activeCount: 0,
    inactiveCount: 0
  });

  useEffect(() => {
    const mockVessels = [
      {
        id: 1,
        vesselName: '中远之星',
        englishName: 'COSCO STAR',
        imoNo: 'IMO9700001',
        callSign: 'V7GT',
        vesselType: '集装箱船',
        grossTonnage: 35000,
        netTonnage: 18000,
        deadweight: 50000,
        length: 228,
        width: 32,
        draft: 8.5,
        flag: '巴拿马',
        buildYear: 2015,
        owner: '中远海运集团',
        operator: '中远海运集装箱运输有限公司',
        status: 'active',
        createTime: '2026-01-15 10:30:00',
        remark: '主力集装箱船舶，定期航线'
      },
      {
        id: 2,
        vesselName: '海洋一号',
        englishName: 'OCEAN ONE',
        imoNo: 'IMO9650002',
        callSign: 'S4TW',
        vesselType: '散货船',
        grossTonnage: 45000,
        netTonnage: 25000,
        deadweight: 70000,
        length: 245,
        width: 38,
        draft: 10.5,
        flag: '利比里亚',
        buildYear: 2012,
        owner: '中国远洋运输集团',
        operator: '中远散货运输有限公司',
        status: 'active',
        createTime: '2026-02-20 14:20:00',
        remark: ''
      },
      {
        id: 3,
        vesselName: '长江七号',
        englishName: 'YANGTZE SEVEN',
        imoNo: 'IMO9800003',
        callSign: 'BVAQ',
        vesselType: '油轮',
        grossTonnage: 55000,
        netTonnage: 30000,
        deadweight: 85000,
        length: 250,
        width: 42,
        draft: 12.0,
        flag: '新加坡',
        buildYear: 2018,
        owner: '中国石化集团',
        operator: '中国石化海运有限公司',
        status: 'active',
        createTime: '2026-03-10 09:15:00',
        remark: '危险品运输船舶'
      },
      {
        id: 4,
        vesselName: '东方明珠',
        englishName: 'ORIENTAL PEARL',
        imoNo: 'IMO9580004',
        callSign: '9VV3',
        vesselType: '客滚轮',
        grossTonnage: 15000,
        netTonnage: 8000,
        deadweight: 5000,
        length: 180,
        width: 26,
        draft: 6.5,
        flag: '中国',
        buildYear: 2010,
        owner: '上海国际港务集团',
        operator: '上海客轮公司',
        status: 'active',
        createTime: '2026-04-05 16:45:00',
        remark: ''
      },
      {
        id: 5,
        vesselName: '南海明珠',
        englishName: 'SOUTH CHINA PEARL',
        imoNo: 'IMO9750005',
        callSign: 'VRLO',
        vesselType: '集装箱船',
        grossTonnage: 40000,
        netTonnage: 20000,
        deadweight: 55000,
        length: 235,
        width: 34,
        draft: 9.0,
        flag: '香港',
        buildYear: 2016,
        owner: '中远海运集团',
        operator: '中远海运集装箱运输有限公司',
        status: 'inactive',
        createTime: '2026-05-12 11:00:00',
        remark: '进厂维修中，预计6月15日恢复运营'
      },
      {
        id: 6,
        vesselName: '黄海号',
        englishName: 'YELLOW SEA',
        imoNo: 'IMO9680006',
        callSign: 'MBNC',
        vesselType: '散货船',
        grossTonnage: 38000,
        netTonnage: 21000,
        deadweight: 60000,
        length: 230,
        width: 36,
        draft: 9.8,
        flag: '巴拿马',
        buildYear: 2014,
        owner: '山东海运股份有限公司',
        operator: '山东海运股份有限公司',
        status: 'active',
        createTime: '2026-05-20 08:30:00',
        remark: ''
      }
    ];

    setVessels(mockVessels);
    setFilteredVessels(mockVessels);
    updateStatistics(mockVessels);
  }, []);

  const updateStatistics = (data) => {
    const totalCount = data.length;
    const activeCount = data.filter((v) => v.status === 'active').length;
    const inactiveCount = data.filter((v) => v.status === 'inactive').length;

    setStatistics({
      totalCount,
      activeCount,
      inactiveCount
    });
  };

  const getStatusTag = (status) => {
    const statusMap = {
      active: { color: 'success', text: '正常' },
      inactive: { color: 'warning', text: '停用' },
      maintenance: { color: 'processing', text: '维修中' }
    };
    const info = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const getVesselTypeTag = (type) => {
    const colorMap = {
      '集装箱船': 'blue',
      '散货船': 'green',
      '油轮': 'orange',
      '客滚轮': 'purple',
      '液化气船': 'red',
      '化学品船': 'cyan'
    };
    return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
  };

  const handleSearch = () => {
    let result = [...vessels];

    if (searchText) {
      result = result.filter(
        (v) =>
          v.vesselName.includes(searchText) ||
          v.englishName.includes(searchText) ||
          v.imoNo.includes(searchText) ||
          v.callSign.includes(searchText)
      );
    }

    if (typeFilter) {
      result = result.filter((v) => v.vesselType === typeFilter);
    }

    setFilteredVessels(result);
    updateStatistics(result);
  };

  const handleReset = () => {
    setSearchText('');
    setTypeFilter(null);
    setFilteredVessels(vessels);
    updateStatistics(vessels);
  };

  const handleAdd = () => {
    setEditingVessel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingVessel(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    const updatedVessels = vessels.filter((v) => v.id !== id);
    setVessels(updatedVessels);
    setFilteredVessels(updatedVessels);
    updateStatistics(updatedVessels);
    message.success('删除成功');
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingVessel) {
        const updatedVessels = vessels.map((v) =>
          v.id === editingVessel.id ? { ...v, ...values } : v
        );
        setVessels(updatedVessels);
        setFilteredVessels(updatedVessels);
        updateStatistics(updatedVessels);
        message.success('更新成功');
      } else {
        const newVessel = {
          ...values,
          id: Math.max(...vessels.map((v) => v.id)) + 1,
          createTime: new Date().toLocaleString('zh-CN')
        };
        const updatedVessels = [...vessels, newVessel];
        setVessels(updatedVessels);
        setFilteredVessels(updatedVessels);
        updateStatistics(updatedVessels);
        message.success('新增成功');
      }
      setModalVisible(false);
    });
  };

  const columns = [
    {
      title: '船名',
      dataIndex: 'vesselName',
      key: 'vesselName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.englishName}
          </Text>
        </Space>
      )
    },
    {
      title: 'IMO编号',
      dataIndex: 'imoNo',
      key: 'imoNo'
    },
    {
      title: '呼号',
      dataIndex: 'callSign',
      key: 'callSign'
    },
    {
      title: '船舶类型',
      dataIndex: 'vesselType',
      key: 'vesselType',
      render: (type) => getVesselTypeTag(type)
    },
    {
      title: '总吨位',
      dataIndex: 'grossTonnage',
      key: 'grossTonnage',
      render: (tonnage) => `${tonnage} 吨`
    },
    {
      title: '吃水',
      dataIndex: 'draft',
      key: 'draft',
      render: (draft) => `${draft} 米`
    },
    {
      title: '船旗',
      dataIndex: 'flag',
      key: 'flag'
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除船舶 "${record.vesselName}" 吗？`}
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
        <Title level={3} style={{ marginBottom: '24px' }}>船舶管理</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8} lg={6}>
            <Card size="small">
              <Statistic
                title="船舶总数"
                value={statistics.totalCount}
                prefix={<CompassOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Card size="small">
              <Statistic
                title="正常运营"
                value={statistics.activeCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Card size="small">
              <Statistic
                title="停用/维修"
                value={statistics.inactiveCount}
                prefix={<WarningOutlined style={{ color: '#faad14' }} />}
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
                placeholder="船名/英文名/IMO/呼号"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
            </Space>
            <Space>
              <Text strong>船舶类型：</Text>
              <Select
                placeholder="全部类型"
                style={{ width: 140 }}
                value={typeFilter}
                onChange={(value) => setTypeFilter(value)}
                allowClear
              >
                <Option value="集装箱船">集装箱船</Option>
                <Option value="散货船">散货船</Option>
                <Option value="油轮">油轮</Option>
                <Option value="客滚轮">客滚轮</Option>
                <Option value="液化气船">液化气船</Option>
                <Option value="化学品船">化学品船</Option>
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
              新增船舶
            </Button>
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredVessels}
          rowKey="id"
        />

        <Modal
          title={editingVessel ? '编辑船舶' : '新增船舶'}
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
            initialValues={{ status: 'active' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vesselName"
                  label="船名"
                  rules={[{ required: true, message: '请输入船名' }]}
                >
                  <Input placeholder="请输入船名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="englishName"
                  label="英文船名"
                  rules={[{ required: true, message: '请输入英文船名' }]}
                >
                  <Input placeholder="请输入英文船名" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="imoNo"
                  label="IMO编号"
                  rules={[{ required: true, message: '请输入IMO编号' }]}
                >
                  <Input placeholder="例如：IMO9700001" />
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
                  name="vesselType"
                  label="船舶类型"
                  rules={[{ required: true, message: '请选择船舶类型' }]}
                >
                  <Select placeholder="请选择船舶类型">
                    <Option value="集装箱船">集装箱船</Option>
                    <Option value="散货船">散货船</Option>
                    <Option value="油轮">油轮</Option>
                    <Option value="客滚轮">客滚轮</Option>
                    <Option value="液化气船">液化气船</Option>
                    <Option value="化学品船">化学品船</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="grossTonnage"
                  label="总吨位（吨）"
                  rules={[{ required: true, message: '请输入总吨位' }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="请输入总吨位"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="netTonnage"
                  label="净吨位（吨）"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="请输入净吨位"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="deadweight"
                  label="载重吨（吨）"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="请输入载重吨"
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
                  <Input placeholder="例如：巴拿马" />
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
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Select placeholder="请选择状态">
                    <Option value="active">正常</Option>
                    <Option value="inactive">停用</Option>
                    <Option value="maintenance">维修中</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="owner"
                  label="船东"
                >
                  <Input placeholder="请输入船东名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="operator"
                  label="经营人"
                >
                  <Input placeholder="请输入经营人名称" />
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

export default VesselManagement;
