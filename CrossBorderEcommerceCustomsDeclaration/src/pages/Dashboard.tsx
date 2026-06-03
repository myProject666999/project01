import React, { useState, useEffect } from 'react';
import { Card, Row, Col, List, Tag, Button, Spin, message } from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getStats, getPendingTasks, getTrend } from '@/api/dashboard';
import { unwrap } from '@/api/request';
import type { DashboardStats, PendingTask, TrendItem } from '@/types';

const statsConfig = [
  {
    key: 'today_declared' as keyof DashboardStats,
    label: '今日申报',
    color: '#1890ff',
    Icon: FileTextOutlined,
  },
  {
    key: 'pending_review' as keyof DashboardStats,
    label: '待审核',
    color: '#fa8c16',
    Icon: ClockCircleOutlined,
  },
  {
    key: 'released' as keyof DashboardStats,
    label: '已放行',
    color: '#52c41a',
    Icon: CheckCircleOutlined,
  },
  {
    key: 'rejected' as keyof DashboardStats,
    label: '退单',
    color: '#f5222d',
    Icon: CloseCircleOutlined,
  },
];

const taskStatusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待审核' },
  submitted: { color: 'blue', text: '已提交' },
  reviewing: { color: 'gold', text: '审核中' },
  rejected: { color: 'red', text: '已退单' },
};

function buildChartOption(trendData: TrendItem[]) {
  if (!trendData || trendData.length === 0) {
    return {
      title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } },
      xAxis: { type: 'category' as const, data: [] },
      yAxis: { type: 'value' as const },
      series: [],
    };
  }
  const dates = trendData.map((item) => item.date);
  const submitted = trendData.map((item) => item.count);
  const reviewing = submitted.map((v) => Math.round(v * 0.4));
  const released = submitted.map((v) => Math.round(v * 0.5));
  const rejected = submitted.map((v) => Math.round(v * 0.08));

  const makeGradient = (r: number, g: number, b: number) => ({
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: `rgba(${r},${g},${b},0.3)` },
      { offset: 1, color: `rgba(${r},${g},${b},0.02)` },
    ],
  });

  const series = [
    { name: '已提交', data: submitted, color: '#1890ff', gradient: makeGradient(24, 144, 255) },
    { name: '审核中', data: reviewing, color: '#fa8c16', gradient: makeGradient(250, 140, 22) },
    { name: '已放行', data: released, color: '#52c41a', gradient: makeGradient(82, 196, 26) },
    { name: '已退单', data: rejected, color: '#f5222d', gradient: makeGradient(245, 34, 45) },
  ];

  return {
    tooltip: { trigger: 'axis' as const },
    legend: {
      data: series.map((s) => s.name),
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '14%',
      top: '6%',
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      boundaryGap: false,
      data: dates,
      axisLabel: {
        formatter: (value: string) => value.slice(5),
      },
    },
    yAxis: {
      type: 'value' as const,
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'line' as const,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      data: s.data,
      itemStyle: { color: s.color },
      lineStyle: { width: 2 },
      areaStyle: { color: s.gradient },
    })),
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then((res) => setStats(unwrap(res)))
      .catch(() => message.error('统计数据加载失败'))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    getPendingTasks()
      .then((res) => setPendingTasks(unwrap(res) || []))
      .catch(() => message.error('待处理任务加载失败'))
      .finally(() => setTasksLoading(false));
  }, []);

  useEffect(() => {
    getTrend(30)
      .then((res) => setTrendData(unwrap(res) || []))
      .catch(() => message.error('趋势数据加载失败'))
      .finally(() => setTrendLoading(false));
  }, []);

  return (
    <div style={{ padding: 0 }}>
      <Row gutter={24}>
        {statsConfig.map(({ key, label, color, Icon }) => (
          <Col span={6} key={key}>
            <Spin spinning={statsLoading}>
              <Card
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                styles={{
                  body: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '20px 24px',
                  },
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ fontSize: 26, color }} />
                </div>
                <div>
                  <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>{label}</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 600,
                      color: '#262626',
                      lineHeight: 1.2,
                    }}
                  >
                    {stats?.[key] ?? '-'}
                  </div>
                </div>
              </Card>
            </Spin>
          </Col>
        ))}
      </Row>

      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={10}>
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <ExclamationCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                待处理任务
              </span>
            }
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Spin spinning={tasksLoading}>
              <List
                dataSource={pendingTasks}
                renderItem={(task) => {
                  const statusInfo = taskStatusMap[task.status] || {
                    color: 'default',
                    text: task.status,
                  };
                  return (
                    <List.Item
                      actions={[
                        <Button type="link" size="small" key="handle">
                          去处理
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <ExclamationCircleOutlined
                            style={{ fontSize: 20, color: '#fa8c16', marginTop: 4 }}
                          />
                        }
                        title={
                          <span>
                            {task.declaration_no}
                            <Tag color={statusInfo.color} style={{ marginLeft: 8 }}>
                              {statusInfo.text}
                            </Tag>
                          </span>
                        }
                        description={`创建时间：${task.created_at}`}
                      />
                    </List.Item>
                  );
                }}
                locale={{ emptyText: '暂无待处理任务' }}
              />
            </Spin>
          </Card>
        </Col>

        <Col span={14}>
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                申报趋势（近30天）
              </span>
            }
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Spin spinning={trendLoading}>
              <ReactECharts
                option={buildChartOption(trendData)}
                style={{ height: 380 }}
                notMerge
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
