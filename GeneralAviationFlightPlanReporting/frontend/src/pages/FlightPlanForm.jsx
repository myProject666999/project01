import React, { useEffect, useState } from 'react'
import { Form, Input, Select, DatePicker, InputNumber, Button, message, Card, Row, Col } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { flightPlanApi, pilotApi, aircraftApi, airspaceApi } from '../api'

const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

function FlightPlanForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [pilots, setPilots] = useState([])
  const [aircrafts, setAircrafts] = useState([])
  const [airspaces, setAirspaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPilots()
    loadAircrafts()
    loadAirspaces()
    if (id) {
      loadFlightPlan(id)
    }
  }, [id])

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
      setAircrafts(data.filter(a => a.status === 1))
    } catch (error) {
      console.error('加载飞机数据失败', error)
    }
  }

  const loadAirspaces = async () => {
    try {
      const data = await airspaceApi.getAll()
      setAirspaces(data.filter(a => a.status === 1))
    } catch (error) {
      console.error('加载空域数据失败', error)
    }
  }

  const loadFlightPlan = async (planId) => {
    setLoading(true)
    try {
      const data = await flightPlanApi.getById(planId)
      form.setFieldsValue({
        ...data,
        timeRange: [dayjs(data.departureTime), dayjs(data.arrivalTime)],
        airspaceIds: data.airspaceIds ? data.airspaceIds.split(',').map(Number) : []
      })
    } catch (error) {
      message.error('加载数据失败')
    }
    setLoading(false)
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const planData = {
        ...values,
        departureTime: values.timeRange[0].format('YYYY-MM-DD HH:mm:ss'),
        arrivalTime: values.timeRange[1].format('YYYY-MM-DD HH:mm:ss'),
        airspaceIds: values.airspaceIds.join(',')
      }
      delete planData.timeRange

      if (id) {
        await flightPlanApi.update(id, planData)
        message.success('更新成功')
      } else {
        await flightPlanApi.create(planData)
        message.success('创建成功')
      }
      navigate('/flight-plans')
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败')
    }
    setSubmitting(false)
  }

  const flightTypes = [
    { value: '私人飞行', label: '私人飞行' },
    { value: '农林作业', label: '农林作业' },
    { value: '训练飞行', label: '训练飞行' },
    { value: '空中游览', label: '空中游览' },
    { value: '航拍测绘', label: '航拍测绘' },
    { value: '其他', label: '其他' }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{id ? '编辑飞行计划' : '新建飞行计划'}</h2>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ passengers: 0 }}
          loading={loading}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pilotId"
                label="飞行员"
                rules={[{ required: true, message: '请选择飞行员' }]}
              >
                <Select placeholder="请选择飞行员">
                  {pilots.map(p => (
                    <Option key={p.id} value={p.id}>
                      {p.licenseNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="aircraftId"
                label="飞机"
                rules={[{ required: true, message: '请选择飞机' }]}
              >
                <Select placeholder="请选择飞机">
                  {aircrafts.map(a => (
                    <Option key={a.id} value={a.id}>
                      {a.registrationNumber} - {a.aircraftType}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="flightType"
                label="飞行类型"
                rules={[{ required: true, message: '请选择飞行类型' }]}
              >
                <Select placeholder="请选择飞行类型">
                  {flightTypes.map(t => (
                    <Option key={t.value} value={t.value}>
                      {t.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="passengers"
                label="载客人数"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departureAirport"
                label="起飞机场"
                rules={[{ required: true, message: '请输入起飞机场' }]}
              >
                <Input placeholder="请输入起飞机场" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="arrivalAirport"
                label="降落机场"
                rules={[{ required: true, message: '请输入降落机场' }]}
              >
                <Input placeholder="请输入降落机场" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="timeRange"
            label="飞行时段"
            rules={[{ required: true, message: '请选择飞行时段' }]}
          >
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="airspaceIds"
            label="涉及空域"
            rules={[{ required: true, message: '请选择涉及空域' }]}
          >
            <Select mode="multiple" placeholder="请选择涉及空域">
              {airspaces.map(a => (
                <Option key={a.id} value={a.id}>
                  {a.code} - {a.name} ({a.type}类)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="altitude" label="飞行高度(米)">
                <InputNumber style={{ width: '100%' }} placeholder="请输入飞行高度" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="speed" label="飞行速度(km/h)">
                <InputNumber style={{ width: '100%' }} placeholder="请输入飞行速度" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="route" label="航线描述">
            <TextArea rows={3} placeholder="请描述航线" />
          </Form.Item>

          <Form.Item name="purpose" label="飞行目的">
            <TextArea rows={3} placeholder="请描述飞行目的" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="emergencyContact" label="紧急联系人">
                <Input placeholder="请输入紧急联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="emergencyPhone" label="紧急联系电话">
                <Input placeholder="请输入紧急联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
              保存
            </Button>
            <Button onClick={() => navigate('/flight-plans')}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default FlightPlanForm
