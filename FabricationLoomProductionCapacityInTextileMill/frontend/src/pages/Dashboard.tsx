import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Button } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { loomApi, oeeApi, downtimeApi, dataApi } from '../services/api';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loomStatus, setLoomStatus] = useState<any[]>([]);
  const [oeeSummary, setOeeSummary] = useState<any>(null);
  const [downtimeSummary, setDowntimeSummary] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loomRes, oeeRes, downtimeRes] = await Promise.all([
        loomApi.getAllRealtime(),
        oeeApi.getSummary({
          startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
          endDate: dayjs().format('YYYY-MM-DD'),
        }),
        downtimeApi.getSummary({
          startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
          endDate: dayjs().format('YYYY-MM-DD'),
        }),
      ]);
      setLoomStatus(loomRes.data);
      setOeeSummary(oeeRes.data);
      setDowntimeSummary(downtimeRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'green';
      case 2: return 'gold';
      case 3: return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return '运行中';
      case 2: return '停机';
      case 3: return '故障';
      default: return '未知';
    }
  };

  const runningCount = loomStatus.filter(item => item.realtime?.runningStatus === 1).length;
  const stoppedCount = loomStatus.filter(item => item.realtime?.runningStatus === 2).length;
  const faultCount = loomStatus.filter(item => item.realtime?.runningStatus === 3).length;

  const oeeChartOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      name: 'OEE构成',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: 20, fontWeight: 'bold' }
      },
      data: [
        { value: oeeSummary?.avgAvailability || 0, name: '时间稼动率', itemStyle: { color: '#5470c6' } },
        { value: oeeSummary?.avgPerformance || 0, name: '性能稼动率', itemStyle: { color: '#91cc75' } },
        { value: oeeSummary?.avgQuality || 0, name: '良品率', itemStyle: { color: '#fac858' } },
      ]
    }]
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
      title: '织机编号',
      dataIndex: ['loom', 'loomCode'],
      key: 'loomCode',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: ['realtime', 'runningStatus'],
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '当前转速',
      dataIndex: ['realtime', 'speed'],
      key: 'speed',
      width: 100,
      render: (speed: number) => speed ? `${speed} rpm` : '-',
    },
    {
      title: '累计米数',
      dataIndex: ['realtime', 'meterage'],
      key: 'meterage',
      width: 120,
      render: (val: number) => val ? `${val?.toFixed(2)} 米` : '-',
    },
    {
      title: '品牌型号',
      key: 'model',
      width: 180,
      render: (_: any, record: any) => `${record.loom.brand} ${record.loom.model}`,
    },
    {
      title: '位置',
      dataIndex: ['loom', 'location'],
      key: 'location',
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
          刷新数据
        </Button>
        <Button onClick={() => dataApi.simulate()}>模拟PLC数据</Button>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="织机总数"
              value={loomStatus.length}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
            <Statistic
              title="运行中"
              value={runningCount}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Statistic
              title="停机中"
              value={stoppedCount}
              prefix={<PauseCircleOutlined />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' }}>
            <Statistic
              title="故障"
              value={faultCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card oee">
            <Statistic
              title="综合OEE"
              value={oeeSummary?.avgOee || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card output">
            <Statistic
              title="7天总产量"
              value={oeeSummary?.totalOutput || 0}
              suffix="米"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card efficiency">
            <Statistic
              title="时间稼动率"
              value={oeeSummary?.avgAvailability || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' }}>
            <Statistic
              title="良品率"
              value={oeeSummary?.avgQuality || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="OEE构成分析" loading={loading}>
            <ReactECharts option={oeeChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="停机原因TOP10（近7天）" loading={loading}>
            <ReactECharts option={downtimeChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Card title="织机实时状态" style={{ marginTop: 24 }} loading={loading}>
        <Table
          columns={columns}
          dataSource={loomStatus}
          rowKey={(record) => record.loom.id}
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
