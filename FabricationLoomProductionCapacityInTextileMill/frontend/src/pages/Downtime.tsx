import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, Statistic, message, Alert } from 'antd';
import { ReloadOutlined, PlusOutlined, PlayCircleOutlined, StopOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { downtimeApi, loomApi } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const Downtime: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loomList, setLoomList] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [selectedLoom, setSelectedLoom] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'reasons'>('records');
  const [form] = Form.useForm();
  const [endForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        pageSize: 100,
      };
      if (selectedLoom) params.loomId = selectedLoom;
      if (selectedCategory) params.category = selectedCategory;

      const [recordsRes, reasonsRes, summaryRes, loomRes] = await Promise.all([
        downtimeApi.getRecords(params),
        downtimeApi.getReasons(),
        downtimeApi.getSummary({
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
          loomId: selectedLoom || undefined,
        }),
        loomApi.getList({ pageSize: 200 }),
      ]);

      setRecords(recordsRes.data.list || recordsRes.data || []);
      setReasons(reasonsRes.data || []);
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
      0: { color: 'processing', text: '停机中', icon: <ClockCircleOutlined /> },
      1: { color: 'success', text: '已恢复', icon: <PlayCircleOutlined /> },
    };
    return statusMap[status] || statusMap[0];
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      '断纱': 'red',
      '换轴': 'gold',
      '故障': 'red',
      '保养': 'blue',
      '待料': 'orange',
      '调机': 'purple',
      '其他': 'default',
    };
    return colorMap[category] || 'default';
  };

  const handleStartDowntime = () => {
    form.resetFields();
    setStartModalVisible(true);
  };

  const handleSaveStart = async () => {
    try {
      const values = await form.validateFields();
      await downtimeApi.startDowntime(values);
      message.success('停机记录已开始');
      setStartModalVisible(false);
      loadData();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  const handleEndDowntime = (record: any) => {
    setCurrentRecord(record);
    endForm.resetFields();
    setEndModalVisible(true);
  };

  const handleSaveEnd = async () => {
    try {
      const values = await endForm.validateFields();
      await downtimeApi.endDowntime(currentRecord.id, values.remark);
      message.success('停机已结束');
      setEndModalVisible(false);
      loadData();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  const reasonChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      name: '分钟',
    },
    yAxis: {
      type: 'category',
      data: summary?.topReasons?.map((r: any) => r.reasonName) || [],
    },
    series: [{
      name: '停机时长',
      type: 'bar',
      data: summary?.topReasons?.map((r: any) => r.minutes) || [],
      itemStyle: {
        color: (params: any) => {
          const reason = summary?.topReasons?.[params.dataIndex];
          return getCategoryColor(reason?.category) === 'red' ? '#ee6666' :
            getCategoryColor(reason?.category) === 'gold' ? '#fac858' :
            getCategoryColor(reason?.category) === 'blue' ? '#5470c6' : '#91cc75';
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c} 分钟',
      },
    }]
  };

  const categoryChartOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      name: '停机分类',
      type: 'pie',
      radius: ['40%', '70%'],
      data: summary?.byCategory?.map((item: any) => ({
        value: item.minutes,
        name: `${item.category} (${item.count}次)`,
        itemStyle: { 
          color: getCategoryColor(item.category) === 'red' ? '#ee6666' :
            getCategoryColor(item.category) === 'gold' ? '#fac858' :
            getCategoryColor(item.category) === 'blue' ? '#5470c6' :
            getCategoryColor(item.category) === 'orange' ? '#ff9844' :
            getCategoryColor(item.category) === 'purple' ? '#9a60b4' : '#73c0de'
        },
      })) || [],
    }]
  };

  const columns = [
    {
      title: '织机编号',
      dataIndex: ['loom', 'loomCode'],
      key: 'loomCode',
      width: 120,
    },
    {
      title: '停机原因',
      dataIndex: ['downtimeReason', 'reasonName'],
      key: 'reasonName',
      width: 150,
      render: (name: string, record: any) => (
        <Space>
          <Tag color={getCategoryColor(record.downtimeReason?.category)}>
            {record.downtimeReason?.category}
          </Tag>
          {name}
        </Space>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
      render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '持续时间',
      key: 'duration',
      width: 120,
      render: (_: any, record: any) => {
        if (record.status === 0) {
          const minutes = Math.floor((Date.now() - dayjs(record.startTime).valueOf()) / 60000);
          return <Tag color="processing">{minutes} 分钟 (持续中)</Tag>;
        }
        const minutes = record.durationMinutes || 0;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
      },
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
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 0 && (
            <Button type="link" size="small" danger onClick={() => handleEndDowntime(record)}>
              结束停机
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const reasonColumns = [
    {
      title: '原因编码',
      dataIndex: 'reasonCode',
      key: 'reasonCode',
      width: 120,
    },
    {
      title: '原因名称',
      dataIndex: 'reasonName',
      key: 'reasonName',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => status === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>,
    },
  ];

  const activeRecords = records.filter(r => r.status === 0).length;
  const totalMinutes = summary?.totalMinutes || 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Button.Group>
            <Button 
              type={activeTab === 'records' ? 'primary' : 'default'} 
              onClick={() => setActiveTab('records')}
            >
              停机记录
            </Button>
            <Button 
              type={activeTab === 'reasons' ? 'primary' : 'default'} 
              onClick={() => setActiveTab('reasons')}
            >
              原因配置
            </Button>
          </Button.Group>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
          {activeTab === 'records' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleStartDowntime}>
              记录停机
            </Button>
          )}
        </Space>
      </Space>

      {activeTab === 'records' && (
        <>
          {activeRecords > 0 && (
            <Alert
              message={`当前有 ${activeRecords} 台织机处于停机状态，请及时处理`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button size="small" type="ghost" icon={<WarningOutlined />}>
                  查看详情
                </Button>
              }
            />
          )}

          <Space style={{ marginBottom: 16 }}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            />
            <Select
              placeholder="选择织机"
              allowClear
              style={{ width: 150 }}
              value={selectedLoom}
              onChange={setSelectedLoom}
            >
              {loomList.map((loom: any) => (
                <Option key={loom.id} value={loom.id}>
                  {loom.loomCode}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: 150 }}
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              <Option value="断纱">断纱</Option>
              <Option value="换轴">换轴</Option>
              <Option value="故障">故障</Option>
              <Option value="保养">保养</Option>
              <Option value="待料">待料</Option>
              <Option value="调机">调机</Option>
              <Option value="其他">其他</Option>
            </Select>
            <Button type="primary" onClick={loadData} loading={loading}>
              查询
            </Button>
          </Space>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card className="stat-card">
                <Statistic
                  title="停机次数"
                  value={summary?.totalCount || 0}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' }}>
                <Statistic
                  title="总停机时长"
                  value={totalHours}
                  suffix="小时"
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <Statistic
                  title="平均停机时长"
                  value={summary?.avgMinutes || 0}
                  suffix="分钟"
                  precision={1}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <Statistic
                  title="当前停机"
                  value={activeRecords}
                  prefix={<StopOutlined />}
                  valueStyle={{ color: 'white' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="停机原因排行（时长）" loading={loading}>
                <ReactECharts option={reasonChartOption} style={{ height: 350 }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="停机分类占比" loading={loading}>
                <ReactECharts option={categoryChartOption} style={{ height: 350 }} />
              </Card>
            </Col>
          </Row>

          <Card title="停机记录列表" loading={loading}>
            <Table
              columns={columns}
              dataSource={records}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1300, y: 400 }}
            />
          </Card>
        </>
      )}

      {activeTab === 'reasons' && (
        <Card title="停机原因配置" loading={loading}>
          <Alert
            message="停机原因说明"
            description="配置停机原因及分类，用于统计分析和快速选择。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={reasonColumns}
            dataSource={reasons}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      <Modal
        title="记录停机"
        open={startModalVisible}
        onCancel={() => setStartModalVisible(false)}
        onOk={handleSaveStart}
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
          <Form.Item name="reasonId" label="停机原因" rules={[{ required: true }]}>
            <Select placeholder="请选择停机原因">
              {reasons.filter((r: any) => r.status === 1).map((reason: any) => (
                <Option key={reason.id} value={reason.id}>
                  <Tag color={getCategoryColor(reason.category)}>{reason.category}</Tag>
                  {reason.reasonName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="结束停机"
        open={endModalVisible}
        onCancel={() => setEndModalVisible(false)}
        onOk={handleSaveEnd}
        width={500}
      >
        {currentRecord && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={`${currentRecord.loom?.loomCode} - ${currentRecord.downtimeReason?.reasonName}`}
              description={`开始时间: ${dayjs(currentRecord.startTime).format('YYYY-MM-DD HH:mm:ss')}`}
              type="info"
              showIcon
            />
          </div>
        )}
        <Form form={endForm} layout="vertical">
          <Form.Item name="remark" label="处理结果/备注">
            <TextArea rows={3} placeholder="请填写处理结果或备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Downtime;
