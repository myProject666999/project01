import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, message, Tag, Select } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { aircraftApi } from '../api'

const { Option } = Select

function AircraftList() {
  const [aircrafts, setAircrafts] = useState([])
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
      const data = await aircraftApi.getAll()
      setAircrafts(data)
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
        await aircraftApi.update(editingId, values)
        message.success('更新成功')
      } else {
        await aircraftApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: '注册号', dataIndex: 'registrationNumber', key: 'registrationNumber', width: 120 },
    { title: '机型', dataIndex: 'aircraftType', key: 'aircraftType', width: 120 },
    { title: '型号', dataIndex: 'aircraftModel', key: 'aircraftModel', width: 150 },
    { title: '制造商', dataIndex: 'manufacturer', key: 'manufacturer' },
    { title: '最大升限(米)', dataIndex: 'maxAltitude', key: 'maxAltitude', width: 120 },
    { title: '最大速度(km/h)', dataIndex: 'maxSpeed', key: 'maxSpeed', width: 130 },
    { title: '续航(分钟)', dataIndex: 'endurance', key: 'endurance', width: 120 },
    { title: '所有者', dataIndex: 'owner', key: 'owner' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (val) => (
        <Tag color={val === 1 ? 'green' : 'red'}>
          {val === 1 ? '可用' : '不可用'}
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
        <h2 style={{ margin: 0 }}>飞机管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增飞机
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={aircrafts}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingId ? '编辑飞机' : '新增飞机'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="registrationNumber"
            label="注册号"
            rules={[{ required: true, message: '请输入注册号' }]}
          >
            <Input placeholder="请输入注册号" />
          </Form.Item>
          <Form.Item
            name="aircraftType"
            label="机型"
            rules={[{ required: true, message: '请输入机型' }]}
          >
            <Input placeholder="请输入机型" />
          </Form.Item>
          <Form.Item name="aircraftModel" label="型号">
            <Input placeholder="请输入型号" />
          </Form.Item>
          <Form.Item name="manufacturer" label="制造商">
            <Input placeholder="请输入制造商" />
          </Form.Item>
          <Form.Item name="maxAltitude" label="最大升限(米)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入最大升限" />
          </Form.Item>
          <Form.Item name="maxSpeed" label="最大速度(km/h)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入最大速度" />
          </Form.Item>
          <Form.Item name="endurance" label="续航时间(分钟)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入续航时间" />
          </Form.Item>
          <Form.Item name="owner" label="所有者">
            <Input placeholder="请输入所有者" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Option value={1}>可用</Option>
              <Option value={0}>不可用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AircraftList
