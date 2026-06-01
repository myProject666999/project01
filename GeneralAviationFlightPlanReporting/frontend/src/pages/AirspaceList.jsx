import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, message, Tag, Select } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { airspaceApi } from '../api'

const { Option } = Select

function AirspaceList() {
  const [airspaces, setAirspaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await airspaceApi.getAll()
      setAirspaces(data)
    } catch (error) {
      message.error('加载数据失败')
    }
    setLoading(false)
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        await airspaceApi.update(editingId, values)
        message.success('更新成功')
      } else {
        await airspaceApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: '空域代码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '空域名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80,
      render: (val) => <Tag>{val}类</Tag>
    },
    { title: '下限(米)', dataIndex: 'lowerLimit', key: 'lowerLimit', width: 100 },
    { title: '上限(米)', dataIndex: 'upperLimit', key: 'upperLimit', width: 100 },
    { title: '中心纬度', dataIndex: 'centerLat', key: 'centerLat', width: 120 },
    { title: '中心经度', dataIndex: 'centerLng', key: 'centerLng', width: 120 },
    { title: '半径(米)', dataIndex: 'radius', key: 'radius', width: 100 },
    { title: '审批层级', dataIndex: 'approvalLevel', key: 'approvalLevel', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (val) => (
        <Tag color={val === 1 ? 'green' : 'red'}>
          {val === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>空域管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增空域
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={airspaces}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingId ? '编辑空域' : '新增空域'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="空域代码"
            rules={[{ required: true, message: '请输入空域代码' }]}
          >
            <Input placeholder="请输入空域代码" />
          </Form.Item>
          <Form.Item
            name="name"
            label="空域名称"
            rules={[{ required: true, message: '请输入空域名称' }]}
          >
            <Input placeholder="请输入空域名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="空域类型"
            rules={[{ required: true, message: '请选择空域类型' }]}
          >
            <Select>
              <Option value="A">A类</Option>
              <Option value="B">B类</Option>
              <Option value="C">C类</Option>
              <Option value="D">D类</Option>
              <Option value="G">G类</Option>
            </Select>
          </Form.Item>
          <Form.Item name="lowerLimit" label="下限高度(米)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入下限高度" />
          </Form.Item>
          <Form.Item name="upperLimit" label="上限高度(米)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入上限高度" />
          </Form.Item>
          <Form.Item name="centerLat" label="中心纬度">
            <InputNumber style={{ width: '100%' }} step="0.000001" placeholder="请输入中心纬度" />
          </Form.Item>
          <Form.Item name="centerLng" label="中心经度">
            <InputNumber style={{ width: '100%' }} step="0.000001" placeholder="请输入中心经度" />
          </Form.Item>
          <Form.Item name="radius" label="半径(米)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入半径" />
          </Form.Item>
          <Form.Item name="approvalLevel" label="审批层级" initialValue={1}>
            <InputNumber min={1} max={5} style={{ width: '100%' }} placeholder="请输入审批层级" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AirspaceList
