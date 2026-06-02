import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Typography,
  DatePicker,
  Select,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Alert,
  Table,
  Tooltip
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  SearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const TideManagement = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [vesselDraft, setVesselDraft] = useState(8.5);
  const [tideData, setTideData] = useState([]);
  const [availableWindows, setAvailableWindows] = useState([]);
  const [tideInfo, setTideInfo] = useState({
    highTide: [],
    lowTide: []
  });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  const svgRef = useRef(null);

  useEffect(() => {
    if (selectedDate) {
      generateTideData();
    }
  }, [selectedDate, vesselDraft]);

  const generateTideData = () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const data = [];
    const highTides = [];
    const lowTides = [];
    const windows = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = dayjs(`${dateStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        const t = (hour + minute / 60) / 24 * Math.PI * 4;
        const baseHeight = 6.5;
        const amplitude = 2.8;
        const phase = Math.PI / 3;
        const height = baseHeight + amplitude * Math.sin(t + phase) + 0.3 * Math.sin(t * 2 + phase / 2);
        const roundedHeight = Math.round(height * 100) / 100;

        const isAvailable = roundedHeight >= vesselDraft + 0.5;

        data.push({
          time: time.format('HH:mm'),
          datetime: time.toISOString(),
          hourValue: hour + minute / 60,
          height: roundedHeight,
          isAvailable,
          draft: vesselDraft + 0.5,
          type: isAvailable ? '可用窗口' : '不可用'
        });
      }
    }

    let prevHeight = null;
    for (let i = 0; i < data.length; i++) {
      if (prevHeight !== null) {
        if (prevHeight < data[i].height && i > 0 && i < data.length - 1) {
          if (data[i].height > data[i + 1].height) {
            highTides.push({
              time: data[i].time,
              height: data[i].height
            });
          }
        }
        if (prevHeight > data[i].height && i > 0 && i < data.length - 1) {
          if (data[i].height < data[i + 1].height) {
            lowTides.push({
              time: data[i].time,
              height: data[i].height
            });
          }
        }
      }
      prevHeight = data[i].height;
    }

    let windowStart = null;
    let windowStartIdx = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i].isAvailable && windowStart === null) {
        windowStart = data[i];
        windowStartIdx = i;
      } else if (!data[i].isAvailable && windowStart !== null) {
        const windowData = data.slice(windowStartIdx, i);
        windows.push({
          id: windows.length + 1,
          startTime: windowStart.time,
          endTime: data[i - 1].time,
          maxHeight: Math.max(...windowData.map(d => d.height)),
          duration: Math.round(windowData.length * 0.25 * 10) / 10
        });
        windowStart = null;
        windowStartIdx = null;
      }
    }
    if (windowStart !== null) {
      const windowData = data.slice(windowStartIdx);
      windows.push({
        id: windows.length + 1,
        startTime: windowStart.time,
        endTime: '24:00',
        maxHeight: Math.max(...windowData.map(d => d.height)),
        duration: Math.round(windowData.length * 0.25 * 10) / 10
      });
    }

    setTideData(data);
    setTideInfo({ highTide: highTides.slice(0, 2), lowTide: lowTides.slice(0, 2) });
    setAvailableWindows(windows);
  };

  const handleReset = () => {
    setSelectedDate(dayjs());
    setVesselDraft(8.5);
  };

  const renderTideChart = () => {
    const width = 800;
    const height = 360;
    const padding = { top: 30, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const minHeight = 0;
    const maxHeight = 12;

    const scaleX = (hour) => padding.left + (hour / 24) * chartWidth;
    const scaleY = (h) => padding.top + chartHeight - ((h - minHeight) / (maxHeight - minHeight)) * chartHeight;

    const safeWaterY = scaleY(vesselDraft + 0.5);

    const generatePath = (data, filterFn = null) => {
      const points = filterFn ? data.filter(filterFn) : data;
      if (points.length === 0) return '';

      let path = `M ${scaleX(points[0].hourValue)} ${scaleY(points[0].height)}`;

      for (let i = 1; i < points.length; i++) {
        const x = scaleX(points[i].hourValue);
        const y = scaleY(points[i].height);
        path += ` L ${x} ${y}`;
      }

      return path;
    };

    const availableData = tideData.filter(d => d.isAvailable);
    const unavailableData = tideData.filter(d => !d.isAvailable);

    const generateAreaPath = (points) => {
      if (points.length === 0) return '';
      let path = `M ${scaleX(points[0].hourValue)} ${safeWaterY}`;
      for (let i = 0; i < points.length; i++) {
        path += ` L ${scaleX(points[i].hourValue)} ${scaleY(points[i].height)}`;
      }
      path += ` L ${scaleX(points[points.length - 1].hourValue)} ${safeWaterY} Z`;
      return path;
    };

    const generateUnavailableAreaPath = (points) => {
      if (points.length === 0) return '';
      let path = `M ${scaleX(points[0].hourValue)} ${height - padding.bottom}`;
      for (let i = 0; i < points.length; i++) {
        path += ` L ${scaleX(points[i].hourValue)} ${Math.min(scaleY(points[i].height), safeWaterY)}`;
      }
      path += ` L ${scaleX(points[points.length - 1].hourValue)} ${height - padding.bottom} Z`;
      return path;
    };

    const handleMouseMove = (e) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - padding.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= chartWidth) {
        const hour = (x / chartWidth) * 24;
        const nearestIdx = Math.floor((hour / 24) * tideData.length);
        const data = tideData[Math.min(nearestIdx, tideData.length - 1)];
        if (data) {
          setTooltip({
            visible: true,
            x: e.clientX - rect.left + 10,
            y: e.clientY - rect.top - 60,
            data
          });
        }
      }
    };

    const handleMouseLeave = () => {
      setTooltip({ visible: false, x: 0, y: 0, data: null });
    };

    const xTicks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
    const yTicks = [0, 2, 4, 6, 8, 10, 12];

    const groupAvailableByWindow = () => {
      const groups = [];
      let currentGroup = [];
      for (let i = 0; i < availableData.length; i++) {
        if (currentGroup.length === 0 ||
          availableData[i].hourValue - availableData[i - 1]?.hourValue <= 0.26) {
          currentGroup.push(availableData[i]);
        } else {
          if (currentGroup.length > 0) groups.push(currentGroup);
          currentGroup = [availableData[i]];
        }
      }
      if (currentGroup.length > 0) groups.push(currentGroup);
      return groups;
    };

    const groupUnavailableByWindow = () => {
      const groups = [];
      let currentGroup = [];
      for (let i = 0; i < unavailableData.length; i++) {
        if (currentGroup.length === 0 ||
          unavailableData[i].hourValue - unavailableData[i - 1]?.hourValue <= 0.26) {
          currentGroup.push(unavailableData[i]);
        } else {
          if (currentGroup.length > 0) groups.push(currentGroup);
          currentGroup = [unavailableData[i]];
        }
      }
      if (currentGroup.length > 0) groups.push(currentGroup);
      return groups;
    };

    const availableGroups = groupAvailableByWindow();
    const unavailableGroups = groupUnavailableByWindow();

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ display: 'block', margin: '0 auto' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="availableGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#52c41a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#52c41a" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="unavailableGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d9d9d9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#d9d9d9" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {xTicks.map(tick => (
            <line
              key={`x-grid-${tick}`}
              x1={scaleX(tick)}
              y1={padding.top}
              x2={scaleX(tick)}
              y2={height - padding.bottom}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          {yTicks.map(tick => (
            <line
              key={`y-grid-${tick}`}
              x1={padding.left}
              y1={scaleY(tick)}
              x2={width - padding.right}
              y2={scaleY(tick)}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}

          {availableGroups.map((group, idx) => (
            <path
              key={`available-area-${idx}`}
              d={generateAreaPath(group)}
              fill="url(#availableGradient)"
            />
          ))}

          {unavailableGroups.map((group, idx) => (
            <path
              key={`unavailable-area-${idx}`}
              d={generateUnavailableAreaPath(group)}
              fill="url(#unavailableGradient)"
            />
          ))}

          {availableGroups.map((group, idx) => (
            <path
              key={`available-line-${idx}`}
              d={generatePath(group)}
              fill="none"
              stroke="#52c41a"
              strokeWidth="2.5"
            />
          ))}

          {unavailableGroups.map((group, idx) => (
            <path
              key={`unavailable-line-${idx}`}
              d={generatePath(group)}
              fill="none"
              stroke="#bfbfbf"
              strokeWidth="2"
            />
          ))}

          <line
            x1={padding.left}
            y1={safeWaterY}
            x2={width - padding.right}
            y2={safeWaterY}
            stroke="#faad14"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          <text
            x={width - padding.right - 5}
            y={safeWaterY - 8}
            fill="#faad14"
            fontSize="12"
            fontWeight="bold"
            textAnchor="end"
          >
            安全吃水 {vesselDraft + 0.5}m
          </text>

          {xTicks.map(tick => (
            <text
              key={`x-label-${tick}`}
              x={scaleX(tick)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fill="#666"
              fontSize="11"
            >
              {String(tick).padStart(2, '0')}:00
            </text>
          ))}

          {yTicks.map(tick => (
            <text
              key={`y-label-${tick}`}
              x={padding.left - 8}
              y={scaleY(tick) + 4}
              textAnchor="end"
              fill="#666"
              fontSize="11"
            >
              {tick}m
            </text>
          ))}

          <text
            x={padding.left + chartWidth / 2}
            y={height - 10}
            textAnchor="middle"
            fill="#333"
            fontSize="12"
            fontWeight="500"
          >
            时间
          </text>
          <text
            x={15}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            fill="#333"
            fontSize="12"
            fontWeight="500"
            transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
          >
            潮高（米）
          </text>

          {tideData.filter((_, i) => i % 8 === 0).map((d, idx) => (
            <circle
              key={`point-${idx}`}
              cx={scaleX(d.hourValue)}
              cy={scaleY(d.height)}
              r="3"
              fill={d.isAvailable ? '#52c41a' : '#bfbfbf'}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </svg>

        {tooltip.visible && tooltip.data && (
          <div
            style={{
              position: 'absolute',
              left: tooltip.x,
              top: tooltip.y,
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              pointerEvents: 'none',
              zIndex: 1000,
              minWidth: '160px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '13px' }}>
              {tooltip.data.time}
            </div>
            <div style={{ marginBottom: '4px' }}>
              潮高:
              <span style={{
                color: tooltip.data.isAvailable ? '#95de64' : '#ff7875',
                fontWeight: 'bold',
                marginLeft: '6px'
              }}>
                {tooltip.data.height} 米
              </span>
            </div>
            <div style={{ marginBottom: '4px', color: '#ccc' }}>
              安全吃水: {tooltip.data.draft} 米
            </div>
            <div>
              {tooltip.data.isAvailable ? (
                <span style={{ color: '#95de64' }}>✓ 可用窗口</span>
              ) : (
                <span style={{ color: '#ff7875' }}>✗ 水深不足</span>
              )}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-block',
              width: '16px',
              height: '3px',
              background: '#52c41a',
              borderRadius: '2px'
            }}></span>
            <Text style={{ fontSize: '12px' }}>可用窗口</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-block',
              width: '16px',
              height: '3px',
              background: '#bfbfbf',
              borderRadius: '2px'
            }}></span>
            <Text style={{ fontSize: '12px' }}>不可用</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-block',
              width: '16px',
              height: '2px',
              background: '#faad14',
              borderStyle: 'dashed',
              borderWidth: '0 0 2px 0'
            }}></span>
            <Text style={{ fontSize: '12px' }}>安全吃水线</Text>
          </div>
        </div>
      </div>
    );
  };

  const windowColumns = [
    {
      title: '窗口编号',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Tag color="blue">窗口 #{id}</Tag>
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime'
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
      key: 'duration',
      render: (hours) => <span>{hours} 小时</span>
    },
    {
      title: '最高潮高',
      dataIndex: 'maxHeight',
      key: 'maxHeight',
      render: (height) => <Text strong style={{ color: '#52c41a' }}>{height} 米</Text>
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="success">可用</Tag>
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <Title level={3} style={{ marginBottom: '24px' }}>潮汐管理</Title>

        <Alert
          message={
            <Space>
              <InfoCircleOutlined />
              船舶吃水 {vesselDraft} 米，安全水深要求 {vesselDraft + 0.5} 米
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Card style={{ marginBottom: '24px' }} styles={{ body: { padding: '16px' } }}>
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Text strong>选择日期：</Text>
              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                style={{ width: 180, marginLeft: '8px' }}
              />
            </Col>
            <Col>
              <Text strong>船舶吃水：</Text>
              <InputNumber
                min={3}
                max={15}
                step={0.1}
                value={vesselDraft}
                onChange={(value) => setVesselDraft(value)}
                style={{ width: 120, marginLeft: '8px' }}
                suffix="米"
              />
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={generateTideData}
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
        </Card>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space align="center">
                <RiseOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>高潮</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {tideInfo.highTide.map((t, idx) => (
                      <span key={idx} style={{ marginRight: idx < tideInfo.highTide.length - 1 ? '12px' : 0 }}>
                        {t.time} {t.height}m
                      </span>
                    ))}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space align="center">
                <FallOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>低潮</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {tideInfo.lowTide.map((t, idx) => (
                      <span key={idx} style={{ marginRight: idx < tideInfo.lowTide.length - 1 ? '12px' : 0 }}>
                        {t.time} {t.height}m
                      </span>
                    ))}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space align="center">
                <Tag color="success" style={{ fontSize: '20px', padding: '4px 12px' }}>
                  {availableWindows.length}
                </Tag>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>可用窗口数</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {selectedDate ? selectedDate.format('YYYY年MM月DD日') : '请选择日期'}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space align="center">
                <Tag color="blue" style={{ fontSize: '20px', padding: '4px 12px' }}>
                  {vesselDraft + 0.5}m
                </Tag>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>安全水深</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    含 0.5m 富余水深
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card title="潮汐曲线" style={{ marginBottom: '24px' }}>
          {renderTideChart()}
        </Card>

        <Card title="可用潮汐窗口">
          <Table
            columns={windowColumns}
            dataSource={availableWindows}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Card>
    </div>
  );
};

export default TideManagement;
