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
  Input,
  InputNumber,
  message,
  Row,
  Col,
  Descriptions,
  Statistic,
  Divider
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BillingManagement = () => {
  const [billings, setBillings] = useState([]);
  const [filteredBillings, setFilteredBillings] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentBilling, setCurrentBilling] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [statistics, setStatistics] = useState({
    totalCount: 0,
    totalAmount: 0,
    paidCount: 0,
    unpaidCount: 0
  });

  useEffect(() => {
    const mockBillings = [
      {
        id: 1,
        billingNo: 'BIL-20260601-001',
        orderNo: 'ORD-20260601-001',
        assignmentNo: 'ASG-20260605-001',
        vesselName: '中远之星',
        vesselType: '集装箱船',
        pilotageType: '进港',
        grossTonnage: 35000,
        pilotageDate: '2026-06-05',
        pilot: '张三',
        baseFee: 5000,
        tonnageFee: 3500,
        tugFee: 2000,
        nightSurcharge: 0,
        holidaySurcharge: 0,
        otherFee: 0,
        totalAmount: 10500,
        status: 'unpaid',
        createTime: '2026-06-05 18:00:00',
        paidTime: null,
        remark: ''
      },
      {
        id: 2,
        billingNo: 'BIL-20260601-002',
        orderNo: 'ORD-20260601-002',
        assignmentNo: 'ASG-20260605-002',
        vesselName: '海洋一号',
        vesselType: '散货船',
        pilotageType: '出港',
        grossTonnage: 45000,
        pilotageDate: '2026-06-05',
        pilot: '李四',
        baseFee: 5000,
        tonnageFee: 4500,
        tugFee: 2000,
        nightSurcharge: 0,
        holidaySurcharge: 0,
        otherFee: 0,
        totalAmount: 11500,
        status: 'paid',
        createTime: '2026-06-05 18:30:00',
        paidTime: '2026-06-05 19:00:00',
        remark: '银行转账'
      },
      {
        id: 3,
        billingNo: 'BIL-20260602-001',
        orderNo: 'ORD-20260602-003',
        assignmentNo: 'ASG-20260606-001',
        vesselName: '长江七号',
        vesselType: '油轮',
        pilotageType: '移泊',
        grossTonnage: 55000,
        pilotageDate: '2026-06-06',
        pilot: '王五',
        baseFee: 3000,
        tonnageFee: 5500,
        tugFee: 4000,
        nightSurcharge: 0,
        holidaySurcharge: 0,
        otherFee: 1000,
        totalAmount: 13500,
        status: 'unpaid',
        createTime: '2026-06-06 18:00:00',
        paidTime: null,
        remark: '危险品附加费1000元'
      },
      {
        id: 4,
        billingNo: 'BIL-20260603-001',
        orderNo: 'ORD-20260603-005',
        assignmentNo: 'ASG-20260607-001',
        vesselName: '东方明珠',
        vesselType: '客滚轮',
        pilotageType: '出港',
        grossTonnage: 15000,
        pilotageDate: '2026-06-07',
        pilot: '孙七',
        baseFee: 5000,
        tonnageFee: 1500,
        tugFee: 2000,
        nightSurcharge: 1500,
        holidaySurcharge: 0,
        otherFee: 0,
        totalAmount: 10000,
        status: 'paid',
        createTime: '2026-06-07 18:00:00',
        paidTime: '2026-06-07 18:30:00',
        remark: '夜班附加费1500元'
      },
      {
        id: 5,
        billingNo: 'BIL-20260608-001',
        orderNo: 'ORD-20260608-001',
        assignmentNo: 'ASG-20260610-001',
        vesselName: '南海明珠',
        vesselType: '集装箱船',
        pilotageType: '进港',
        grossTonnage: 40000,
        pilotageDate: '2026-06-10',
        pilot: '张三',
        baseFee: 5000,
        tonnageFee: 4000,
        tugFee: 2000,
        nightSurcharge: 0,
        holidaySurcharge: 2200,
        otherFee: 0,
        totalAmount: 13200,
        status: 'unpaid',
        createTime: '2026-06-10 18:00:00',
        paidTime: null,
        remark: '节假日附加费2200元'
      }
    ];

    setBillings(mockBillings);
    setFilteredBillings(mockBillings);
    updateStatistics(mockBillings);
  }, []);

  const updateStatistics = (data) => {
    const totalCount = data.length;
    const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
    const paidCount = data.filter((item) => item.status === 'paid').length;
    const unpaidCount = data.filter((item) => item.status === 'unpaid').length;

    setStatistics({
      totalCount,
      totalAmount,
      paidCount,
      unpaidCount
    });
  };

  const getStatusTag = (status) => {
    const statusMap = {
      unpaid: { color: 'warning', text: '待支付' },
      paid: { color: 'success', text: '已支付' },
      cancelled: { color: 'error', text: '已取消' },
      refunded: { color: 'default', text: '已退款' }
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
    let result = [...billings];

    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      result = result.filter((b) => b.pilotageDate >= startDate && b.pilotageDate <= endDate);
    }

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    setFilteredBillings(result);
    updateStatistics(result);
  };

  const handleReset = () => {
    setDateRange(null);
    setStatusFilter(null);
    setFilteredBillings(billings);
    updateStatistics(billings);
  };

  const handleViewDetail = (record) => {
    setCurrentBilling(record);
    setDetailVisible(true);
  };

  const handleMarkPaid = (record) => {
    Modal.confirm({
      title: '确认收款',
      content: `确认账单 ${record.billingNo} 已收到款项 ${record.totalAmount} 元？`,
      onOk: () => {
        const updatedBillings = billings.map((b) =>
          b.id === record.id
            ? { ...b, status: 'paid', paidTime: dayjs().format('YYYY-MM-DD HH:mm:ss') }
            : b
        );
        setBillings(updatedBillings);
        setFilteredBillings(updatedBillings);
        updateStatistics(updatedBillings);
        message.success('已标记为已支付');
      }
    });
  };

  const columns = [
    {
      title: '账单编号',
      dataIndex: 'billingNo',
      key: 'billingNo',
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
      title: '总吨位',
      dataIndex: 'grossTonnage',
      key: 'grossTonnage',
      render: (tonnage) => `${tonnage} 吨`
    },
    {
      title: '引航日期',
      dataIndex: 'pilotageDate',
      key: 'pilotageDate'
    },
    {
      title: '引航员',
      dataIndex: 'pilot',
      key: 'pilot'
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <Text strong style={{ color: '#52c41a' }}>¥{amount.toLocaleString()}</Text>
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
      width: 220,
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
          {record.status === 'unpaid' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleMarkPaid(record)}
              style={{ color: '#52c41a' }}
            >
              标记已付
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<PrinterOutlined />}
          >
            打印
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <Title level={3} style={{ marginBottom: '24px' }}>计费管理</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="账单总数"
                value={statistics.totalCount}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="总金额"
                value={statistics.totalAmount}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="已支付"
                value={statistics.paidCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="待支付"
                value={statistics.unpaidCount}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
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
              <Text strong>日期范围：</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
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
                <Option value="unpaid">待支付</Option>
                <Option value="paid">已支付</Option>
                <Option value="cancelled">已取消</Option>
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
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredBillings}
          rowKey="id"
        />

        <Modal
          title="费用明细"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          width={600}
        >
          {currentBilling && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="账单编号">{currentBilling.billingNo}</Descriptions.Item>
                <Descriptions.Item label="关联订单">{currentBilling.orderNo}</Descriptions.Item>
                <Descriptions.Item label="船名">{currentBilling.vesselName}</Descriptions.Item>
                <Descriptions.Item label="船舶类型">{currentBilling.vesselType}</Descriptions.Item>
                <Descriptions.Item label="引航类型">{getPilotageTypeTag(currentBilling.pilotageType)}</Descriptions.Item>
                <Descriptions.Item label="总吨位">{currentBilling.grossTonnage} 吨</Descriptions.Item>
                <Descriptions.Item label="引航日期">{currentBilling.pilotageDate}</Descriptions.Item>
                <Descriptions.Item label="引航员">{currentBilling.pilot}</Descriptions.Item>
                <Descriptions.Item label="状态">{getStatusTag(currentBilling.status)}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{currentBilling.createTime}</Descriptions.Item>
              </Descriptions>

              <Card size="small" title="费用明细">
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="基础引航费">
                        <Text style={{ float: 'right' }}>¥{currentBilling.baseFee.toLocaleString()}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="吨位费">
                        <Text style={{ float: 'right' }}>¥{currentBilling.tonnageFee.toLocaleString()}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="拖轮费">
                        <Text style={{ float: 'right' }}>¥{currentBilling.tugFee.toLocaleString()}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="夜班附加费">
                        <Text style={{ float: 'right' }}>¥{currentBilling.nightSurcharge.toLocaleString()}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="节假日附加费">
                        <Text style={{ float: 'right' }}>¥{currentBilling.holidaySurcharge.toLocaleString()}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="其他费用">
                        <Text style={{ float: 'right' }}>¥{currentBilling.otherFee.toLocaleString()}</Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={12}>
                    <Card
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f6ffed'
                      }}
                    >
                      <Space direction="vertical" align="center">
                        <Text type="secondary">应收总额</Text>
                        <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                          ¥{currentBilling.totalAmount.toLocaleString()}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>

              {currentBilling.remark && (
                <Alert
                  message="备注"
                  description={currentBilling.remark}
                  type="info"
                  showIcon
                />
              )}

              {currentBilling.paidTime && (
                <Alert
                  message="支付信息"
                  description={`支付时间：${currentBilling.paidTime}`}
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                />
              )}
            </Space>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default BillingManagement;
