import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, Statistic, message, List, Progress, Alert } from 'antd';
import { ReloadOutlined, PlusOutlined, EditOutlined, PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { productionApi, loomApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const Production: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [queues, setQueues] = useState<any[]>([]);
  const [loomList, setLoomList] = useState<any[]>([]);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedLooms, setSelectedLooms] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'schedules' | 'queues'>('orders');
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, schedulesRes, queuesRes, loomRes] = await Promise.all([
        productionApi.getOrders({ pageSize: 100 }),
        productionApi.getSchedules({ pageSize: 100 }),
        productionApi.getAllQueues(),
        loomApi.getList({ pageSize: 200 }),
      ]);

      setOrders(ordersRes.data.list || ordersRes.data || []);
      setSchedules(schedulesRes.data.list || schedulesRes.data || []);
      setQueues(queuesRes.data || []);
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
      0: { color: 'default', text: '待排产', icon: <ClockCircleOutlined /> },
      1: { color: 'blue', text: '排产中', icon: <PlayCircleOutlined /> },
      2: { color: 'processing', text: '生产中', icon: <PlayCircleOutlined /> },
      3: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      4: { color: 'error', text: '已取消', icon: <ClockCircleOutlined /> },
    };
    return statusMap[status] || statusMap[0];
  };

  const handleCreateOrder = () => {
    form.resetFields();
    setOrderModalVisible(true);
  };

  const handleSaveOrder = async () => {
    try {
      const values = await form.validateFields();
      values.deliveryDate = values.deliveryDate.format('YYYY-MM-DD');
      await productionApi.createOrder(values);
      message.success('订单创建成功');
      setOrderModalVisible(false);
      loadData();
    } catch (error) {
      console.error('创建订单失败:', error);
      message.error('创建订单失败');
    }
  };

  const handleSchedule = async (order: any) => {
    setCurrentOrder(order);
    try {
      const res = await productionApi.getRecommendations(order.id);
      setRecommendations(res.data);
      setSelectedLooms([]);
      setScheduleModalVisible(true);
    } catch (error) {
      console.error('获取推荐失败:', error);
      message.error('获取推荐机台失败');
    }
  };

  const handleConfirmSchedule = async () => {
    if (selectedLooms.length === 0) {
      message.warning('请至少选择一台织机');
      return;
    }
    try {
      await productionApi.scheduleOrder(currentOrder.id, selectedLooms);
      message.success('排产成功');
      setScheduleModalVisible(false);
      loadData();
    } catch (error) {
      console.error('排产失败:', error);
      message.error('排产失败');
    }
  };

  const handleUpdateProgress = async (schedule: any) => {
    Modal.confirm({
      title: '更新进度',
      content: '确认标记该排产为完成？',
      onOk: async () => {
        try {
          await productionApi.updateProgress(schedule.id, schedule.assignedLength);
          message.success('进度已更新');
          loadData();
        } catch (error) {
          message.error('更新失败');
        }
      },
    });
  };

  const orderColumns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
    },
    {
      title: '布料规格',
      dataIndex: ['fabricSpec', 'specName'],
      key: 'specName',
      width: 150,
    },
    {
      title: '订单数量',
      dataIndex: 'orderLength',
      key: 'orderLength',
      width: 120,
      render: (val: number) => `${val} 米`,
    },
    {
      title: '已分配',
      dataIndex: 'assignedLength',
      key: 'assignedLength',
      width: 120,
      render: (val: number) => `${val || 0} 米`,
    },
    {
      title: '已完成',
      dataIndex: 'completedLength',
      key: 'completedLength',
      width: 120,
      render: (val: number) => `${val || 0} 米`,
    },
    {
      title: '交货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 100,
      render: (val: number) => {
        const colors = ['default', 'blue', 'gold', 'red'];
        const texts = ['普通', '一般', '紧急', '特急'];
        return <Tag color={colors[val]}>{texts[val]}</Tag>;
      },
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
      title: '进度',
      key: 'progress',
      width: 150,
      render: (_: any, record: any) => {
        const percent = record.orderLength > 0 ? ((record.completedLength || 0) / record.orderLength) * 100 : 0;
        return <Progress percent={percent.toFixed(0)} size="small" />;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          {record.status === 0 && (
            <Button type="link" size="small" onClick={() => handleSchedule(record)}>
              排产
            </Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const scheduleColumns = [
    {
      title: '订单编号',
      dataIndex: ['productionOrder', 'orderNo'],
      key: 'orderNo',
      width: 150,
    },
    {
      title: '织机编号',
      dataIndex: ['loom', 'loomCode'],
      key: 'loomCode',
      width: 120,
    },
    {
      title: '分配数量',
      dataIndex: 'assignedLength',
      key: 'assignedLength',
      width: 120,
      render: (val: number) => `${val} 米`,
    },
    {
      title: '已完成',
      dataIndex: 'completedLength',
      key: 'completedLength',
      width: 120,
      render: (val: number) => `${val || 0} 米`,
    },
    {
      title: '计划开始',
      dataIndex: 'scheduledStartTime',
      key: 'scheduledStartTime',
      width: 160,
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '预计完成',
      dataIndex: 'estimatedEndTime',
      key: 'estimatedEndTime',
      width: 160,
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const info = getStatusInfo(status);
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '进度',
      key: 'progress',
      width: 150,
      render: (_: any, record: any) => {
        const percent = record.assignedLength > 0 ? ((record.completedLength || 0) / record.assignedLength) * 100 : 0;
        return <Progress percent={percent.toFixed(0)} size="small" />;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          {record.status === 2 && (
            <Button type="link" size="small" onClick={() => handleUpdateProgress(record)}>
              完成
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 0).length,
    inProduction: orders.filter(o => o.status === 2).length,
    completed: orders.filter(o => o.status === 3).length,
  };

  const workloadChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: queues.slice(0, 20).map((q: any) => q.loom?.loomCode || ''),
    },
    yAxis: { type: 'value', name: '米' },
    series: [{
      name: '待生产数量',
      type: 'bar',
      data: queues.slice(0, 20).map((q: any) => 
        q.queue?.reduce((sum: number, item: any) => sum + (item.assignedLength - item.completedLength), 0) || 0
      ),
      itemStyle: { color: '#5470c6' },
    }]
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
              订单管理
            </Button>
            <Button 
              type={activeTab === 'schedules' ? 'primary' : 'default'} 
              onClick={() => setActiveTab('schedules')}
            >
              排产计划
            </Button>
            <Button 
              type={activeTab === 'queues' ? 'primary' : 'default'} 
              onClick={() => setActiveTab('queues')}
            >
              执行队列
            </Button>
          </Button.Group>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
          {activeTab === 'orders' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOrder}>
              新建订单
            </Button>
          )}
        </Space>
      </Space>

      {activeTab === 'orders' && (
        <>
          <Alert
            message="排产说明"
            description="系统会根据机台兼容规格、当前队列长度和交货日期自动推荐最优机台。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card className="stat-card">
                <Statistic
                  title="订单总数"
                  value={orderStats.total}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <Statistic
                  title="待排产"
                  value={orderStats.pending}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                <Statistic
                  title="生产中"
                  value={orderStats.inProduction}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' }}>
                <Statistic
                  title="已完成"
                  value={orderStats.completed}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="订单列表" loading={loading}>
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

      {activeTab === 'schedules' && (
        <Card title="排产计划列表" loading={loading}>
          <Table
            columns={scheduleColumns}
            dataSource={schedules}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1300 }}
          />
        </Card>
      )}

      {activeTab === 'queues' && (
        <>
          <Card title="机台工作量分布" style={{ marginBottom: 24 }} loading={loading}>
            <ReactECharts option={workloadChartOption} style={{ height: 300 }} />
          </Card>

          <Row gutter={[16, 16]}>
            {queues.slice(0, 12).map((queueItem: any) => (
              <Col span={8} key={queueItem.loom?.id}>
                <Card 
                  size="small" 
                  title={`${queueItem.loom?.loomCode} - ${queueItem.loom?.location}`}
                  extra={
                    <Tag color={queueItem.queue?.length > 0 ? 'processing' : 'success'}>
                      {queueItem.queue?.length || 0} 个任务
                    </Tag>
                  }
                >
                  <List
                    size="small"
                    dataSource={queueItem.queue?.slice(0, 3) || []}
                    locale={{ emptyText: '无待执行任务' }}
                    renderItem={(item: any) => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.productionOrder?.orderNo}
                          description={
                            <div>
                              <div>规格: {item.productionOrder?.fabricSpec?.specName}</div>
                              <div>数量: {item.assignedLength} 米</div>
                              <Progress 
                                percent={((item.completedLength || 0) / item.assignedLength) * 100} 
                                size="small" 
                              />
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                  {queueItem.queue?.length > 3 && (
                    <div style={{ textAlign: 'center', marginTop: 8, color: '#999' }}>
                      还有 {queueItem.queue.length - 3} 个任务...
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      <Modal
        title="新建生产订单"
        open={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        onOk={handleSaveOrder}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="orderNo" label="订单编号" rules={[{ required: true }]}>
                <Input placeholder="自动生成或手动输入" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fabricSpecId" label="布料规格" rules={[{ required: true }]}>
                <Select placeholder="请选择规格">
                  <Option value={1}>平纹棉布-40支</Option>
                  <Option value={2}>斜纹棉布-32支</Option>
                  <Option value={3}>缎纹棉布-60支</Option>
                  <Option value={4}>涤纶布-75D</Option>
                  <Option value={5}>混纺布-50/50</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="orderLength" label="订单数量(米)" rules={[{ required: true }]}>
                <Input type="number" placeholder="请输入订单数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="urgency" label="紧急程度" rules={[{ required: true }]}>
                <Select placeholder="请选择">
                  <Option value={0}>普通</Option>
                  <Option value={1}>一般</Option>
                  <Option value={2}>紧急</Option>
                  <Option value={3}>特急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="deliveryDate" label="交货日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`智能排产 - ${currentOrder?.orderNo}`}
        open={scheduleModalVisible}
        onCancel={() => setScheduleModalVisible(false)}
        onOk={handleConfirmSchedule}
        width={900}
        okText="确认排产"
      >
        {currentOrder && (
          <div>
            <Alert
              message={`订单信息：${currentOrder.fabricSpec?.specName}，数量 ${currentOrder.orderLength} 米，交货日期 ${currentOrder.deliveryDate}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Select
              mode="multiple"
              placeholder="选择排产织机（可多选）"
              style={{ width: '100%', marginBottom: 16 }}
              value={selectedLooms}
              onChange={setSelectedLooms}
              optionLabelProp="label"
            >
              {recommendations.map((rec: any) => (
                <Option key={rec.loom.id} value={rec.loom.id} label={rec.loom.loomCode}>
                  <Space>
                    <span>{rec.loom.loomCode}</span>
                    <Tag color="blue">匹配度 {(rec.matchScore * 100).toFixed(0)}%</Tag>
                    <Tag color={rec.availableNow ? 'green' : 'gold'}>
                      {rec.availableNow ? '空闲' : `排队${rec.queueLength}任务`}
                    </Tag>
                    <span style={{ color: '#999' }}>{rec.loom.location}</span>
                  </Space>
                </Option>
              ))}
            </Select>

            <Card title="推荐机台列表" size="small">
              <Table
                size="small"
                rowSelection={{
                  selectedRowKeys: selectedLooms,
                  onChange: (keys) => setSelectedLooms(keys as number[]),
                }}
                columns={[
                  { title: '织机编号', dataIndex: ['loom', 'loomCode'], key: 'loomCode' },
                  { title: '品牌型号', key: 'model', render: (_: any, r: any) => `${r.loom.brand} ${r.loom.model}` },
                  { title: '位置', dataIndex: ['loom', 'location'], key: 'location' },
                  { title: '额定产能', dataIndex: ['loom', 'ratedCapacity'], key: 'capacity', render: (v: number) => `${v}米/小时` },
                  { title: '匹配度', dataIndex: 'matchScore', key: 'matchScore', render: (v: number) => `${(v * 100).toFixed(0)}%` },
                  { title: '队列长度', dataIndex: 'queueLength', key: 'queueLength' },
                  { title: '状态', key: 'status', render: (_: any, r: any) => 
                    <Tag color={r.availableNow ? 'green' : 'gold'}>{r.availableNow ? '空闲' : '忙碌'}</Tag>
                  },
                  { title: '预计完成', dataIndex: 'estimatedCompletionTime', key: 'eta',
                    render: (v: string) => v ? dayjs(v).format('MM-DD HH:mm') : '-'
                  },
                ]}
                dataSource={recommendations}
                rowKey={(record) => record.loom.id}
                pagination={false}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Production;
