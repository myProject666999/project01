import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Space, Button, DatePicker, Select, Statistic } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { oeeApi, loomApi } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OeeReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [oeeList, setOeeList] = useState<any[]>([]);
  const [oeeSummary, setOeeSummary] = useState<any>(null);
  const [loomList, setLoomList] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [selectedLoom, setSelectedLoom] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        pageSize: 100,
      };
      if (selectedLoom) {
        params.loomId = selectedLoom;
      }

      const [oeeRes, summaryRes, loomRes] = await Promise.all([
        oeeApi.getStats(params),
        oeeApi.getSummary({
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
          loomId: selectedLoom || undefined,
        }),
        loomApi.getList({ pageSize: 200 }),
      ]);

      setOeeList(oeeRes.data.list || oeeRes.data || []);
      setOeeSummary(summaryRes.data);
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

  const getOeeLevel = (oee: number) => {
    if (oee >= 85) return { color: 'green', text: '优秀' };
    if (oee >= 70) return { color: 'blue', text: '良好' };
    if (oee >= 50) return { color: 'gold', text: '一般' };
    return { color: 'red', text: '较差' };
  };

  const trendChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['OEE', '时间稼动率', '性能稼动率', '良品率'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: oeeList.slice().reverse().map((d: any) => d.statDate),
    },
    yAxis: { type: 'value', name: '%', max: 100 },
    series: [
      {
        name: 'OEE',
        type: 'line',
        smooth: true,
        data: oeeList.slice().reverse().map((d: any) => d.oee),
        lineStyle: { color: '#5470c6', width: 3 },
        itemStyle: { color: '#5470c6' },
      },
      {
        name: '时间稼动率',
        type: 'line',
        smooth: true,
        data: oeeList.slice().reverse().map((d: any) => d.availabilityRate),
        lineStyle: { color: '#91cc75' },
        itemStyle: { color: '#91cc75' },
      },
      {
        name: '性能稼动率',
        type: 'line',
        smooth: true,
        data: oeeList.slice().reverse().map((d: any) => d.performanceRate),
        lineStyle: { color: '#fac858' },
        itemStyle: { color: '#fac858' },
      },
      {
        name: '良品率',
        type: 'line',
        smooth: true,
        data: oeeList.slice().reverse().map((d: any) => d.qualityRate),
        lineStyle: { color: '#ee6666' },
        itemStyle: { color: '#ee6666' },
      },
    ],
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'statDate',
      key: 'statDate',
      width: 120,
    },
    {
      title: '班次',
      dataIndex: ['shift', 'shiftName'],
      key: 'shiftName',
      width: 100,
      render: (name: string) => name || '-',
    },
    {
      title: '织机编号',
      dataIndex: ['loom', 'loomCode'],
      key: 'loomCode',
      width: 120,
      render: (code: string) => code || '-',
    },
    {
      title: '计划时间',
      dataIndex: 'plannedMinutes',
      key: 'plannedMinutes',
      width: 100,
      render: (val: number) => `${val} 分钟`,
    },
    {
      title: '运行时间',
      dataIndex: 'runningMinutes',
      key: 'runningMinutes',
      width: 100,
      render: (val: number) => `${val} 分钟`,
    },
    {
      title: '总产量',
      dataIndex: 'totalOutput',
      key: 'totalOutput',
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
      title: '时间稼动率',
      dataIndex: 'availabilityRate',
      key: 'availabilityRate',
      width: 110,
      render: (val: number) => `${val?.toFixed(2)}%`,
    },
    {
      title: '性能稼动率',
      dataIndex: 'performanceRate',
      key: 'performanceRate',
      width: 110,
      render: (val: number) => `${val?.toFixed(2)}%`,
    },
    {
      title: '良品率',
      dataIndex: 'qualityRate',
      key: 'qualityRate',
      width: 100,
      render: (val: number) => `${val?.toFixed(2)}%`,
    },
    {
      title: 'OEE',
      dataIndex: 'oee',
      key: 'oee',
      width: 120,
      render: (val: number) => {
        const level = getOeeLevel(val);
        return (
          <Tag color={level.color}>
            {val?.toFixed(2)}% ({level.text})
          </Tag>
        );
      },
    },
  ];

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
            style={{ width: 150 }}
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
          <Button type="primary" onClick={loadData} loading={loading}>
            查询
          </Button>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
          <Button onClick={() => oeeApi.calculateAll()}>重新计算OEE</Button>
        </Space>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card oee">
            <Statistic
              title="平均OEE"
              value={oeeSummary?.avgOee || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card efficiency">
            <Statistic
              title="平均时间稼动率"
              value={oeeSummary?.avgAvailability || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Statistic
              title="平均性能稼动率"
              value={oeeSummary?.avgPerformance || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' }}>
            <Statistic
              title="平均良品率"
              value={oeeSummary?.avgQuality || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card output">
            <Statistic
              title="总产量"
              value={oeeSummary?.totalOutput || 0}
              suffix="米"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Statistic
              title="合格品"
              value={oeeSummary?.totalGoodOutput || 0}
              suffix="米"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <Statistic
              title="总运行时间"
              value={oeeSummary?.totalRunningHours || 0}
              suffix="小时"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
            <Statistic
              title="统计记录数"
              value={oeeSummary?.totalRecords || 0}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="OEE趋势图" style={{ marginBottom: 24 }} loading={loading}>
        <ReactECharts option={trendChartOption} style={{ height: 350 }} />
      </Card>

      <Card title="OEE统计明细" loading={loading}>
        <Table
          columns={columns}
          dataSource={oeeList}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300, y: 400 }}
        />
      </Card>
    </div>
  );
};

export default OeeReport;
