import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Space, Tag, Spin, message, Modal, Form, InputNumber, Input, Select, DatePicker } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { getRoastingRecord, updateRoastingRecord, getGreenBeans } from '../api'

const ROAST_LEVEL_OPTIONS = [
  { value: '浅烘', label: '浅烘 (Light)' },
  { value: '中浅烘', label: '中浅烘 (Medium Light)' },
  { value: '中烘', label: '中烘 (Medium)' },
  { value: '中深烘', label: '中深烘 (Medium Dark)' },
  { value: '深烘', label: '深烘 (Dark)' },
]

const ROAST_LEVEL_COLOR = {
  '浅烘': '#FFE0B2',
  '中浅烘': '#FFCC80',
  '中烘': '#FFB74D',
  '中深烘': '#FF8A65',
  '深烘': '#6D4C41',
}

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function RoastingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [greenBeans, setGreenBeans] = useState([])
  const [form] = Form.useForm()

  const fetchRecord = async () => {
    setLoading(true)
    try {
      const res = await getRoastingRecord(id)
      setRecord(res.data)
    } catch {
      message.error('获取烘焙记录失败')
    }
    setLoading(false)
  }

  const fetchGreenBeans = async () => {
    try {
      const res = await getGreenBeans()
      setGreenBeans(res.data)
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchRecord() }, [id])
  useEffect(() => { fetchGreenBeans() }, [])

  const handleEdit = () => {
    if (!record) return
    form.setFieldsValue({
      ...record,
      roasting_date: record.roasting_date ? dayjs(record.roasting_date) : undefined,
    })
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        roasting_date: values.roasting_date ? values.roasting_date.format('YYYY-MM-DD') : undefined,
      }
      await updateRoastingRecord(id, payload)
      message.success('更新成功')
      setEditOpen(false)
      fetchRecord()
    } catch {
      message.error('更新失败')
    }
  }

  const chartOption = useMemo(() => {
    if (!record || !record.curve_points) return {}

    const beanTempPoints = record.curve_points
      .filter((p) => p.curve_type === 'bean_temp')
      .sort((a, b) => a.elapsed_seconds - b.elapsed_seconds)

    const airTempPoints = record.curve_points
      .filter((p) => p.curve_type === 'air_temp')
      .sort((a, b) => a.elapsed_seconds - b.elapsed_seconds)

    const markLines = []
    if (record.turning_yellow_time != null) {
      markLines.push({
        xAxis: record.turning_yellow_time,
        label: { formatter: '转黄点', fontSize: 12 },
        lineStyle: { color: '#DAA520', width: 2, type: 'dashed' },
      })
    }
    if (record.first_crack_start_time != null) {
      markLines.push({
        xAxis: record.first_crack_start_time,
        label: { formatter: '一爆开始', fontSize: 12 },
        lineStyle: { color: '#FF6347', width: 2, type: 'dashed' },
      })
    }
    if (record.first_crack_end_time != null) {
      markLines.push({
        xAxis: record.first_crack_end_time,
        label: { formatter: '一爆结束', fontSize: 12 },
        lineStyle: { color: '#CD5C5C', width: 2, type: 'dashed' },
      })
    }
    if (record.drop_time != null) {
      markLines.push({
        xAxis: record.drop_time,
        label: { formatter: '出锅', fontSize: 12 },
        lineStyle: { color: '#8B4513', width: 2, type: 'dashed' },
      })
    }

    return {
      title: {
        text: '烘焙曲线',
        left: 'center',
        textStyle: { color: '#3E2723', fontSize: 16 },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const sec = params[0].axisValue
          const m = Math.floor(sec / 60)
          const s = sec % 60
          let html = `<b>${m}:${s.toString().padStart(2, '0')}</b><br/>`
          params.forEach((p) => {
            html += `${p.marker} ${p.seriesName}: ${p.value[1]}°C<br/>`
          })
          return html
        },
      },
      legend: {
        data: ['豆温', '炉温'],
        top: 30,
        textStyle: { color: '#5D4037' },
      },
      grid: {
        left: 60,
        right: 40,
        top: 70,
        bottom: 50,
      },
      xAxis: {
        type: 'value',
        name: '时间(秒)',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          formatter: (v) => {
            const m = Math.floor(v / 60)
            const s = v % 60
            return `${m}:${s.toString().padStart(2, '0')}`
          },
        },
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
          data: beanTempPoints.map((p) => [p.elapsed_seconds, p.temperature]),
          smooth: true,
          lineStyle: { color: '#D2691E', width: 2.5 },
          itemStyle: { color: '#D2691E' },
          symbol: 'none',
          markLine: {
            data: markLines,
            symbol: 'none',
            animation: false,
          },
        },
        {
          name: '炉温',
          type: 'line',
          data: airTempPoints.map((p) => [p.elapsed_seconds, p.temperature]),
          smooth: true,
          lineStyle: { color: '#B8860B', width: 2, type: 'dashed' },
          itemStyle: { color: '#B8860B' },
          symbol: 'none',
        },
      ],
    }
  }, [record])

  const cuppingScore = record?.cupping_score

  const radarOption = useMemo(() => {
    if (!cuppingScore) return {}
    const items = [
      { name: '干香', key: 'dry_aroma' },
      { name: '湿香', key: 'wet_aroma' },
      { name: '风味', key: 'flavor' },
      { name: '余韵', key: 'aftertaste' },
      { name: '酸质', key: 'acidity' },
      { name: '醇厚度', key: 'body' },
      { name: '一致性', key: 'uniformity' },
      { name: '平衡感', key: 'balance' },
      { name: '干净度', key: 'cleanness' },
      { name: '甜感', key: 'sweetness' },
      { name: '整体', key: 'overall' },
    ]
    return {
      title: {
        text: `杯测评分: ${cuppingScore.total_score || 0}`,
        left: 'center',
        textStyle: { color: '#3E2723', fontSize: 16 },
      },
      tooltip: {},
      radar: {
        indicator: items.map((i) => ({ name: i.name, max: 10 })),
        shape: 'polygon',
        splitNumber: 5,
        axisName: { color: '#5D4037', fontSize: 12 },
      },
      series: [{
        type: 'radar',
        data: [{
          value: items.map((i) => cuppingScore[i.key] || 0),
          name: 'SCA评分',
          areaStyle: { color: 'rgba(111, 78, 55, 0.25)' },
          lineStyle: { color: '#6F4E37', width: 2 },
          itemStyle: { color: '#6F4E37' },
        }],
      }],
    }
  }, [cuppingScore])

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
  if (!record) return <div>记录不存在</div>

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/roasting-records')}>返回列表</Button>

      <Card
        title="烘焙详情"
        extra={<Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>}
      >
        <Descriptions bordered column={3} size="small">
          <Descriptions.Item label="生豆">{record.green_bean?.origin || '-'}</Descriptions.Item>
          <Descriptions.Item label="批次号">{record.green_bean?.batch_number || '-'}</Descriptions.Item>
          <Descriptions.Item label="处理法">{record.green_bean?.processing_method || '-'}</Descriptions.Item>
          <Descriptions.Item label="烘焙日期">{record.roasting_date || '-'}</Descriptions.Item>
          <Descriptions.Item label="烘焙度">
            <Tag color={ROAST_LEVEL_COLOR[record.roast_level]}>{record.roast_level || '-'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="入锅重量">{record.charge_weight ? `${record.charge_weight}g` : '-'}</Descriptions.Item>
          <Descriptions.Item label="出锅重量">{record.drop_weight ? `${record.drop_weight}g` : '-'}</Descriptions.Item>
          <Descriptions.Item label="失水率">
            {record.charge_weight && record.drop_weight
              ? `${((1 - record.drop_weight / record.charge_weight) * 100).toFixed(1)}%`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="豆温(起/终)">
            {record.bean_temp_start && record.bean_temp_end
              ? `${record.bean_temp_start}°C / ${record.bean_temp_end}°C`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="转黄点">{formatTime(record.turning_yellow_time)}</Descriptions.Item>
          <Descriptions.Item label="一爆开始">{formatTime(record.first_crack_start_time)}</Descriptions.Item>
          <Descriptions.Item label="一爆结束">{formatTime(record.first_crack_end_time)}</Descriptions.Item>
          <Descriptions.Item label="出锅时间">{formatTime(record.drop_time)}</Descriptions.Item>
          <Descriptions.Item label="发展时间">{formatTime(record.development_time)}</Descriptions.Item>
          <Descriptions.Item label="总时间">{formatTime(record.total_time)}</Descriptions.Item>
        </Descriptions>
        {record.notes && (
          <div style={{ marginTop: 12 }}>
            <b>备注：</b>{record.notes}
          </div>
        )}
      </Card>

      <Card title="烘焙曲线">
        <ReactECharts option={chartOption} style={{ height: 420 }} />
      </Card>

      {cuppingScore && (
        <Card title="杯测评分">
          <ReactECharts option={radarOption} style={{ height: 400 }} />
          <Descriptions bordered column={4} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="干香">{cuppingScore.dry_aroma}</Descriptions.Item>
            <Descriptions.Item label="湿香">{cuppingScore.wet_aroma}</Descriptions.Item>
            <Descriptions.Item label="风味">{cuppingScore.flavor}</Descriptions.Item>
            <Descriptions.Item label="余韵">{cuppingScore.aftertaste}</Descriptions.Item>
            <Descriptions.Item label="酸质">{cuppingScore.acidity}</Descriptions.Item>
            <Descriptions.Item label="醇厚度">{cuppingScore.body}</Descriptions.Item>
            <Descriptions.Item label="一致性">{cuppingScore.uniformity}</Descriptions.Item>
            <Descriptions.Item label="平衡感">{cuppingScore.balance}</Descriptions.Item>
            <Descriptions.Item label="干净度">{cuppingScore.cleanness}</Descriptions.Item>
            <Descriptions.Item label="甜感">{cuppingScore.sweetness}</Descriptions.Item>
            <Descriptions.Item label="整体">{cuppingScore.overall}</Descriptions.Item>
            <Descriptions.Item label="总分">
              <Tag color="#6F4E37" style={{ color: '#fff' }}>{cuppingScore.total_score}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Modal
        title="编辑烘焙记录"
        open={editOpen}
        onOk={handleUpdate}
        onCancel={() => setEditOpen(false)}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="green_bean_id" label="生豆" rules={[{ required: true }]}>
            <Select>
              {greenBeans.map((gb) => (
                <Select.Option key={gb.id} value={gb.id}>
                  {gb.origin} - {gb.processing_method} ({gb.batch_number || '无批次'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="roasting_date" label="烘焙日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="roast_level" label="烘焙度">
            <Select options={ROAST_LEVEL_OPTIONS} placeholder="选择烘焙度" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="bean_temp_start" label="入锅豆温(°C)">
              <InputNumber min={0} max={300} />
            </Form.Item>
            <Form.Item name="bean_temp_end" label="出锅豆温(°C)">
              <InputNumber min={0} max={300} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="air_temp_start" label="入锅炉温(°C)">
              <InputNumber min={0} max={400} />
            </Form.Item>
            <Form.Item name="air_temp_end" label="出锅炉温(°C)">
              <InputNumber min={0} max={400} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="turning_yellow_time" label="转黄点(秒)">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="first_crack_start_time" label="一爆开始(秒)">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="first_crack_end_time" label="一爆结束(秒)">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="drop_time" label="出锅(秒)">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="development_time" label="发展时间(秒)">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="total_time" label="总时间(秒)">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="charge_weight" label="入锅重量(g)">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="drop_weight" label="出锅重量(g)">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
