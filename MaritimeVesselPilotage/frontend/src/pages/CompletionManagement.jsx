import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Space,
  Typography,
  Card,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  InputNumber,
  message,
  Row,
  Col,
  Descriptions,
  Rate,
  Progress,
  Statistic,
  List,
  Divider
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const CompletionManagement = () => {
  const [completions, setCompletions] = useState([]);
  const [filteredCompletions, setFilteredCompletions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentCompletion, setCurrentCompletion] = useState(null);
  const [modalType, setModalType] = useState('add');
  const [form] = Form.useForm();
  const [assignments, setAssignments] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [statistics, setStatistics] = useState({
    totalCount: 0,
    avgScore: 0,
    excellentCount: 0,
    goodCount: 0
  });

  useEffect(() => {
    const mockAssignments = [
      {
        id: 2,
        assignmentNo: 'ASG-20260605-002',
        orderNo: 'ORD-20260601-002',
        vesselName: '海洋一号',
        pilotageType: '出港',
        pilot: { id: 1, name: '张三', level: '一级引航员' },
        status: 'in_progress'
      },
      {
        id: 3,
        assignmentNo: 'ASG-20260606-001',
        orderNo: 'ORD-20260602-003',
        vesselName: '长江七号',
        pilotageType: '移泊',
        pilot: { id: 2, name: '李四', level: '一级引航员' },
        status: 'in_progress'
      }
    ];

    const mockCompletions = [
      {
        id: 1,
        completionNo: 'CMP-20260605-001',
        assignmentNo: 'ASG-20260605-002',
        orderNo: 'ORD-20260601-002',
        vesselName: '海洋一号',
        vesselType: '散货船',
        pilotageType: '出港',
        pilotName: '张三',
        pilotLevel: '一级引航员',
        actualStartTime: '2026-06-05 14:30:00',
        actualEndTime: '2026-06-05 16:45:00',
        duration: 2.25,
        fromPort: '宁波舟山港',
        toPort: '新加坡港',
        tugNames: ['拖轮001'],
        qualityScore: 4.8,
        safetyScore: 5,
        efficiencyScore: 4.5,
        attitudeScore: 5,
        overallScore: 4.8,
        weatherCondition: '晴',
        seaCondition: '良好',
        specialSituations: '',
        pilotComments: '作业顺利，无异常',
        captainComments: '引航员专业，操作规范',
        status: 'completed',
        createTime: '2026-06-05 17:00:00'
      },
      {
        id: 2,
        completionNo: 'CMP-20260606-001',
        assignmentNo: 'ASG-20260606-001',
        orderNo: 'ORD-20260602-003',
        vesselName: '长江七号',
        vesselType: '油轮',
        pilotageType: '移泊',
        pilotName: '李四',
        pilotLevel: '一级引航员',
        actualStartTime: '2026-06-06 10:15:00',
        actualEndTime: '2026-06-06 11:30:00',
        duration: 1.25,
        fromPort: '1号码头',
        toPort: '3号码头',
        tugNames: ['拖轮001', '拖轮002'],
        qualityScore: 5,
        safetyScore: 5,
        efficiencyScore: 5,
        attitudeScore: 4.5,
        overallScore: 4.9,
        weatherCondition: '多云',
        seaCondition: '一般',
        specialSituations: '危险品船舶，采取了额外防护措施',
        pilotComments: '危险品作业，全程严格按照规范操作',
        captainComments: '非常专业，处理得当',
        status: 'completed',
        createTime: '2026-06-06 12:00:00'
      },
      {
        id: 3,
        completionNo: 'CMP-20260607-001',
        assignmentNo: 'ASG-20260607-001',
        orderNo: 'ORD-20260603-005',
        vesselName: '东方明珠',
        vesselType: '客滚轮',
        pilotageType: '出港',
        pilotName: '孙七',
        pilotLevel: '三级引航员',
        actualStartTime: '2026-06-07 16:20:00',
        actualEndTime: '2026-06-07 18:10:00',
        duration: 1.83,
        fromPort: '宁波舟山港',
        toPort: '上海港',
        tugNames: ['拖轮001'],
        qualityScore: 4.5,
        safetyScore: 4.5,
        efficiencyScore: 4,
        attitudeScore: 5,
        overallScore: 4.5,
        weatherCondition: '小雨',
        seaCondition: '良好',
        specialSituations: '载有乘客250人',
        pilotComments: '客轮引航，优先保障安全',
        captainComments: '服务态度好，操作规范',
        status: 'completed',
        createTime: '2026-06-07 18:30:00'
      }
    ];

    setAssignments(mockAssignments);
    setCompletions(mockCompletions);
    setFilteredCompletions(mockCompletions);
    updateStatistics(mockCompletions);
  }, []);

  const updateStatistics = (data) => {
    const totalCount = data.length;
    const totalScore = data.reduce((sum, item) => sum + item.overallScore, 0);
    const avgScore = totalCount > 0 ? Math.round(totalScore / totalCount * 10) / 10 : 0;
    const excellentCount = data.filter((item) => item.overallScore >= 4.5).length;
    const goodCount = data.filter((item) => item.overallScore >= 4 && item.overallScore < 4.5).length;

    setStatistics({
      totalCount,
      avgScore,
      excellentCount,
      goodCount
    });
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return '#52c41a';
    if (score >= 4) return '#1890ff';
    if (score >= 3) return '#faad14';
    return '#ff4d4f';
  };

  const getScoreLevel = (score) => {
    if (score >= 4.5) return { text: '优秀', color: 'success' };
    if (score >= 4) return { text: '良好', color: 'blue' };
    if (score >= 3) return { text: '合格', color: 'warning' };
    return { text: '不合格', color: 'error' };
  };

  const getPilotageTypeTag = (type) => {
    const colorMap = {
      '进港': 'blue',
      '出港': 'green',
      '移泊': 'orange'
    };
    return <Tag color={colorMap[type]}>{type}</Tag>;
  };

  const handleSearch = () => {
    let result = [...completions];

    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      result = result.filter((c) => {
        const completionDate = c.actualEndTime.split(' ')[0];
        return completionDate >= startDate && completionDate <= endDate;
      });
    }

    setFilteredCompletions(result);
    updateStatistics(result);
  };

  const handleReset = () => {
    setDateRange(null);
    setFilteredCompletions(completions);
    updateStatistics(completions);
  };

  const handleAdd = () => {
    setModalType('add');
    setCurrentCompletion(null);
    form.resetFields();
    form.setFieldsValue({
      qualityScore: 5,
      safetyScore: 5,
      efficiencyScore: 5,
      attitudeScore: 5
    });
    setModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setCurrentCompletion(record);
    setDetailVisible(true);
  };

  const handleEdit = (record) => {
    setModalType('edit');
    setCurrentCompletion(record);
    form.setFieldsValue({
      assignmentId: record.id,
      actualStartTime: dayjs(record.actualStartTime),
      actualEndTime: dayjs(record.actualEndTime),
      weatherCondition: record.weatherCondition,
      seaCondition: record.seaCondition,
      specialSituations: record.specialSituations,
      pilotComments: record.pilotComments,
      captainComments: record.captainComments,
      qualityScore: record.qualityScore,
      safetyScore: record.safetyScore,
      efficiencyScore: record.efficiencyScore,
      attitudeScore: record.attitudeScore
    });
    setModalVisible(true);
  };

  const handleAssignmentChange = (value) => {
    const selected = assignments.find((a) => a.id === value);
    if (selected) {
      form.setFieldsValue({
        pilotName: selected.pilot?.name,
        vesselName: selected.vesselName
      });
    }
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const assignment = assignments.find((a) => a.id === values.assignmentId);

      const startTime = values.actualStartTime.toDate();
      const endTime = values.actualEndTime.toDate();
      const duration = Math.round((endTime - startTime) / (1000 * 60 * 60) * 100) / 100;

      const overallScore = Math.round(
        (values.qualityScore + values.safetyScore + values.efficiencyScore + values.attitudeScore) / 4 * 10
      ) / 10;

      if (modalType === 'add') {
        const newCompletion = {
          id: completions.length + 1,
          completionNo: `CMP-${dayjs().format('YYYYMMDD')}-${String(completions.length + 1).padStart(3, '0')}`,
          assignmentNo: assignment?.assignmentNo || '',
          orderNo: assignment?.orderNo || '',
          vesselName: assignment?.vesselName || '',
          pilotageType: assignment?.pilotageType || '',
          pilotName: assignment?.pilot?.name || values.pilotName,
          pilotLevel: assignment?.pilot?.level || '',
          actualStartTime: values.actualStartTime.format('YYYY-MM-DD HH:mm:ss'),
          actualEndTime: values.actualEndTime.format('YYYY-MM-DD HH:mm:ss'),
          duration,
          qualityScore: values.qualityScore,
          safetyScore: values.safetyScore,
          efficiencyScore: values.efficiencyScore,
          attitudeScore: values.attitudeScore,
          overallScore,
          weatherCondition: values.weatherCondition,
          seaCondition: values.seaCondition,
          specialSituations: values.specialSituations,
          pilotComments: values.pilotComments,
          captainComments: values.captainComments,
          status: 'completed',
          createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        const updatedCompletions = [...completions, newCompletion];
        setCompletions(updatedCompletions);
        setFilteredCompletions(updatedCompletions);
        updateStatistics(updatedCompletions);
        message.success('登记成功');
      } else {
        const updatedCompletions = completions.map((c) =>
          c.id === currentCompletion.id
            ? {
                ...c,
                actualStartTime: values.actualStartTime.format('YYYY-MM-DD HH:mm:ss'),
                actualEndTime: values.actualEndTime.format('YYYY-MM-DD HH:mm:ss'),
                duration,
                qualityScore: values.qualityScore,
                safetyScore: values.safetyScore,
                efficiencyScore: values.efficiencyScore,
                attitudeScore: values.attitudeScore,
                overallScore,
                weatherCondition: values.weatherCondition,
                seaCondition: values.seaCondition,
                specialSituations: values.specialSituations,
                pilotComments: values.pilotComments,
                captainComments: values.captainComments
              }
            : c
        );
        setCompletions(updatedCompletions);
        setFilteredCompletions(updatedCompletions);
        updateStatistics(updatedCompletions);
        message.success('更新成功');
      }
      setModalVisible(false);
    });
  };

  const columns = [
    {
      title: '完成单编号',
      dataIndex: 'completionNo',
      key: 'completionNo',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '船名',
      dataIndex: 'vesselName',
      key: 'vesselName'
    },
    {
      title: '引航类型',
      dataIndex: 'pilotageType',
      key: 'pilotageType',
      render: (type) => getPilotageTypeTag(type)
    },
    {
      title: '引航员',
      dataIndex: 'pilotName',
      key: 'pilotName'
    },
    {
      title: '实际完成时间',
      dataIndex: 'actualEndTime',
      key: 'actualEndTime',
      render: (time) => time.split(' ')[0]
    },
    {
      title: '作业时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (hours) => `${hours} 小时`
    },
    {
      title: '综合评分',
      dataIndex: 'overallScore',
      key: 'overallScore',
      render: (score) => {
        const level = getScoreLevel(score);
        return (
          <Space>
            <Rate disabled value={score} allowHalf style={{ fontSize: '12px' }} />
            <Tag color={level.color}>{score}</Tag>
          </Space>
        );
      }
    },
    {
      title: '评价',
      key: 'level',
      render: (_, record) => {
        const level = getScoreLevel(record.overallScore);
        return <Tag color={level.color}>{level.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0 }}>完成单管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            登记完成单
          </Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="完成单数"
                value={statistics.totalCount}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="平均评分"
                value={statistics.avgScore}
                precision={1}
                prefix={<StarOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: getScoreColor(statistics.avgScore) }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="优秀"
                value={statistics.excellentCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="良好"
                value={statistics.goodCount}
                prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          style={{ marginBottom: '24px' }}
          bodyStyle={{ padding: '16px' }}
        >
          <Space wrap>
            <Space>
              <Text strong>完成日期：</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
            </Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
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
        </Card>

        <Table
          columns={columns}
          dataSource={filteredCompletions}
          rowKey="id"
        />

        <Modal
          title={modalType === 'add' ? '登记完成单' : '编辑完成单'}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={() => setModalVisible(false)}
          width={700}
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            {modalType === 'add' && (
              <Form.Item
                name="assignmentId"
                label="选择任务"
                rules={[{ required: true, message: '请选择任务' }]}
              >
                <Select
                  placeholder="请选择已分配的任务"
                  onChange={handleAssignmentChange}
                >
                  {assignments
                    .filter((a) => a.status === 'in_progress')
                    .map((assignment) => (
                      <Option key={assignment.id} value={assignment.id}>
                        {assignment.vesselName} - {assignment.pilotageType}
                        <Tag color="blue">{assignment.pilot?.name}</Tag>
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            )}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="actualStartTime"
                  label="实际开始时间"
                  rules={[{ required: true, message: '请选择开始时间' }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="actualEndTime"
                  label="实际结束时间"
                  rules={[{ required: true, message: '请选择结束时间' }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD HH:mm"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="weatherCondition"
                  label="天气情况"
                  rules={[{ required: true, message: '请选择天气情况' }]}
                >
                  <Select placeholder="请选择">
                    <Option value="晴">晴</Option>
                    <Option value="多云">多云</Option>
                    <Option value="阴">阴</Option>
                    <Option value="小雨">小雨</Option>
                    <Option value="中雨">中雨</Option>
                    <Option value="大雨">大雨</Option>
                    <Option value="雾">雾</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="seaCondition"
                  label="海况"
                  rules={[{ required: true, message: '请选择海况' }]}
                >
                  <Select placeholder="请选择">
                    <Option value="良好">良好</Option>
                    <Option value="一般">一般</Option>
                    <Option value="较差">较差</Option>
                    <Option value="恶劣">恶劣</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">质量评分</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="qualityScore"
                  label="服务质量"
                  rules={[{ required: true, message: '请评分' }]}
                >
                  <Rate allowHalf />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="safetyScore"
                  label="安全操作"
                  rules={[{ required: true, message: '请评分' }]}
                >
                  <Rate allowHalf />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="efficiencyScore"
                  label="作业效率"
                  rules={[{ required: true, message: '请评分' }]}
                >
                  <Rate allowHalf />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="attitudeScore"
                  label="服务态度"
                  rules={[{ required: true, message: '请评分' }]}
                >
                  <Rate allowHalf />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="specialSituations"
              label="特殊情况"
            >
              <TextArea rows={2} placeholder="如有特殊情况请说明" />
            </Form.Item>

            <Form.Item
              name="pilotComments"
              label="引航员备注"
            >
              <TextArea rows={2} placeholder="引航员作业备注" />
            </Form.Item>

            <Form.Item
              name="captainComments"
              label="船长评价"
            >
              <TextArea rows={2} placeholder="船长对引航服务的评价" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="完成单详情"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          width={700}
        >
          {currentCompletion && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="完成单编号">{currentCompletion.completionNo}</Descriptions.Item>
                <Descriptions.Item label="关联任务">{currentCompletion.assignmentNo}</Descriptions.Item>
                <Descriptions.Item label="船名">{currentCompletion.vesselName}</Descriptions.Item>
                <Descriptions.Item label="船舶类型">{currentCompletion.vesselType}</Descriptions.Item>
                <Descriptions.Item label="引航类型">{getPilotageTypeTag(currentCompletion.pilotageType)}</Descriptions.Item>
                <Descriptions.Item label="引航员">{currentCompletion.pilotName} ({currentCompletion.pilotLevel})</Descriptions.Item>
                <Descriptions.Item label="实际开始时间">{currentCompletion.actualStartTime}</Descriptions.Item>
                <Descriptions.Item label="实际结束时间">{currentCompletion.actualEndTime}</Descriptions.Item>
                <Descriptions.Item label="作业时长">{currentCompletion.duration} 小时</Descriptions.Item>
                <Descriptions.Item label="拖轮">{currentCompletion.tugNames?.join(', ') || '无'}</Descriptions.Item>
                <Descriptions.Item label="天气">{currentCompletion.weatherCondition}</Descriptions.Item>
                <Descriptions.Item label="海况">{currentCompletion.seaCondition}</Descriptions.Item>
              </Descriptions>

              <Card size="small" title="质量评分">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space justify="space-between" style={{ width: '100%' }}>
                        <Text>服务质量</Text>
                        <Rate disabled value={currentCompletion.qualityScore} allowHalf style={{ fontSize: '16px' }} />
                        <Text strong style={{ color: getScoreColor(currentCompletion.qualityScore) }}>
                          {currentCompletion.qualityScore}
                        </Text>
                      </Space>
                      <Space justify="space-between" style={{ width: '100%' }}>
                        <Text>安全操作</Text>
                        <Rate disabled value={currentCompletion.safetyScore} allowHalf style={{ fontSize: '16px' }} />
                        <Text strong style={{ color: getScoreColor(currentCompletion.safetyScore) }}>
                          {currentCompletion.safetyScore}
                        </Text>
                      </Space>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space justify="space-between" style={{ width: '100%' }}>
                        <Text>作业效率</Text>
                        <Rate disabled value={currentCompletion.efficiencyScore} allowHalf style={{ fontSize: '16px' }} />
                        <Text strong style={{ color: getScoreColor(currentCompletion.efficiencyScore) }}>
                          {currentCompletion.efficiencyScore}
                        </Text>
                      </Space>
                      <Space justify="space-between" style={{ width: '100%' }}>
                        <Text>服务态度</Text>
                        <Rate disabled value={currentCompletion.attitudeScore} allowHalf style={{ fontSize: '16px' }} />
                        <Text strong style={{ color: getScoreColor(currentCompletion.attitudeScore) }}>
                          {currentCompletion.attitudeScore}
                        </Text>
                      </Space>
                    </Space>
                  </Col>
                </Row>
                <Divider />
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Text type="secondary">综合评分</Text>
                  <Space align="center">
                    <Rate disabled value={currentCompletion.overallScore} allowHalf style={{ fontSize: '24px' }} />
                    <Text style={{ fontSize: '32px', fontWeight: 'bold', color: getScoreColor(currentCompletion.overallScore) }}>
                      {currentCompletion.overallScore}
                    </Text>
                    <Tag color={getScoreLevel(currentCompletion.overallScore).color} style={{ fontSize: '16px', padding: '4px 12px' }}>
                      {getScoreLevel(currentCompletion.overallScore).text}
                    </Tag>
                  </Space>
                </Space>
              </Card>

              {currentCompletion.specialSituations && (
                <Alert
                  message="特殊情况"
                  description={currentCompletion.specialSituations}
                  type="warning"
                  showIcon
                />
              )}

              <Card size="small" title="备注信息">
                <List>
                  <List.Item>
                    <List.Item.Meta
                      title="引航员备注"
                      description={currentCompletion.pilotComments || '无'}
                    />
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      title="船长评价"
                      description={currentCompletion.captainComments || '无'}
                    />
                  </List.Item>
                </List>
              </Card>
            </Space>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default CompletionManagement;
