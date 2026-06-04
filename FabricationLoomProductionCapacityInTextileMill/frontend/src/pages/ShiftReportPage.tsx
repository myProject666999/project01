import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Space, Button, DatePicker, Select, Modal, Form, Input, Statistic } from 'antd';
import { ReloadOutlined, SearchOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { shiftReportApi, loomApi, downtimeApi } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const ShiftReportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportList, setReportList] = useState<any[]>([]);
  const [loomList, setLoomList] = useState<any[]>([]);
  const [downtimeSummary, setDowntimeSummary] = useState<any>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [selectedLoom, setSelectedLoom] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        pageSize: 100,
      };
      if (selectedLoom) params.loomId = selectedLoom;
      if (selectedShift) params.shiftId = selectedShift;

      const [reportRes, loomRes, downtimeRes] = await Promise.all([
        shiftReportApi.getList(params),
        loomApi.getList({ pageSize: 200 }),
        downtimeApi.getSummary({
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        }),
      ]);

      setReportList(reportRes.data.list || reportRes.data || []);
      setLoomList(loomRes.data.list || loomRes.data || []);
      setDowntimeSummary(downtimeRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (record: any) => {
    setCurrentReport(record);
    form.setFieldsValue({
      operator: record.operator,
      remark: record.remark,
      defectQuantity: record.defectQuantity,
    });
    setEditModalVisible(true);
  };

  const handleViewDetail = (record: any) => {
    setCurrentReport(record);
    setDetailModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      await shiftReportApi.update(currentReport.id, values);
      setEditModalVisible(false);
      loadData();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const outputChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['实际产量', '合格品', '不良品'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: reportList.slice(0, 15).map((d: any) => `${d.shiftDate} ${d.shift?.shiftName || ''}`),
    },
    yAxis: { type: 'value', name: '米' },
    series: [
      {
        name: '实际产量',
        type: 'bar',
        data: reportList.slice(0, 15).map((d: any) => d.actualOutput),
        itemStyle: { color: '#5470c6' },
      },
      {
        name: '合格品',
        type: 'bar',
        data: reportList.slice(0, 15).map((d: any) => d.goodOutput),
        itemStyle: { color: '#91cc75' },
      },
      {
        name: '不良品',
        type: 'bar',
        data: reportList.slice(0, 15).map((d: any) => d.defectQuantity),
        itemStyle: { color: '#ee6666' },
      },
    ],
  };

  const downtimeChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: downtimeSummary?.topReasons?.map((r: any) => r.reasonName) || [],
    },
    yAxis: { type: 'value', name: '分钟' },
    series: [{
      name: '停机时长',
      type: 'bar',
      data: downtimeSummary?.topReasons?.map((r: any) => r.minutes) || [],
      itemStyle: { color: '#ee6666' },
    }]
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'shiftDate',
      key: 'shiftDate',
      width: 110,
    },
    {
      title: '班次',
      dataIndex: ['shift', 'shiftName'],
      key: 'shiftName',
      width: 80,
    },
    {
      title: '织机编号',
      dataIndex: ['loom', 'loomCode'],
      key: 'loomCode',
      width: 100,
    },
    {
      title: '计划产量',
      dataIndex: 'plannedOutput',
      key: 'plannedOutput',
      width: 100,
      render: (val: number) => `${val?.toFixed(2)} 米`,
    },
    {
      title: '实际产量',
      dataIndex: 'actualOutput',
      key: 'actualOutput',
      width: 100,
      render: (val: number) => `${val?.toFixed(2)} 米`,
    },
    {
      title: '合格品',
      dataIndex: 'goodOutput',
      key: 'goodOutput',
      width: 100,
      render: (val: number) => `${val?.toFixed(2)} 米`,
    },
    {
      title: '不良品',
      dataIndex: 'defectQuantity',
      key: 'defectQuantity',
      width: 100,
      render: (val: number) => `${val?.toFixed(2)} 米`,
    },
    {
      title: '良品率',
      key: 'qualityRate',
      width: 90,
      render: (_: any, record: any) => {
        const rate = record.actualOutput > 0 ? (record.goodOutput / record.actualOutput) * 100 : 0;
        return `${rate.toFixed(2)}%`;
      },
    },
    {
      title: '运行时间',
      dataIndex: 'runningMinutes',
      key: 'runningMinutes',
      width: 90,
      render: (val: number) => `${val} 分钟`,
    },
    {
      title: '停机时间',
      dataIndex: 'downtimeMinutes',
      key: 'downtimeMinutes',
      width: 90,
      render: (val: number) => (
        <Tag color={val > 30 ? 'red' : val > 10 ? 'gold' : 'green'}>
          {val} 分钟
        </Tag>
      ),
    },
    {
      title: '停机次数',
      dataIndex: 'downtimeCount',
      key: 'downtimeCount',
      width: 80,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: 'default', text: '未生成' },
          1: { color: 'blue', text: '已生成' },
          2: { color: 'green', text: '已确认' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const totalActualOutput = reportList.reduce((sum, item) => sum + (item.actualOutput || 0), 0);
  const totalGoodOutput = reportList.reduce((sum, item) => sum + (item.goodOutput || 0), 0);
  const totalRunningHours = reportList.reduce((sum, item) => sum + (item.runningMinutes || 0), 0) / 60;
  const totalDowntimeHours = reportList.reduce((sum, item) => sum + (item.downtimeMinutes || 0), 0) / 60;

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
          <Select
            placeholder="选择织机"
            allowClear
            style={{ width: 130 }}
            value={selectedLoom}
            onChange={setSelectedLoom}
            suffixIcon={<SearchOutlined />}
          >
            {loomList.map((loom: any) => (
              <Option key={loom.id} value={loom.id}>
                {loom.loomCode}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择班次"
            allowClear
            style={{ width: 130 }}
            value={selectedShift}
            onChange={setSelectedShift}
          >
            <Option value={1}>早班</Option>
            <Option value={2}>中班</Option>
            <Option value={3}>晚班</Option>
          </Select>
          <Button type="primary" onClick={loadData} loading={loading}>
            查询
          </Button>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
          <Button onClick={() => shiftReportApi.generateAll()}>生成全部报表</Button>
        </Space>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card output">
            <Statistic
              title="实际总产量"
              value={totalActualOutput}
              suffix="米"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Statistic
              title="合格品总量"
              value={totalGoodOutput}
              suffix="米"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card efficiency">
            <Statistic
              title="总运行时间"
              value={totalRunningHours}
              suffix="小时"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' }}>
            <Statistic
              title="总停机时间"
              value={totalDowntimeHours}
              suffix="小时"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="产量统计" loading={loading}>
            <ReactECharts option={outputChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="停机原因分布" loading={loading}>
            <ReactECharts option={downtimeChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Card title="班产报表明细" loading={loading}>
        <Table
          columns={columns}
          dataSource={reportList}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400, y: 400 }}
        />
      </Card>

      <Modal
        title="编辑班产报表"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveEdit}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="defectQuantity" label="不良品数量(米)">
            <Input type="number" placeholder="请输入不良品数量" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="班产报表详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {currentReport && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <p><strong>日期：</strong>{currentReport.shiftDate}</p>
                  <p><strong>班次：</strong>{currentReport.shift?.shiftName}</p>
                  <p><strong>织机：</strong>{currentReport.loom?.loomCode}</p>
                  <p><strong>操作人：</strong>{currentReport.operator || '-'}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="产量信息">
                  <p><strong>计划产量：</strong>{currentReport.plannedOutput?.toFixed(2)} 米</p>
                  <p><strong>实际产量：</strong>{currentReport.actualOutput?.toFixed(2)} 米</p>
                  <p><strong>合格品：</strong>{currentReport.goodOutput?.toFixed(2)} 米</p>
                  <p><strong>不良品：</strong>{currentReport.defectQuantity?.toFixed(2)} 米</p>
                </Card>
              </Col>
            </Row>
            <Card size="small" title="时间信息" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={8}><p><strong>运行时间：</strong>{currentReport.runningMinutes} 分钟</p></Col>
                <Col span={8}><p><strong>停机时间：</strong>{currentReport.downtimeMinutes} 分钟</p></Col>
                <Col span={8}><p><strong>停机次数：</strong>{currentReport.downtimeCount} 次</p></Col>
              </Row>
            </Card>
            <Card size="small" title="停机原因汇总" style={{ marginTop: 16 }}>
              {currentReport.downtimeSummary?.length > 0 ? (
                <ul>
                  {currentReport.downtimeSummary.map((item: any, index: number) => (
                    <li key={index}>
                      {item.reasonName}: {item.minutes} 分钟 ({item.count} 次)
                    </li>
                  ))}
                </ul>
              ) : (
                <p>无停机记录</p>
              )}
            </Card>
            {currentReport.remark && (
              <Card size="small" title="备注" style={{ marginTop: 16 }}>
                <p>{currentReport.remark}</p>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShiftReportPage;
