import React, { useEffect, useState } from 'react'
import { Table, Tag, Button, Space, Popconfirm, message, Input, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { flightPlanApi, pilotApi, aircraftApi } from '../api'

const { Search } = Input
const { Option } = Select

function FlightPlanList() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [pilots, setPilots] = useState([])
  const [aircrafts, setAircrafts] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState()

  useEffect(() => {
    loadData()
    loadPilots()
    loadAircrafts()
  }, [statusFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      let data
      if (statusFilter) {
        data = await flightPlanApi.getByStatus(statusFilter)
      } else {
        data = await flightPlanApi.getAll()
      }
      setPlans(data)
    } catch (error) {
      message.error('加载数据失败')
    }
    setLoading(false)
  }

  const loadPilots = async () => {
    try {
      const data = await pilotApi.getAll()
      setPilots(data)
    } catch (error) {
      console.error('加载飞行员数据失败', error)
    }
  }

  const loadAircrafts = async () => {
    try {
      const data = await aircraftApi.getAll()
      setAircrafts(data)
    } catch (error) {
      console.error('加载飞机数据失败', error)
    }
  }

  const getPilotName = (pilotId) => {
    const pilot = pilots.find(p => p.id === pilotId)
    return pilot ? pilot.licenseNumber : pilotId
  }

  const getAircraftInfo = (aircraftId) => {
    const aircraft = aircrafts.find(a => a.id === aircraftId)
    return aircraft ? `${aircraft.registrationNumber} (${aircraft.aircraftType})` : aircraftId
  }

  const handleDelete = async (id) => {
    try {
      await flightPlanApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败')
    }
  }

  const handleSubmit = async (id) => {
    try {
      await flightPlanApi.submit(id)
      message.success('提交成功')
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || '提交失败')
    }
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
    { title: '计划编号', dataIndex: 'planNumber', key: 'planNumber', width: 180 },
    { title: '飞行员', dataIndex: 'pilotId', key: 'pilotId', render: getPilotName },
    { title: '飞机', dataIndex: 'aircraftId', key: 'aircraftId', render: getAircraftInfo },
    { title: '起飞机场', dataIndex: 'departureAirport', key: 'departureAirport' },
    { title: '降落机场', dataIndex: 'arrivalAirport', key: 'arrivalAirport' },
    { title: '起飞时间', dataIndex: 'departureTime', key: 'departureTime', width: 180 },
    { title: '降落时间', dataIndex: 'arrivalTime', key: 'arrivalTime', width: 180 },
    { title: '状态', dataIndex: 'status', key: 'status', render: getStatusTag, width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} size="small"
            onClick={() => navigate(`/flight-plans/${record.id}`)}>
            详情
          </Button>
          {record.status === 'DRAFT' && (
            <>
              <Button type="link" icon={<EditOutlined />} size="small"
                onClick={() => navigate(`/flight-plans/edit/${record.id}`)}>
                编辑
              </Button>
              <Button type="link" icon={<SendOutlined />} size="small"
                onClick={() => handleSubmit(record.id)}>
                提交
              </Button>
              <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" danger icon={<DeleteOutlined />} size="small">
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>飞行计划列表</h2>
        <Space>
          <Select
            placeholder="状态筛选"
            style={{ width: 150 }}
            allowClear
            onChange={setStatusFilter}
            value={statusFilter}
          >
            <Option value="DRAFT">草稿</Option>
            <Option value="SUBMITTED">已提交</Option>
            <Option value="APPROVING">审批中</Option>
            <Option value="APPROVED">已批复</Option>
            <Option value="REJECTED">已驳回</Option>
            <Option value="COMPLETED">已完成</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/flight-plans/new')}>
            新建飞行计划
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={plans}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  )
}

export default FlightPlanList
