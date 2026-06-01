import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Button } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { flightPlanApi } from '../api'

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  })
  const [recentPlans, setRecentPlans] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await flightPlanApi.getAll()
      setStats({
        total: data.length,
        approved: data.filter(p => p.status === 'APPROVED').length,
        pending: data.filter(p => ['SUBMITTED', 'APPROVING'].includes(p.status)).length,
        rejected: data.filter(p => p.status === 'REJECTED').length
      })
      setRecentPlans(data.slice(0, 5))
    } catch (error) {
      console.error('加载数据失败', error)
    }
    setLoading(false)
  }

  const getStatusTag = (status) => {
    const statusMap = {
      DRAFT: { color: 'default', text: '草稿' },
      SUBMITTED: { color: 'blue', text: '已提交' },
      APPROVING: { color: 'processing', text: '审批中' },
      APPROVED: { color: 'success', text: '已批复' },
      REJECTED: { color: 'error', text: '已驳回' },
      CANCELLED: { color: 'warning', text: '已取消' },
      COMPLETED: { color: 'success', text: '已完成' }
    }
    const config = statusMap[status] || { color: 'default', text: status }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const columns = [
    { title: '计划编号', dataIndex: 'planNumber', key: 'planNumber' },
    { title: '起飞机场', dataIndex: 'departureAirport', key: 'departureAirport' },
    { title: '降落机场', dataIndex: 'arrivalAirport', key: 'arrivalAirport' },
    { title: '起飞时间', dataIndex: 'departureTime', key: 'departureTime' },
    { title: '状态', dataIndex: 'status', key: 'status', render: getStatusTag }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>工作台</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/flight-plans/new')}>
          新建飞行计划
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="计划总数"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已批复"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已驳回"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近飞行计划">
        <Table
          columns={columns}
          dataSource={recentPlans}
          rowKey="id"
          loading={loading}
          pagination={false}
          onRow={(record) => ({
            onClick: () => navigate(`/flight-plans/${record.id}`)
          })}
        />
      </Card>
    </div>
  )
}

export default Dashboard
