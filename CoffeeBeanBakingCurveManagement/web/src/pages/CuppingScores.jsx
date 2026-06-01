import { useState, useEffect, useMemo } from 'react'
import { Card, Table, Button, Space, Modal, Form, InputNumber, Input, DatePicker, message, Popconfirm, Tag, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { getCuppingScores, createCuppingScore, updateCuppingScore, deleteCuppingScore, getRoastingRecords } from '../api'

const SCA_ITEMS = [
  { key: 'dry_aroma', label: '干香', max: 10 },
  { key: 'wet_aroma', label: '湿香', max: 10 },
  { key: 'flavor', label: '风味', max: 10 },
  { key: 'aftertaste', label: '余韵', max: 10 },
  { key: 'acidity', label: '酸质', max: 10 },
  { key: 'body', label: '醇厚度', max: 10 },
  { key: 'uniformity', label: '一致性', max: 10 },
  { key: 'balance', label: '平衡感', max: 10 },
  { key: 'cleanness', label: '干净度', max: 10 },
  { key: 'sweetness', label: '甜感', max: 10 },
  { key: 'overall', label: '整体', max: 10 },
]

export default function CuppingScores() {
  const [data, setData] = useState([])
  const [roastingRecords, setRoastingRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getCuppingScores()
      setData(res.data)
    } catch {
      message.error('获取杯测评分失败')
    }
    setLoading(false)
  }

  const fetchRoastingRecords = async () => {
    try {
      const res = await getRoastingRecords()
      setRoastingRecords(res.data)
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchData(); fetchRoastingRecords() }, [])

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({ cupping_date: dayjs() })
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      cupping_date: record.cupping_date ? dayjs(record.cupping_date) : undefined,
    })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteCuppingScore(id)
      message.success('删除成功')
      fetchData()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const scoreItems = SCA_ITEMS.map((i) => values[i.key] || 0)
      const total = scoreItems.reduce((a, b) => a + b, 0)
      const payload = {
        ...values,
        total_score: total,
        cupping_date: values.cupping_date ? values.cupping_date.format('YYYY-MM-DD') : undefined,
      }
      if (editingRecord) {
        await updateCuppingScore(editingRecord.id, payload)
        message.success('更新成功')
      } else {
        await createCuppingScore(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch {
      message.error('操作失败')
    }
  }

  const radarOption = useMemo(() => {
    if (!selectedRow) return {}
    return {
      title: {
        text: `杯测评分: ${selectedRow.total_score || 0}`,
        left: 'center',
        textStyle: { color: '#3E2723', fontSize: 16 },
      },
      tooltip: {},
      radar: {
        indicator: SCA_ITEMS.map((i) => ({ name: i.label, max: i.max })),
        shape: 'polygon',
        splitNumber: 5,
        axisName: { color: '#5D4037', fontSize: 12 },
      },
      series: [{
        type: 'radar',
        data: [{
          value: SCA_ITEMS.map((i) => selectedRow[i.key] || 0),
          name: 'SCA评分',
          areaStyle: { color: 'rgba(111, 78, 55, 0.25)' },
          lineStyle: { color: '#6F4E37', width: 2 },
          itemStyle: { color: '#6F4E37' },
        }],
      }],
    }
  }, [selectedRow])

  const columns = [
    {
      title: '烘焙记录',
      width: 160,
      render: (_, r) => {
        const rec = roastingRecords.find((rr) => rr.id === r.roasting_record_id)
        return rec ? `${rec.green_bean?.origin || ''} - ${rec.roasting_date}` : r.roasting_record_id
      },
    },
    { title: '杯测日期', dataIndex: 'cupping_date', width: 110 },
    { title: '静置(小时)', dataIndex: 'rest_hours', width: 100 },
    { title: '总分', dataIndex: 'total_score', width: 80, render: (v) => <Tag color="#6F4E37" style={{ color: '#fff' }}>{v}</Tag> },
    { title: '干香', dataIndex: 'dry_aroma', width: 60 },
    { title: '湿香', dataIndex: 'wet_aroma', width: 60 },
    { title: '风味', dataIndex: 'flavor', width: 60 },
    { title: '余韵', dataIndex: 'aftertaste', width: 60 },
    { title: '酸质', dataIndex: 'acidity', width: 60 },
    { title: '醇厚度', dataIndex: 'body', width: 70 },
    { title: '一致性', dataIndex: 'uniformity', width: 70 },
    { title: '平衡感', dataIndex: 'balance', width: 70 },
    { title: '干净度', dataIndex: 'cleanness', width: 70 },
    { title: '甜感', dataIndex: 'sweetness', width: 60 },
    { title: '整体', dataIndex: 'overall', width: 60 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card title="杯测评分" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加评分</Button>
      }>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1600 }}
          onRow={(record) => ({
            onClick: () => setSelectedRow(record),
            style: { cursor: 'pointer', background: selectedRow?.id === record.id ? '#FFF3E0' : undefined },
          })}
        />
      </Card>

      {selectedRow && (
        <Card title="SCA 雷达图">
          <ReactECharts option={radarOption} style={{ height: 400 }} />
        </Card>
      )}

      <Modal
        title={editingRecord ? '编辑杯测评分' : '添加杯测评分'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="roasting_record_id" label="烘焙记录" rules={[{ required: true, message: '请选择烘焙记录' }]}>
            <Select placeholder="选择烘焙记录">
              {roastingRecords.map((r) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.green_bean?.origin || ''} - {r.roasting_date} ({r.roast_level || '未定'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="cupping_date" label="杯测日期">
              <DatePicker style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="rest_hours" label="静置时间(小时)">
              <InputNumber min={0} style={{ width: 200 }} />
            </Form.Item>
          </Space>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
            {SCA_ITEMS.map((item) => (
              <Form.Item key={item.key} name={item.key} label={`${item.label} (0-${item.max})`}>
                <InputNumber min={0} max={item.max} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            ))}
          </div>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
