import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Progress,
  Tag,
  Image,
  List,
  Collapse,
  Empty,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Result,
} from 'antd';
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { reportApi } from '../services/api';
import { InspectionReport, InspectionResult } from '../types';
import dayjs from 'dayjs';

const { Panel } = Collapse;

const ShareReport: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadReport();
    }
  }, [token]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await reportApi.getByShareToken(token!);
      if (response.code === 200) {
        setReport(response.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const getProblemItems = () => {
    if (!report?.results) return [];
    return report.results.filter(r => r.result !== 'ok');
  };

  const getResultIcon = (result: string) => {
    if (result === 'ok') return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (result === 'attention') return <WarningOutlined style={{ color: '#faad14' }} />;
    return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getResultColor = (result: string) => {
    if (result === 'ok') return '#52c41a';
    if (result === 'attention') return '#faad14';
    return '#ff4d4f';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Result
          status="warning"
          title="报告链接已失效"
          subTitle={error}
        />
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Empty description="报告不存在" />
      </div>
    );
  }

  const problemItems = getProblemItems();
  const levelColors: Record<string, string> = {
    A: '#52c41a',
    B: '#1890ff',
    C: '#faad14',
    D: '#ff4d4f',
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 水印效果提示 */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-30deg)',
        fontSize: 60,
        color: 'rgba(0,0,0,0.05)',
        pointerEvents: 'none',
        zIndex: 1000,
        fontWeight: 'bold',
      }}>
        VIN:{report.vehicle?.vin}
      </div>

      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
            二手车检测报告
          </h1>
          <p style={{ color: '#999' }}>报告编号: {report.reportNo}</p>
          <Tag color="blue">车架号: {report.vehicle?.vin}</Tag>
        </div>

        {/* 综合评分 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
              <Statistic
                title="综合评分"
                value={report.totalScore?.toFixed(1) || 0}
                suffix="/ 100"
                valueStyle={{ color: levelColors[report.level || 'D'] || '#ff4d4f', fontSize: 36 }}
              />
              <Tag color={levelColors[report.level || 'D']} style={{ fontSize: 16, padding: '4px 16px' }}>
                {report.level}级车况
              </Tag>
            </div>
          </Col>
          <Col span={16}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="车辆品牌">{report.vehicle?.brand}</Descriptions.Item>
              <Descriptions.Item label="车辆型号">{report.vehicle?.model}</Descriptions.Item>
              <Descriptions.Item label="年款">{report.vehicle?.year}</Descriptions.Item>
              <Descriptions.Item label="车牌号">{report.vehicle?.licensePlate || '-'}</Descriptions.Item>
              <Descriptions.Item label="检测里程">{report.mileage?.toLocaleString()} 公里</Descriptions.Item>
              <Descriptions.Item label="检测日期">{report.inspectionDate}</Descriptions.Item>
              <Descriptions.Item label="检测员">{report.inspector?.realName}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* 各大类得分 */}
        {report.categoryScores && report.categoryScores.length > 0 && (
          <Card title="各大类得分" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              {report.categoryScores.map(cs => (
                <Col key={cs.id} span={8}>
                  <div style={{ padding: 12, background: '#fafafa', borderRadius: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 'bold' }}>{cs.categoryName}</span>
                      <span>{cs.totalScore.toFixed(0)}/{cs.maxScore.toFixed(0)}</span>
                    </div>
                    <Progress
                      percent={cs.percentage}
                      size="small"
                      strokeColor={cs.percentage >= 80 ? '#52c41a' : cs.percentage >= 60 ? '#faad14' : '#ff4d4f'}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* 问题汇总 */}
        {problemItems.length > 0 && (
          <Card
            title={
              <span>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                问题汇总 ({problemItems.length}项)
              </span>
            }
            size="small"
            style={{ marginBottom: 16, borderColor: '#ff4d4f' }}
          >
            <List
              dataSource={problemItems}
              renderItem={(item: InspectionResult) => (
                <List.Item key={item.id}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      {getResultIcon(item.result)}
                      <span style={{ marginLeft: 8, fontWeight: 'bold' }}>
                        {item.item?.name}
                      </span>
                      <Tag color={item.result === 'abnormal' ? 'red' : 'orange'} style={{ marginLeft: 8 }}>
                        {item.result === 'abnormal' ? '异常' : '注意'}
                      </Tag>
                    </div>
                    {item.remark && (
                      <p style={{ color: '#666', marginBottom: 8 }}>{item.remark}</p>
                    )}
                    {item.repairSuggestion && (
                      <div style={{ padding: 8, background: '#fff2e8', borderRadius: 4 }}>
                        <p style={{ margin: 0, color: '#d46b08' }}>
                          <strong>维修建议：</strong>{item.repairSuggestion.suggestion}
                        </p>
                        <p style={{ margin: 0, color: '#d46b08' }}>
                          <strong>预估费用：</strong>¥{item.repairSuggestion.estimatedCost.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {item.photos && item.photos.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {item.photos.map(photo => (
                          <Image
                            key={photo.id}
                            width={80}
                            height={80}
                            src={`http://localhost:3001${photo.filePath}`}
                            style={{ objectFit: 'cover' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* 详细检测结果 */}
        <Card title="详细检测结果" size="small">
          <Collapse defaultActiveKey={[]}>
            {report.categoryScores?.map(cs => {
              const categoryResults = report?.results?.filter(
                r => r.categoryId === cs.categoryId
              ) || [];
              return (
                <Panel
                  header={
                    <span>
                      {cs.categoryName}
                      <Tag style={{ marginLeft: 8 }}>{categoryResults.length}项</Tag>
                    </span>
                  }
                  key={cs.categoryId}
                >
                  <List
                    dataSource={categoryResults}
                    size="small"
                    renderItem={(item: InspectionResult) => (
                      <List.Item key={item.id}>
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                          {getResultIcon(item.result)}
                          <span style={{ marginLeft: 8, flex: 1 }}>
                            {item.item?.name}
                          </span>
                          <Tag color={getResultColor(item.result)}>
                            {item.result === 'ok' ? '正常' : item.result === 'attention' ? '注意' : '异常'}
                          </Tag>
                          {item.photos && item.photos.length > 0 && (
                            <div style={{ marginLeft: 16, display: 'flex', gap: 4 }}>
                              {item.photos.slice(0, 3).map(photo => (
                                <Image
                                  key={photo.id}
                                  width={40}
                                  height={40}
                                  src={`http://localhost:3001${photo.filePath}`}
                                  style={{ objectFit: 'cover' }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                </Panel>
              );
            })}
          </Collapse>
        </Card>

        {/* 报告底部 */}
        <div style={{ marginTop: 24, textAlign: 'center', color: '#999', fontSize: 12 }}>
          <p>本报告仅供参考，不作为交易依据</p>
          <p>报告生成时间: {dayjs(report.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
          <p>报告有效期至: {dayjs(report.shareExpireAt).format('YYYY-MM-DD HH:mm:ss')}</p>
        </div>
      </Card>
    </div>
  );
};

export default ShareReport;
