import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getGreenBeans, createGreenBean, updateGreenBean, deleteGreenBean } from '../api'

const PROCESSING_OPTIONS = [
  { value: '水洗', label: '水洗 (Washed)' },
  { value: '日晒', label: '日晒 (Natural)' },
  { value: '蜜处理', label: '蜜处理 (Honey)' },
  { value: '半水洗', label: '半水洗 (Semi-washed)' },
  { value: '湿刨法', label: '湿刨法 (Wet-hulled)' },
  { value: '厌氧发酵', label: '厌氧发酵 (Anaerobic)' },
]

export default function GreenBeans() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getGreenBeans()
      setData(res.data)
    } catch {
      message.error('获取生豆数据失败')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteGreenBean(id)
      message.success('删除成功')
      fetchData()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await updateGreenBean(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await createGreenBean(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: '产地', dataIndex: 'origin', width: 120 },
    { title: '处理法', dataIndex: 'processing_method', width: 120 },
    { title: '批次号', dataIndex: 'batch_number', width: 120 },
    { title: '含水率(%)', dataIndex: 'moisture_rate', width: 100 },
    { title: '目数', dataIndex: 'screen_size', width: 80 },
    { title: '密度', dataIndex: 'density', width: 80 },
    { title: '重量(kg)', dataIndex: 'weight', width: 100 },
    { title: '备注', dataIndex: 'notes', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
    <Card title="生豆管理" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加生豆</Button>
    }>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1000 }}
      />
      <Modal
        title={editingRecord ? '编辑生豆' : '添加生豆'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="origin" label="产地" rules={[{ required: true, message: '请输入产地' }]}>
            <Input placeholder="如：埃塞俄比亚·耶加雪菲" />
          </Form.Item>
          <Form.Item name="processing_method" label="处理法" rules={[{ required: true, message: '请选择处理法' }]}>
            <Select options={PROCESSING_OPTIONS} placeholder="选择处理法" />
          </Form.Item>
          <Form.Item name="batch_number" label="批次号">
            <Input placeholder="输入批次号" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="moisture_rate" label="含水率(%)">
              <InputNumber min={0} max={30} step={0.1} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="screen_size" label="目数">
              <Input placeholder="如：14-16" style={{ width: 150 }} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="density" label="密度(g/L)">
              <InputNumber min={0} step={1} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="weight" label="重量(kg)">
              <InputNumber min={0} step={0.1} style={{ width: 150 }} />
            </Form.Item>
          </Space>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="补充描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
