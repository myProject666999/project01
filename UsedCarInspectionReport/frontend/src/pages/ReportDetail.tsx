import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Progress,
  Tag,
  Button,
  Image,
  List,
  Collapse,
  Empty,
  Space,
  Statistic,
  Row,
  Col,
  message,
  Modal,
  Input,
} from 'antd';
import {
  ArrowLeftOutlined,
  ShareAltOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { reportApi } from '../services/api';
import { InspectionReport, InspectionResult } from '../types';
import dayjs from 'dayjs';

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await reportApi.get(Number(id));
      if (response.code === 200) {
        setReport(response.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!report) return;
    try {
      const response = await reportApi.generateShareLink(report.id);
      if (response.code === 200) {
        const shareUrl = `${window.location.origin}/share/${response.data.shareToken}`;
        Modal.success({
          title: '分享链接已生成',
          content: (
            <div>
              <p>链接有效期30天</p>
              <Input.TextArea value={shareUrl} readOnly autoSize />
              <Button
                type="primary"
                style={{ marginTop: 8 }}
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  message.success('已复制到剪贴板');
                }}
              >
                复制链接
              </Button>
            </div>
          ),
        });
      }
    } catch (error) {
      message.error('生成分享链接失败');
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

  if (!report && !loading) {
    return <Empty description="报告不存在" />;
  }

  const problemItems = getProblemItems();
  const levelColors: Record<string, string> = {
    A: '#52c41a',
    B: '#1890ff',
    C: '#faad14',
    D: '#ff4d4f',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reports')}>
          返回列表
        </Button>
        {report?.status === 'submitted' && (
          <Button type="primary" icon={<ShareAltOutlined />} onClick={handleShare}>
            生成分享链接
          </Button>
        )}
      </div>

      {/* 报告头部 */}
      <Card loading={loading}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
            二手车检测报告
          </h1>
          <p style={{ color: '#999' }}>报告编号: {report?.reportNo}</p>
        </div>

        {/* 综合评分 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
              <Statistic
                title="综合评分"
                value={report?.totalScore?.toFixed(1) || 0}
                suffix="/ 100"
                valueStyle={{ color: levelColors[report?.level || 'D'] || '#ff4d4f', fontSize: 36 }}
              />
              <Tag color={levelColors[report?.level || 'D']} style={{ fontSize: 16, padding: '4px 16px' }}>
                {report?.level}级车况
              </Tag>
            </div>
          </Col>
          <Col span={16}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="车辆品牌">{report?.vehicle?.brand}</Descriptions.Item>
              <Descriptions.Item label="车辆型号">{report?.vehicle?.model}</Descriptions.Item>
              <Descriptions.Item label="年款">{report?.vehicle?.year}</Descriptions.Item>
              <Descriptions.Item label="车牌号">{report?.vehicle?.licensePlate || '-'}</Descriptions.Item>
              <Descriptions.Item label="车架号(VIN)">{report?.vehicle?.vin}</Descriptions.Item>
              <Descriptions.Item label="检测里程">{report?.mileage?.toLocaleString()} 公里</Descriptions.Item>
              <Descriptions.Item label="检测日期">{report?.inspectionDate}</Descriptions.Item>
              <Descriptions.Item label="检测员">{report?.inspector?.realName}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* 各大类得分 */}
        {report?.categoryScores && report.categoryScores.length > 0 && (
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
                            src={photo.filePath}
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
          <Collapse
            defaultActiveKey={[]}
            items={report?.categoryScores?.map(cs => {
              const categoryResults = report?.results?.filter(
                r => r.categoryId === cs.categoryId
              ) || [];
              return {
                key: cs.categoryId,
                label: (
                  <span>
                    {cs.categoryName}
                    <Tag style={{ marginLeft: 8 }}>{categoryResults.length}项</Tag>
                  </span>
                ),
                children: (
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
                                  src={photo.filePath}
                                  style={{ objectFit: 'cover' }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                ),
              };
            })}
          />
        </Card>

        {/* 报告底部 */}
        <div style={{ marginTop: 24, textAlign: 'center', color: '#999', fontSize: 12 }}>
          <p>本报告仅供参考，不作为交易依据</p>
          <p>报告生成时间: {dayjs(report?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
        </div>
      </Card>
    </div>
  );
};

export default ReportDetail;
