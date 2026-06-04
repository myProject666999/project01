import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Space, Input, Select, Button, Modal, Descriptions, Statistic } from 'antd';
import { SearchOutlined, ReloadOutlined, PlayCircleOutlined, PauseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { loomApi, dataApi } from '../services/api';

const { Search } = Input;
const { Option } = Select;

const LoomMonitor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loomList, setLoomList] = useState<any[]>([]);
  const [filteredList, setFilteredList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [selectedLoom, setSelectedLoom] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await loomApi.getAllRealtime();
      setLoomList(res.data);
      setFilteredList(res.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let filtered = loomList;
    if (searchText) {
      filtered = filtered.filter(item => 
        item.loom.loomCode.toLowerCase().includes(searchText.toLowerCase()) ||
        item.loom.brand.includes(searchText) ||
        item.loom.location.includes(searchText)
      );
    }
    if (statusFilter !== null) {
      filtered = filtered.filter(item => item.realtime?.runningStatus === statusFilter);
    }
    setFilteredList(filtered);
  }, [searchText, statusFilter, loomList]);

  const handleLoomClick = async (item: any) => {
    setSelectedLoom(item);
    setModalVisible(true);
    
    try {
      const res = await dataApi.getHistory(item.loom.id, {
        startTime: dayjs().subtract(1, 'hour').toISOString(),
        endTime: dayjs().toISOString(),
      });
      setHistoryData(res.data);
    } catch (error) {
      console.error('加载历史数据失败:', error);
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case 1: return 'running';
      case 2: return 'stopped';
      case 3: return 'fault';
      default: return '';
    }
  };

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

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: return <PlayCircleOutlined />;
      case 2: return <PauseCircleOutlined />;
      case 3: return <WarningOutlined />;
      default: return null;
    }
  };

  const speedChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: historyData.slice().reverse().map((d: any) => dayjs(d.timestamp).format('HH:mm:ss')),
    },
    yAxis: { type: 'value', name: '转速(rpm)' },
    series: [{
      name: '转速',
      type: 'line',
      smooth: true,
      data: historyData.slice().reverse().map((d: any) => d.speed),
      areaStyle: { opacity: 0.3 },
      lineStyle: { color: '#5470c6' },
      itemStyle: { color: '#5470c6' },
    }]
  };

  const outputChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: historyData.slice().reverse().map((d: any) => dayjs(d.timestamp).format('HH:mm:ss')),
    },
    yAxis: { type: 'value', name: '产量(米)' },
    series: [{
      name: '产量',
      type: 'bar',
      data: historyData.slice().reverse().map((d: any) => d.incrementalMeters),
      itemStyle: { color: '#91cc75' },
    }]
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Search
            placeholder="搜索织机编号、品牌、位置"
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value={1}>运行中</Option>
            <Option value={2}>停机</Option>
            <Option value={3}>故障</Option>
          </Select>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
          <Button onClick={() => dataApi.simulate()}>模拟数据</Button>
        </Space>
      </Space>

      <Row gutter={[16, 16]}>
        {filteredList.map((item) => (
          <Col span={6} key={item.loom.id}>
            <Card
              className={`loom-card ${getStatusClass(item.realtime?.runningStatus || 0)}`}
              hoverable
              onClick={() => handleLoomClick(item)}
              loading={loading}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <strong style={{ fontSize: 16 }}>{item.loom.loomCode}</strong>
                  <Tag color={getStatusColor(item.realtime?.runningStatus || 0)}>
                    {getStatusIcon(item.realtime?.runningStatus || 0)} {getStatusText(item.realtime?.runningStatus || 0)}
                  </Tag>
                </Space>
                <Row gutter={8}>
                  <Col span={12}>
                    <Statistic
                      title="转速"
                      value={item.realtime?.speed || 0}
                      suffix="rpm"
                      valueStyle={{ fontSize: 14 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="累计"
                      value={item.realtime?.meterage || 0}
                      suffix="米"
                      precision={2}
                      valueStyle={{ fontSize: 14 }}
                    />
                  </Col>
                </Row>
                <div style={{ color: '#666', fontSize: 12 }}>
                  {item.loom.brand} {item.loom.model}
                </div>
                <div style={{ color: '#666', fontSize: 12 }}>
                  {item.loom.location}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`织机详情 - ${selectedLoom?.loom.loomCode}`}
        open={modalVisible}
        width={800}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedLoom && (
          <div>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="织机编号">{selectedLoom.loom.loomCode}</Descriptions.Item>
              <Descriptions.Item label="品牌型号">{selectedLoom.loom.brand} {selectedLoom.loom.model}</Descriptions.Item>
              <Descriptions.Item label="安装位置">{selectedLoom.loom.location}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={getStatusColor(selectedLoom.realtime?.runningStatus || 0)}>
                  {getStatusText(selectedLoom.realtime?.runningStatus || 0)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前转速">{selectedLoom.realtime?.speed || 0} rpm</Descriptions.Item>
              <Descriptions.Item label="累计米数">{selectedLoom.realtime?.meterage?.toFixed(2) || 0} 米</Descriptions.Item>
              <Descriptions.Item label="额定产能">{selectedLoom.loom.ratedCapacity} 米/小时</Descriptions.Item>
              <Descriptions.Item label="累计运行">{selectedLoom.loom.totalRunningHours?.toFixed(2) || 0} 小时</Descriptions.Item>
            </Descriptions>

            <Card title="转速趋势（近1小时）" size="small" style={{ marginBottom: 16 }}>
              <ReactECharts option={speedChartOption} style={{ height: 200 }} />
            </Card>

            <Card title="产量分布（近1小时）" size="small">
              <ReactECharts option={outputChartOption} style={{ height: 200 }} />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoomMonitor;
