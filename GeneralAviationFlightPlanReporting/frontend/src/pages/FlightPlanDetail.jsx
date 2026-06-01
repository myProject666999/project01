import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Space, Timeline, message, Modal, DatePicker, Row, Col } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, CloudOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { flightPlanApi, approvalApi, weatherApi, pilotApi, aircraftApi } from '../api'

function FlightPlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [pilot, setPilot] = useState(null)
  const [aircraft, setAircraft] = useState(null)
  const [approvals, setApprovals] = useState([])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [closeModalVisible, setCloseModalVisible] = useState(false)
  const [actualDeparture, setActualDeparture] = useState(null)
  const [actualArrival, setActualArrival] = useState(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const planData = await flightPlanApi.getById(id)
      setPlan(planData)

      const [pilotData, aircraftData, approvalData] = await Promise.all([
        pilotApi.getById(planData.pilotId),
        aircraftApi.getById(planData.aircraftId),
        approvalApi.getByFlightPlan(id)
      ])
      setPilot(pilotData)
      setAircraft(aircraftData)
      setApprovals(approvalData)

      try {
        const weatherData = await weatherApi.getLatest(id)
        setWeather(weatherData)
      } catch (e) {
        console.log('暂无有效气象简报')
      }
    } catch (error) {
      message.error('加载数据失败')
    }
    setLoading(false)
  }

  const handleGenerateWeather = async () => {
    try {
      const data = await weatherApi.generate(id)
      setWeather(data)
      message.success('气象简报生成成功')
    } catch (error) {
      message.error('生成失败')
    }
  }

  const handleClosePlan = async () => {
    if (!actualDeparture || !actualArrival) {
      message.error('请填写实际起降时间')
      return
    }
    try {
      await flightPlanApi.close(
        id,
        actualDeparture.format('YYYY-MM-DD HH:mm:ss'),
        actualArrival.format('YYYY-MM-DD HH:mm:ss')
      )
      message.success('销号成功')
      setCloseModalVisible(false)
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || '销号失败')
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

  if (!plan) return null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/flight-plans')}>
            返回
          </Button>
          <h2 style={{ margin: 0 }}>飞行计划详情</h2>
        </Space>
        <Space>
          <Button icon={<CloudOutlined />} onClick={handleGenerateWeather}>
            生成气象简报
          </Button>
          {plan.status === 'APPROVED' && (
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setCloseModalVisible(true)}>
              飞行销号
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="基本信息" loading={loading} style={{ marginBottom: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="计划编号">
                {plan.planNumber || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(plan.status)}
              </Descriptions.Item>
              <Descriptions.Item label="飞行员">
                {pilot?.licenseNumber || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="飞机">
                {aircraft ? `${aircraft.registrationNumber} (${aircraft.aircraftType})` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="飞行类型">
                {plan.flightType}
              </Descriptions.Item>
              <Descriptions.Item label="载客人数">
                {plan.passengers || 0}
              </Descriptions.Item>
              <Descriptions.Item label="起飞机场">
                {plan.departureAirport}
              </Descriptions.Item>
              <Descriptions.Item label="降落机场">
                {plan.arrivalAirport}
              </Descriptions.Item>
              <Descriptions.Item label="计划起飞时间">
                {plan.departureTime}
              </Descriptions.Item>
              <Descriptions.Item label="计划降落时间">
                {plan.arrivalTime}
              </Descriptions.Item>
              {plan.actualDepartureTime && (
                <Descriptions.Item label="实际起飞时间">
                  {plan.actualDepartureTime}
                </Descriptions.Item>
              )}
              {plan.actualArrivalTime && (
                <Descriptions.Item label="实际降落时间">
                  {plan.actualArrivalTime}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="飞行高度">
                {plan.altitude ? `${plan.altitude}米` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="飞行速度">
                {plan.speed ? `${plan.speed}km/h` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="航线描述" span={2}>
                {plan.route || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="飞行目的" span={2}>
                {plan.purpose || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="审批流程" loading={loading}>
            <Timeline>
              {approvals.map((item, index) => (
                <Timeline.Item
                  key={item.id}
                  color={item.status === 'APPROVED' ? 'green' : item.status === 'REJECTED' ? 'red' : 'blue'}
                >
                  <p style={{ fontWeight: 'bold' }}>{item.nodeName}</p>
                  <p>状态: {
                    item.status === 'APPROVED' ? '已通过' :
                    item.status === 'REJECTED' ? '已驳回' : '待审批'
                  }</p>
                  {item.approverName && <p>审批人: {item.approverName}</p>}
                  {item.comment && <p>意见: {item.comment}</p>}
                  {item.processTime && <p>时间: {item.processTime}</p>}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="气象简报" loading={loading} extra={
            <Button size="small" onClick={handleGenerateWeather}>刷新</Button>
          }>
            {weather ? (
              <div>
                <p><strong>天气状况:</strong> {weather.weatherCondition}</p>
                <p><strong>能见度:</strong> {weather.visibility}米</p>
                <p><strong>风速:</strong> {weather.windSpeed}km/h</p>
                <p><strong>风向:</strong> {weather.windDirection}°</p>
                <p><strong>云底高度:</strong> {weather.cloudBase}米</p>
                <p><strong>温度:</strong> {weather.temperature}℃</p>
                <p><strong>有效时间:</strong></p>
                <p>{weather.validFrom} 至 {weather.validTo}</p>
                <hr />
                <p style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
                  {weather.briefingContent}
                </p>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>暂无气象简报</p>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="飞行销号"
        open={closeModalVisible}
        onOk={handleClosePlan}
        onCancel={() => setCloseModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="实际起飞时间"
            style={{ width: '100%' }}
            onChange={setActualDeparture}
          />
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="实际降落时间"
            style={{ width: '100%' }}
            onChange={setActualArrival}
          />
        </Space>
      </Modal>
    </div>
  )
}

export default FlightPlanDetail
