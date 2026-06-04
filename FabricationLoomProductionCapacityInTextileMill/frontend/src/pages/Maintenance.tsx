import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, Statistic, message, Alert, Progress } from 'antd';
import { ReloadOutlined, PlusOutlined, PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined, ToolOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { maintenanceApi, loomApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const Maintenance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [dueLooms, setDueLooms] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loomList, setLoomList] = useState<any[]>([]);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'plans' | 'due'>('orders');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [form] = Form.useForm();
  const [completeForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, ordersRes, dueRes, summaryRes, loomRes] = await Promise.all([
        maintenanceApi.getPlans(),
        maintenanceApi.getOrders({ pageSize: 100 }),
        maintenanceApi.getDueLooms(),
        maintenanceApi.getSummary({
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        }),
        loomApi.getList({ pageSize: 200 }),
      ]);

      setPlans(plansRes.data || []);
      setOrders(ordersRes.data.list || ordersRes.data || []);
      setDueLooms(dueRes.data || []);
      setSummary(summaryRes.data);
      setLoomList(loomRes.data.list || loomRes.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusInfo = (status: number) => {
    const statusMap: Record<number, { color: string; text: string; icon: any }> = {
      0: { color: 'default', text: '待执行', icon: <ClockCircleOutlined /> },
      1: { color: 'processing', text: '执行中', icon: <PlayCircleOutlined /> },
      2: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      3: { color: 'error', text: '已取消', icon: <StopOutlined /> },
    };
    return statusMap[status] || statusMap[0];
  };

  const getMaintenanceTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      '日常保养': 'green',
      '一级保养': 'blue',
      '二级保养': 'gold',
      '三级保养': 'red',
      '故障维修': 'red',
    };
    return colorMap[type] || 'default';
  };

  const handleCreateOrder = () => {
    form.resetFields();
    setOrderModalVisible(true);
  };

  const handleSaveOrder = async () => {
    try {
      const values = await form.validateFields();
      if (values.scheduledDate) {
        values.scheduledDate = values.scheduledDate.format('YYYY-MM-DD HH:mm:ss');
      }
      await maintenanceApi.createManualOrder(values);
      message.success('保养工单创建成功');
      setOrderModalVisible(false);
      loadData();
    } catch (error) {
      console.error('创建失败:', error);
      message.error('创建失败');
    }
  };

  const handleStartOrder = async (order: any) => {
    Modal.confirm({
      title: '开始保养',
      content: `确认开始 ${order.loom?.loomCode} 的 ${order.maintenanceType}？`,
      onOk: async () => {
        try {
          await maintenanceApi.startOrder(order.id);
          message.success('已开始保养');
          loadData();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const handleCompleteOrder = (order: any) => {
    setCurrentOrder(order);
    completeForm.resetFields();
    setCompleteModalVisible(true);
  };

  const handleSaveComplete = async () => {
    try {
      const values = await completeForm.validateFields();
      await maintenanceApi.completeOrder(currentOrder.id, values);
      message.success('保养完成');
      setCompleteModalVisible(false);
      loadData();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  const handleCancelOrder = async (order: any) => {
    Modal.confirm({
      title: '取消工单',
      content: '确认取消该保养工单？',
      onOk: async () => {
        try {
          await maintenanceApi.cancelOrder(order.id);
          loadData();
          message.success('已取消');
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const orderColumns = [
    {
      title: '工单编号',
      dataIndex: 'workOrderNo',
      key: 'workOrderNo',
      width: 150,
    },
    {
      title: '织机编号',
      dataIndex: ['loom', 'loomCode'],
      key: 'loomCode',
      width: 120,
    },
    {
      title: '保养类型',
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
      width: 120,
      render: (type: string) => <Tag color={getMaintenanceTypeColor(type)}>{type}</Tag>,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => source === 'auto' ? <Tag color="blue">自动生成</Tag> : <Tag>手动创建</Tag>,
    },
    {
      title: '计划时间',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      width: 160,
      render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '完成时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
      render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const info = getStatusInfo(status);
        return <Tag color={info.color}>{info.icon} {info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 0 && (
            <>
              <Button type="link" size="small" onClick={() => handleStartOrder(record)}>开始</Button>
              <Button type="link" size="small" danger onClick={() => handleCancelOrder(record)}>取消</Button>
            </>
          )}
          {record.status === 1 && (
            <Button type="link" size="small" onClick={() => handleCompleteOrder(record)}>完成</Button>
          )}
        </Space>
      ),
    },
  ];

  const planColumns = [
    {
      title: '保养类型',
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
      width: 120,
      render: (type: string) => <Tag color={getMaintenanceTypeColor(type)}>{type}</Tag>,
    },
    {
      title: '间隔小时数',
      dataIndex: 'intervalHours',
      key: 'intervalHours',
      width: 120,
      render: (val: number) => `${val} 小时`,
    },
    {
      title: '保养内容',
      dataIndex: 'maintenanceContent',
      key: 'maintenanceContent',
      ellipsis: true,
    },
    {
      title: '检查项目',
      dataIndex: 'checkItems',
      key: 'checkItems',
      render: (items: string) => items ? items.split(',').length + ' 项' : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => status === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>,
    },
  ];

  const typeChartOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      name: '保养类型',
      type: 'pie',
      radius: ['40%', '70%'],
      data: summary?.byType?.map((item: any) => {
        const c = getMaintenanceTypeColor(item.maintenanceType);
        return {
          value: item.count,
          name: item.maintenanceType,
          itemStyle: { color: c === 'green' ? '#91cc75' : c === 'blue' ? '#5470c6' : c === 'gold' ? '#fac858' : '#ee6666' }
        };
      }) || [],
    }]
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 0).length,
    inProgress: orders.filter(o => o.status === 1).length,
    completed: orders.filter(o => o.status === 2).length,
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Button.Group>
            <Button 
              type={activeTab === 'orders' ? 'primary' : 'default'} 
              onClick={() => setActiveTab('orders')}
            >
              保养工单
            </Button>
            <Button 
              type={activeTab === 'plans' ? 'primary' : 'default'} 
              onClick={() => setActiveTab('plans')}
            >
              保养计划
            </Button>
            <Button 
              type={activeTab === 'due' ? 'primary' : 'default'} 
              onClick={() => setActiveTab('due')}
            >
              待保养机台
            </Button>
          </Button.Group>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
          <Button onClick={() => maintenanceApi.checkAndGenerate()}>检查并生成工单</Button>
          {activeTab === 'orders' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOrder}>
              新建工单
            </Button>
          )}
        </Space>
      </Space>

      {activeTab === 'orders' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card className="stat-card">
                <Statistic
                  title="工单总数"
                  value={orderStats.total}
                  prefix={<ToolOutlined />}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <Statistic
                  title="待执行"
                  value={orderStats.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                <Statistic
                  title="执行中"
                  value={orderStats.inProgress}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' }}>
                <Statistic
                  title="已完成"
                  value={orderStats.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card title="保养类型分布" loading={loading}>
                <ReactECharts option={typeChartOption} style={{ height: 250 }} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="本月统计" loading={loading}>
                <Row gutter={[8, 16]}>
                  <Col span={12}>
                    <Statistic title="完成工单" value={summary?.completedCount || 0} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="总耗时(小时)" value={summary?.totalHours?.toFixed(1) || 0} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="自动生成" value={summary?.autoGeneratedCount || 0} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="手动创建" value={summary?.manualCreatedCount || 0} />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="即将到期保养" loading={loading}>
                <List
                  size="small"
                  dataSource={dueLooms.slice(0, 6)}
                  locale={{ emptyText: '暂无即将到期的保养' }}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.loom?.loomCode}
                        description={
                          <Space>
                            <Tag color={getMaintenanceTypeColor(item.nextMaintenanceType)}>
                              {item.nextMaintenanceType}
                            </Tag>
                            <span style={{ color: item.hoursUntilDue < 0 ? 'red' : '#999' }}>
                              {item.hoursUntilDue >= 0 ? `还剩 ${item.hoursUntilDue.toFixed(1)} 小时` : `已超 ${Math.abs(item.hoursUntilDue).toFixed(1)} 小时`}
                            </span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          <Card title="保养工单列表" loading={loading}>
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1400 }}
            />
          </Card>
        </>
      )}

      {activeTab === 'plans' && (
        <Card title="保养计划配置" loading={loading}>
          <Alert
            message="保养计划说明"
            description="系统根据织机累计运行时间，按计划自动生成保养工单。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={planColumns}
            dataSource={plans}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      {activeTab === 'due' && (
        <>
          <Alert
            message="待保养机台提醒"
            description="以下机台即将达到或已超过保养间隔运行时间，请及时安排保养。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Row gutter={[16, 16]}>
            {dueLooms.map((item: any) => (
              <Col span={8} key={item.loom?.id}>
                <Card 
                  size="small"
                  title={
                    <Space>
                      <span>{item.loom?.loomCode}</span>
                      <Tag color={item.hoursUntilDue < 0 ? 'red' : 'gold'}>
                        {item.hoursUntilDue >= 0 ? '即将到期' : '已超期'}
                      </Tag>
                    </Space>
                  }
                  extra={<span style={{ color: '#666' }}>{item.loom?.location}</span>}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <strong>累计运行：</strong>{item.loom?.totalRunningHours?.toFixed(2) || 0} 小时
                    </div>
                    <div>
                      <strong>下次保养类型：</strong>
                      <Tag color={getMaintenanceTypeColor(item.nextMaintenanceType)}>
                        {item.nextMaintenanceType}
                      </Tag>
                    </div>
                    <div>
                      <strong>保养间隔：</strong>{item.intervalHours} 小时
                    </div>
                    <Progress 
                      percent={((item.currentRunningHours % item.intervalHours) / item.intervalHours) * 100}
                      status={item.hoursUntilDue < 0 ? 'exception' : 'active'}
                      format={() => `${item.hoursUntilDue >= 0 ? '还剩' : '已超'} ${Math.abs(item.hoursUntilDue).toFixed(1)} 小时`}
                    />
                    <Button 
                      type="primary" 
                      size="small" 
                      block
                      onClick={() => {
                        form.setFieldsValue({
                          loomId: item.loom?.id,
                          maintenanceType: item.nextMaintenanceType,
                        });
                        setOrderModalVisible(true);
                      }}
                    >
                      创建保养工单
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
          {dueLooms.length === 0 && !loading && (
            <Card style={{ textAlign: 'center', color: '#999' }}>
              暂无待保养机台
            </Card>
          )}
        </>
      )}

      <Modal
        title="新建保养工单"
        open={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        onOk={handleSaveOrder}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="loomId" label="选择织机" rules={[{ required: true }]}>
            <Select placeholder="请选择织机">
              {loomList.map((loom: any) => (
                <Option key={loom.id} value={loom.id}>
                  {loom.loomCode} - {loom.location}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="maintenanceType" label="保养类型" rules={[{ required: true }]}>
            <Select placeholder="请选择保养类型">
              <Option value="日常保养">日常保养</Option>
              <Option value="一级保养">一级保养</Option>
              <Option value="二级保养">二级保养</Option>
              <Option value="三级保养">三级保养</Option>
              <Option value="故障维修">故障维修</Option>
            </Select>
          </Form.Item>
          <Form.Item name="scheduledDate" label="计划时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="完成保养"
        open={completeModalVisible}
        onCancel={() => setCompleteModalVisible(false)}
        onOk={handleSaveComplete}
        width={600}
      >
        {currentOrder && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={`${currentOrder.loom?.loomCode} - ${currentOrder.maintenanceType}`}
              type="info"
              showIcon
            />
          </div>
        )}
        <Form form={completeForm} layout="vertical">
          <Form.Item name="maintenanceContent" label="保养内容" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请填写保养内容" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="请填写备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Maintenance;