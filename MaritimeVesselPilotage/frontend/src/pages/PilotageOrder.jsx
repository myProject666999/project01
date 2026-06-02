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
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Col,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PilotageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [modalType, setModalType] = useState('add');
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    const mockOrders = [
      {
        id: 1,
        orderNo: 'ORD-20260601-001',
        vesselName: '中远之星',
        vesselType: '集装箱船',
        imoNo: 'IMO9876543',
        draft: 8.5,
        pilotageType: '进港',
        fromPort: '上海港',
        toPort: '宁波舟山港',
        requestDate: '2026-06-05',
        requestTime: '08:00',
        applicant: '中远海运',
        contact: '13800138001',
        status: 'pending',
        createTime: '2026-06-01 10:30:00',
        remark: '需要大型拖轮协助',
        cargoType: '集装箱',
        grossTonnage: 35000
      },
      {
        id: 2,
        orderNo: 'ORD-20260601-002',
        vesselName: '海洋一号',
        vesselType: '散货船',
        imoNo: 'IMO9876544',
        draft: 10.2,
        pilotageType: '出港',
        fromPort: '宁波舟山港',
        toPort: '新加坡港',
        requestDate: '2026-06-05',
        requestTime: '14:00',
        applicant: '中外运',
        contact: '13800138002',
        status: 'approved',
        createTime: '2026-06-01 11:45:00',
        remark: '',
        cargoType: '煤炭',
        grossTonnage: 45000
      },
      {
        id: 3,
        orderNo: 'ORD-20260602-003',
        vesselName: '长江七号',
        vesselType: '油轮',
        imoNo: 'IMO9876545',
        draft: 9.8,
        pilotageType: '移泊',
        fromPort: '1号码头',
        toPort: '3号码头',
        requestDate: '2026-06-06',
        requestTime: '10:00',
        applicant: '中石化',
        contact: '13800138003',
        status: 'pending',
        createTime: '2026-06-02 09:15:00',
        remark: '危险品船舶，需要特殊防护',
        cargoType: '原油',
        grossTonnage: 55000
      },
      {
        id: 4,
        orderNo: 'ORD-20260602-004',
        vesselName: '海巡168',
        vesselType: '公务船',
        imoNo: 'IMO9876546',
        draft: 5.5,
        pilotageType: '进港',
        fromPort: '舟山群岛',
        toPort: '宁波舟山港',
        requestDate: '2026-06-06',
        requestTime: '09:00',
        applicant: '海事局',
        contact: '13800138004',
        status: 'rejected',
        createTime: '2026-06-02 14:20:00',
        remark: '日期冲突，建议改期',
        cargoType: '无',
        grossTonnage: 3000
      },
      {
        id: 5,
        orderNo: 'ORD-20260603-005',
        vesselName: '东方明珠',
        vesselType: '客滚轮',
        imoNo: 'IMO9876547',
        draft: 6.8,
        pilotageType: '出港',
        fromPort: '宁波舟山港',
        toPort: '上海港',
        requestDate: '2026-06-07',
        requestTime: '16:00',
        applicant: '渤海轮渡',
        contact: '13800138005',
        status: 'approved',
        createTime: '2026-06-03 08:00:00',
        remark: '载有乘客250人',
        cargoType: '旅客/车辆',
        grossTonnage: 15000
      }
    ];

    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'warning', text: '待审核' },
      approved: { color: 'success', text: '已通过' },
      rejected: { color: 'error', text: '已拒绝' },
      assigned: { color: 'processing', text: '已分配' },
      completed: { color: 'default', text: '已完成' }
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
    searchForm.validateFields().then((values) => {
      let result = [...orders];

      if (values.orderNo) {
        result = result.filter((o) =>
          o.orderNo.toLowerCase().includes(values.orderNo.toLowerCase())
        );
      }
      if (values.vesselName) {
        result = result.filter((o) =>
          o.vesselName.toLowerCase().includes(values.vesselName.toLowerCase())
        );
      }
      if (statusFilter) {
        result = result.filter((o) => o.status === statusFilter);
      }
      if (values.requestDate) {
        const dateStr = values.requestDate.format('YYYY-MM-DD');
        result = result.filter((o) => o.requestDate === dateStr);
      }

      setFilteredOrders(result);
    });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setStatusFilter(null);
    setFilteredOrders(orders);
  };

  const handleAdd = () => {
    setModalType('add');
    setCurrentOrder(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    if (record.status !== 'pending') {
      message.warning('只能编辑待审核状态的订单');
      return;
    }
    setModalType('edit');
    setCurrentOrder(record);
    form.setFieldsValue({
      ...record,
      requestDate: dayjs(record.requestDate)
    });
    setModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setCurrentOrder(record);
    setDetailVisible(true);
  };

  const handleDelete = (id) => {
    const updatedOrders = orders.filter((o) => o.id !== id);
    setOrders(updatedOrders);
    setFilteredOrders(updatedOrders);
    message.success('删除成功');
  };

  const handleApprove = (record) => {
    const updatedOrders = orders.map((o) =>
      o.id === record.id ? { ...o, status: 'approved' } : o
    );
    setOrders(updatedOrders);
    setFilteredOrders(updatedOrders);
    message.success('审核通过');
  };

  const handleReject = (record) => {
    Modal.confirm({
      title: '拒绝原因',
      content: (
        <Input.TextArea
          rows={4}
          placeholder="请输入拒绝原因"
          id="rejectReason"
        />
      ),
      onOk: () => {
        const reason = document.getElementById('rejectReason')?.value;
        const updatedOrders = orders.map((o) =>
          o.id === record.id ? { ...o, status: 'rejected', remark: reason } : o
        );
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        message.success('已拒绝');
      }
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (modalType === 'add') {
        const newOrder = {
          id: orders.length + 1,
          orderNo: `ORD-${dayjs().format('YYYYMMDD')}-${String(orders.length + 1).padStart(3, '0')}`,
          ...values,
          requestDate: values.requestDate.format('YYYY-MM-DD'),
          status: 'pending',
          createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        const updatedOrders = [...orders, newOrder];
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        message.success('创建成功');
      } else {
        const updatedOrders = orders.map((o) =>
          o.id === currentOrder.id
            ? {
                ...o,
                ...values,
                requestDate: values.requestDate.format('YYYY-MM-DD')
              }
            : o
        );
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        message.success('更新成功');
      }
      setModalVisible(false);
    });
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '船名',
      dataIndex: 'vesselName',
      key: 'vesselName'
    },
    {
      title: '船舶类型',
      dataIndex: 'vesselType',
      key: 'vesselType'
    },
    {
      title: '吃水',
      dataIndex: 'draft',
      key: 'draft',
      render: (draft) => `${draft} 米`
    },
    {
      title: '引航类型',
      dataIndex: 'pilotageType',
      key: 'pilotageType',
      render: (type) => getPilotageTypeTag(type)
    },
    {
      title: '申请日期',
      dataIndex: 'requestDate',
      key: 'requestDate'
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant'
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
      width: 280,
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
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status !== 'pending'}
          >
            编辑
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
                style={{ color: '#52c41a' }}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
                style={{ color: '#ff4d4f' }}
              >
                拒绝
              </Button>
            </>
          )}
          <Popconfirm
            title="确定删除此订单？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0 }}>预约管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增预约
          </Button>
        </div>

        <Card
          style={{ marginBottom: '24px' }}
          bodyStyle={{ padding: '16px' }}
        >
          <Form form={searchForm} layout="inline">
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col>
                <Form.Item name="orderNo" label="订单编号">
                  <Input placeholder="请输入订单编号" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="vesselName" label="船名">
                  <Input placeholder="请输入船名" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="状态">
                  <Select
                    placeholder="全部状态"
                    style={{ width: 120 }}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    allowClear
                  >
                    <Option value="pending">待审核</Option>
                    <Option value="approved">已通过</Option>
                    <Option value="rejected">已拒绝</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="requestDate" label="申请日期">
                  <DatePicker style={{ width: 150 }} />
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
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
        />

        <Modal
          title={modalType === 'add' ? '新增预约' : '编辑预约'}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={() => setModalVisible(false)}
          width={700}
          destroyOnClose
        >
          <Form form={form} layout="vertical">
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
                  name="imoNo"
                  label="IMO编号"
                  rules={[{ required: true, message: '请输入IMO编号' }]}
                >
                  <Input placeholder="请输入IMO编号" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
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
                    <Option value="公务船">公务船</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="draft"
                  label="吃水(米)"
                  rules={[{ required: true, message: '请输入吃水' }]}
                >
                  <InputNumber
                    min={3}
                    max={20}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="请输入吃水"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="grossTonnage"
                  label="总吨位"
                  rules={[{ required: true, message: '请输入总吨位' }]}
                >
                  <InputNumber
                    min={100}
                    step={100}
                    style={{ width: '100%' }}
                    placeholder="请输入总吨位"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cargoType"
                  label="货物类型"
                  rules={[{ required: true, message: '请输入货物类型' }]}
                >
                  <Input placeholder="请输入货物类型" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="pilotageType"
                  label="引航类型"
                  rules={[{ required: true, message: '请选择引航类型' }]}
                >
                  <Select placeholder="请选择引航类型">
                    <Option value="进港">进港</Option>
                    <Option value="出港">出港</Option>
                    <Option value="移泊">移泊</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="requestDate"
                  label="申请日期"
                  rules={[{ required: true, message: '请选择申请日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="requestTime"
                  label="申请时间"
                  rules={[{ required: true, message: '请输入申请时间' }]}
                >
                  <Input placeholder="例: 08:00" />
                </Form.Item>
              </Col>
              <Col span={12}></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fromPort"
                  label="始发港"
                  rules={[{ required: true, message: '请输入始发港' }]}
                >
                  <Input placeholder="请输入始发港" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="toPort"
                  label="目的港"
                  rules={[{ required: true, message: '请输入目的港' }]}
                >
                  <Input placeholder="请输入目的港" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="applicant"
                  label="申请人"
                  rules={[{ required: true, message: '请输入申请人' }]}
                >
                  <Input placeholder="请输入申请人" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contact"
                  label="联系方式"
                  rules={[{ required: true, message: '请输入联系方式' }]}
                >
                  <Input placeholder="请输入联系方式" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="remark"
              label="备注"
            >
              <TextArea rows={3} placeholder="请输入备注" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="订单详情"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          width={700}
        >
          {currentOrder && (
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="订单编号">{currentOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(currentOrder.status)}</Descriptions.Item>
              <Descriptions.Item label="船名">{currentOrder.vesselName}</Descriptions.Item>
              <Descriptions.Item label="IMO编号">{currentOrder.imoNo}</Descriptions.Item>
              <Descriptions.Item label="船舶类型">{currentOrder.vesselType}</Descriptions.Item>
              <Descriptions.Item label="总吨位">{currentOrder.grossTonnage}</Descriptions.Item>
              <Descriptions.Item label="吃水">{currentOrder.draft} 米</Descriptions.Item>
              <Descriptions.Item label="货物类型">{currentOrder.cargoType}</Descriptions.Item>
              <Descriptions.Item label="引航类型">{getPilotageTypeTag(currentOrder.pilotageType)}</Descriptions.Item>
              <Descriptions.Item label="申请时间">{currentOrder.requestDate} {currentOrder.requestTime}</Descriptions.Item>
              <Descriptions.Item label="始发港">{currentOrder.fromPort}</Descriptions.Item>
              <Descriptions.Item label="目的港">{currentOrder.toPort}</Descriptions.Item>
              <Descriptions.Item label="申请人">{currentOrder.applicant}</Descriptions.Item>
              <Descriptions.Item label="联系方式">{currentOrder.contact}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentOrder.createTime}</Descriptions.Item>
              <Descriptions.Item label="订单来源">系统录入</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{currentOrder.remark || '无'}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default PilotageOrder;
