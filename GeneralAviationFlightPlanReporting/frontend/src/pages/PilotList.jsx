import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, DatePicker, InputNumber, message, Tag, Select } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { pilotApi, userApi } from '../api'

const { Option } = Select

function PilotList() {
  const [pilots, setPilots] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll()
      setUsers(data)
    } catch (error) {
      console.error('加载用户数据失败', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await pilotApi.getAll()
      setPilots(data)
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
    form.setFieldsValue({
      ...record,
      issueDate: record.issueDate ? dayjs(record.issueDate) : null,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
      medicalExpiryDate: record.medicalExpiryDate ? dayjs(record.medicalExpiryDate) : null,
      status: String(record.status)
    })
    setModalVisible(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        userId: values.userId,
        licenseNumber: values.licenseNumber,
        licenseType: values.licenseType,
        issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : null,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null,
        totalFlightHours: values.totalFlightHours || 0,
        medicalCertificate: values.medicalCertificate || null,
        medicalExpiryDate: values.medicalExpiryDate ? values.medicalExpiryDate.format('YYYY-MM-DD') : null,
        status: parseInt(values.status, 10)
      }

      if (editingId) {
        await pilotApi.update(editingId, data)
        message.success('更新成功')
      } else {
        await pilotApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || error.response?.data?.message || '操作失败')
    }
  }

  const columns = [
    { title: '执照号', dataIndex: 'licenseNumber', key: 'licenseNumber', width: 150 },
    { title: '执照类型', dataIndex: 'licenseType', key: 'licenseType', width: 100 },
    { title: '签发日期', dataIndex: 'issueDate', key: 'issueDate', width: 120 },
    { title: '有效期至', dataIndex: 'expiryDate', key: 'expiryDate', width: 120 },
    { title: '总飞行小时', dataIndex: 'totalFlightHours', key: 'totalFlightHours', width: 120 },
    { title: '体检证号', dataIndex: 'medicalCertificate', key: 'medicalCertificate', width: 150 },
    { title: '体检有效期', dataIndex: 'medicalExpiryDate', key: 'medicalExpiryDate', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (val) => (
        <Tag color={val === 1 ? 'green' : 'red'}>
          {val === 1 ? '有效' : '无效'}
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
        <h2 style={{ margin: 0 }}>飞行员管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增飞行员
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={pilots}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingId ? '编辑飞行员' : '新增飞行员'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="userId"
            label="关联用户"
            rules={[{ required: true, message: '请选择关联用户' }]}
          >
            <Select placeholder="请选择关联用户">
              {users.map(u => (
                <Option key={u.id} value={u.id}>
                  {u.realName} ({u.username} - {u.role})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="licenseNumber"
            label="执照号"
            rules={[{ required: true, message: '请输入执照号' }]}
          >
            <Input placeholder="请输入执照号" />
          </Form.Item>
          <Form.Item
            name="licenseType"
            label="执照类型"
            rules={[{ required: true, message: '请选择执照类型' }]}
          >
            <Select>
              <Option value="PPL">私用驾驶员执照(PPL)</Option>
              <Option value="CPL">商用驾驶员执照(CPL)</Option>
              <Option value="ATPL">航线运输驾驶员执照(ATPL)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="issueDate" label="签发日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expiryDate" label="有效期至">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="totalFlightHours" label="总飞行小时">
            <InputNumber style={{ width: '100%' }} step="0.1" placeholder="请输入总飞行小时" />
          </Form.Item>
          <Form.Item name="medicalCertificate" label="体检证号">
            <Input placeholder="请输入体检证号" />
          </Form.Item>
          <Form.Item name="medicalExpiryDate" label="体检有效期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="1">
            <Select>
              <Option value="1">有效</Option>
              <Option value="0">无效</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PilotList
