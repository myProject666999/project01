import { useState, useEffect, useMemo } from 'react'
import { Card, Upload, Button, Space, Descriptions, Table, Form, Select, Input, InputNumber, DatePicker, message, Steps, Tag, Modal } from 'antd'
import { UploadOutlined, FileTextOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { importArtisan, getGreenBeans, createGreenBean, createRoastingRecord } from '../api'

const ROAST_LEVEL_OPTIONS = [
  { value: '浅烘', label: '浅烘 (Light)' },
  { value: '中浅烘', label: '中浅烘 (Medium Light)' },
  { value: '中烘', label: '中烘 (Medium)' },
  { value: '中深烘', label: '中深烘 (Medium Dark)' },
  { value: '深烘', label: '深烘 (Dark)' },
]

const PROCESSING_OPTIONS = [
  { value: '水洗', label: '水洗 (Washed)' },
  { value: '日晒', label: '日晒 (Natural)' },
  { value: '蜜处理', label: '蜜处理 (Honey)' },
  { value: '半水洗', label: '半水洗 (Semi-washed)' },
  { value: '湿刨法', label: '湿刨法 (Wet-hulled)' },
  { value: '厌氧发酵', label: '厌氧发酵 (Anaerobic)' },
]

function parseArtisanJSON(jsonData) {
  const result = {
    beanTempPoints: [],
    airTempPoints: [],
    metadata: {},
  }

  if (jsonData.beans && Array.isArray(jsonData.beans)) {
    jsonData.beans.forEach((entry) => {
      if (entry.time != null && entry.temp != null) {
        result.beanTempPoints.push({
          elapsed_seconds: Math.round(entry.time),
          temperature: parseFloat(entry.temp),
        })
      }
    })
  }

  if (jsonData.environment && Array.isArray(jsonData.environment)) {
    jsonData.environment.forEach((entry) => {
      if (entry.time != null && entry.temp != null) {
        result.airTempPoints.push({
          elapsed_seconds: Math.round(entry.time),
          temperature: parseFloat(entry.temp),
        })
      }
    })
  }

  if (jsonData.specialEvents && Array.isArray(jsonData.specialEvents)) {
    jsonData.specialEvents.forEach((event) => {
      const t = Math.round(event.time)
      const type = (event.type || '').toLowerCase()
      if (type.includes('yellow') || type.includes('turning')) {
        result.metadata.turning_yellow_time = t
      } else if (type.includes('first') && type.includes('crack') && type.includes('start')) {
        result.metadata.first_crack_start_time = t
      } else if (type.includes('first') && type.includes('crack') && type.includes('end')) {
        result.metadata.first_crack_end_time = t
      } else if (type.includes('drop') || type.includes('end')) {
        result.metadata.drop_time = t
      }
    })
  }

  if (jsonData.title) result.metadata.title = jsonData.title
  if (jsonData.roastDate) result.metadata.roasting_date = jsonData.roastDate
  if (jsonData.roastLevel) result.metadata.roast_level = jsonData.roastLevel
  if (jsonData.chargeWeight) result.metadata.charge_weight = jsonData.chargeWeight
  if (jsonData.dropWeight) result.metadata.drop_weight = jsonData.dropWeight

  return result
}

export default function ArtisanImport() {
  const [step, setStep] = useState(0)
  const [parsedData, setParsedData] = useState(null)
  const [rawJSON, setRawJSON] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [greenBeans, setGreenBeans] = useState([])
  const [form] = Form.useForm()
  const [newBeanOpen, setNewBeanOpen] = useState(false)
  const [beanForm] = Form.useForm()

  useEffect(() => {
    const fetchBeans = async () => {
      try {
        const res = await getGreenBeans()
        setGreenBeans(res.data)
      } catch { /* ignore */ }
    }
    fetchBeans()
  }, [])

  const handleFileUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        setRawJSON(json)
        const parsed = parseArtisanJSON(json)
        setParsedData(parsed)
        form.setFieldsValue({
          roast_level: parsed.metadata.roast_level,
          roasting_date: parsed.metadata.roasting_date ? dayjs(parsed.metadata.roasting_date) : dayjs(),
          charge_weight: parsed.metadata.charge_weight,
          drop_weight: parsed.metadata.drop_weight,
          turning_yellow_time: parsed.metadata.turning_yellow_time,
          first_crack_start_time: parsed.metadata.first_crack_start_time,
          first_crack_end_time: parsed.metadata.first_crack_end_time,
          drop_time: parsed.metadata.drop_time,
        })
        setStep(1)
        message.success('文件解析成功')
      } catch (err) {
        message.error(`解析失败: ${err.message}`)
      }
    }
    reader.readAsText(file)
    return false
  }

  const handleCreateBean = async () => {
    try {
      const values = await beanForm.validateFields()
      await createGreenBean(values)
      message.success('生豆创建成功')
      const res = await getGreenBeans()
      setGreenBeans(res.data)
      const newBean = res.data[res.data.length - 1]
      form.setFieldsValue({ green_bean_id: newBean.id })
      setNewBeanOpen(false)
      beanForm.resetFields()
    } catch {
      message.error('创建生豆失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const curve_points = []
      parsedData.beanTempPoints.forEach((p) => {
        curve_points.push({ curve_type: 'bean_temp', elapsed_seconds: p.elapsed_seconds, temperature: p.temperature })
      })
      parsedData.airTempPoints.forEach((p) => {
        curve_points.push({ curve_type: 'air_temp', elapsed_seconds: p.elapsed_seconds, temperature: p.temperature })
      })

      const payload = {
        ...values,
        roasting_date: values.roasting_date ? values.roasting_date.format('YYYY-MM-DD') : undefined,
        curve_points,
      }

      await createRoastingRecord(payload)
      message.success('烘焙记录导入成功！')
      setStep(2)
    } catch (err) {
      message.error(`导入失败: ${err.message}`)
    }
    setSubmitting(false)
  }

  const previewChartOption = useMemo(() => {
    if (!parsedData) return {}
    const markLines = []
    if (parsedData.metadata.turning_yellow_time != null) {
      markLines.push({
        xAxis: parsedData.metadata.turning_yellow_time,
        label: { formatter: '转黄点' },
        lineStyle: { color: '#DAA520', width: 2, type: 'dashed' },
      })
    }
    if (parsedData.metadata.first_crack_start_time != null) {
      markLines.push({
        xAxis: parsedData.metadata.first_crack_start_time,
        label: { formatter: '一爆开始' },
        lineStyle: { color: '#FF6347', width: 2, type: 'dashed' },
      })
    }
    if (parsedData.metadata.first_crack_end_time != null) {
      markLines.push({
        xAxis: parsedData.metadata.first_crack_end_time,
        label: { formatter: '一爆结束' },
        lineStyle: { color: '#CD5C5C', width: 2, type: 'dashed' },
      })
    }
    if (parsedData.metadata.drop_time != null) {
      markLines.push({
        xAxis: parsedData.metadata.drop_time,
        label: { formatter: '出锅' },
        lineStyle: { color: '#8B4513', width: 2, type: 'dashed' },
      })
    }

    return {
      title: {
        text: 'Artisan 曲线预览',
        left: 'center',
        textStyle: { color: '#3E2723', fontSize: 16 },
      },
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['豆温', '炉温'],
        top: 30,
        textStyle: { color: '#5D4037' },
      },
      grid: { left: 60, right: 40, top: 70, bottom: 50 },
      xAxis: {
        type: 'value',
        name: '时间(秒)',
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: {
        type: 'value',
        name: '温度(°C)',
        min: (value) => Math.floor(value.min / 10) * 10,
      },
      series: [
        {
          name: '豆温',
          type: 'line',
          data: parsedData.beanTempPoints.map((p) => [p.elapsed_seconds, p.temperature]),
          smooth: true,
          lineStyle: { color: '#D2691E', width: 2.5 },
          itemStyle: { color: '#D2691E' },
          symbol: 'none',
          markLine: { data: markLines, symbol: 'none', animation: false },
        },
        {
          name: '炉温',
          type: 'line',
          data: parsedData.airTempPoints.map((p) => [p.elapsed_seconds, p.temperature]),
          smooth: true,
          lineStyle: { color: '#B8860B', width: 2, type: 'dashed' },
          itemStyle: { color: '#B8860B' },
          symbol: 'none',
        },
      ],
    }
  }, [parsedData])

  const curveColumns = [
    { title: '曲线类型', dataIndex: 'curve_type', width: 100, render: (v) => v === 'bean_temp' ? '豆温' : '炉温' },
    { title: '时间(秒)', dataIndex: 'elapsed_seconds', width: 100 },
    { title: '温度(°C)', dataIndex: 'temperature', width: 100 },
  ]

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card title="Artisan 数据导入">
        <Steps
          current={step}
          items={[
            { title: '上传文件', icon: <FileTextOutlined /> },
            { title: '预览确认', icon: <CheckCircleOutlined /> },
            { title: '导入完成', icon: <SendOutlined /> },
          ]}
          style={{ marginBottom: 24 }}
        />

        {step === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Upload
              accept=".json"
              showUploadList={false}
              beforeUpload={handleFileUpload}
            >
              <Button type="primary" size="large" icon={<UploadOutlined />}>
                选择 Artisan JSON 文件
              </Button>
            </Upload>
            <p style={{ marginTop: 16, color: '#999' }}>支持 Artisan 导出的 JSON 格式文件</p>
          </div>
        )}

        {step === 1 && parsedData && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card size="small" title="曲线预览">
              <ReactECharts option={previewChartOption} style={{ height: 350 }} />
            </Card>

            <Card size="small" title="解析信息">
              <Descriptions bordered column={3} size="small">
                <Descriptions.Item label="豆温数据点">{parsedData.beanTempPoints.length}</Descriptions.Item>
                <Descriptions.Item label="炉温数据点">{parsedData.airTempPoints.length}</Descriptions.Item>
                <Descriptions.Item label="标题">{parsedData.metadata.title || '-'}</Descriptions.Item>
                {parsedData.metadata.turning_yellow_time != null && (
                  <Descriptions.Item label="转黄点">{parsedData.metadata.turning_yellow_time}s</Descriptions.Item>
                )}
                {parsedData.metadata.first_crack_start_time != null && (
                  <Descriptions.Item label="一爆开始">{parsedData.metadata.first_crack_start_time}s</Descriptions.Item>
                )}
                {parsedData.metadata.first_crack_end_time != null && (
                  <Descriptions.Item label="一爆结束">{parsedData.metadata.first_crack_end_time}s</Descriptions.Item>
                )}
                {parsedData.metadata.drop_time != null && (
                  <Descriptions.Item label="出锅时间">{parsedData.metadata.drop_time}s</Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card size="small" title="填写烘焙记录信息">
              <Form form={form} layout="vertical">
                <Form.Item name="green_bean_id" label="关联生豆" rules={[{ required: true, message: '请选择或创建生豆' }]}>
                  <Space.Compact style={{ width: '100%' }}>
                    <Select
                      style={{ width: 'calc(100% - 100px)' }}
                      placeholder="选择生豆"
                    >
                      {greenBeans.map((gb) => (
                        <Select.Option key={gb.id} value={gb.id}>
                          {gb.origin} - {gb.processing_method} ({gb.batch_number || '无批次'})
                        </Select.Option>
                      ))}
                    </Select>
                    <Button onClick={() => setNewBeanOpen(true)}>新建生豆</Button>
                  </Space.Compact>
                </Form.Item>
                <Space style={{ width: '100%' }} size="large">
                  <Form.Item name="roasting_date" label="烘焙日期">
                    <DatePicker style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item name="roast_level" label="烘焙度">
                    <Select options={ROAST_LEVEL_OPTIONS} placeholder="选择烘焙度" style={{ width: 200 }} />
                  </Form.Item>
                </Space>
                <Space style={{ width: '100%' }} size="large">
                  <Form.Item name="charge_weight" label="入锅重量(g)">
                    <InputNumber min={0} style={{ width: 150 }} />
                  </Form.Item>
                  <Form.Item name="drop_weight" label="出锅重量(g)">
                    <InputNumber min={0} style={{ width: 150 }} />
                  </Form.Item>
                </Space>
                <Space style={{ width: '100%' }} size="large">
                  <Form.Item name="bean_temp_start" label="入锅豆温(°C)">
                    <InputNumber min={0} max={300} style={{ width: 150 }} />
                  </Form.Item>
                  <Form.Item name="bean_temp_end" label="出锅豆温(°C)">
                    <InputNumber min={0} max={300} style={{ width: 150 }} />
                  </Form.Item>
                </Space>
                <Space style={{ width: '100%' }} size="large">
                  <Form.Item name="turning_yellow_time" label="转黄点(秒)">
                    <InputNumber min={0} style={{ width: 150 }} />
                  </Form.Item>
                  <Form.Item name="first_crack_start_time" label="一爆开始(秒)">
                    <InputNumber min={0} style={{ width: 150 }} />
                  </Form.Item>
                </Space>
                <Space style={{ width: '100%' }} size="large">
                  <Form.Item name="first_crack_end_time" label="一爆结束(秒)">
                    <InputNumber min={0} style={{ width: 150 }} />
                  </Form.Item>
                  <Form.Item name="drop_time" label="出锅(秒)">
                    <InputNumber min={0} style={{ width: 150 }} />
                  </Form.Item>
                </Space>
                <Space style={{ width: '100%' }} size="large">
                  <Form.Item name="development_time" label="发展时间(秒)">
                    <InputNumber min={0} style={{ width: 150 }} />
                  </Form.Item>
                  <Form.Item name="total_time" label="总时间(秒)">
                    <InputNumber min={0} style={{ width: 150 }} />
                  </Form.Item>
                </Space>
                <Form.Item name="notes" label="备注">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Form>
            </Card>

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button onClick={() => { setStep(0); setParsedData(null); }}>重新上传</Button>
                <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={submitting}>
                  确认导入
                </Button>
              </Space>
            </div>
          </Space>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#6F4E37', marginBottom: 16 }} />
            <h2>导入成功！</h2>
            <p style={{ color: '#999', marginBottom: 24 }}>烘焙记录及曲线数据已成功创建</p>
            <Space>
              <Button type="primary" onClick={() => { setStep(0); setParsedData(null); }}>
                继续导入
              </Button>
            </Space>
          </div>
        )}
      </Card>

      <Modal
        title="新建生豆"
        open={newBeanOpen}
        onOk={handleCreateBean}
        onCancel={() => setNewBeanOpen(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={beanForm} layout="vertical">
          <Form.Item name="origin" label="产地" rules={[{ required: true, message: '请输入产地' }]}>
            <Input placeholder="如：埃塞俄比亚·耶加雪菲" />
          </Form.Item>
          <Form.Item name="processing_method" label="处理法" rules={[{ required: true, message: '请选择处理法' }]}>
            <Select options={PROCESSING_OPTIONS} placeholder="选择处理法" />
          </Form.Item>
          <Form.Item name="batch_number" label="批次号">
            <Input placeholder="输入批次号" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
