import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Space, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { approvalConfigApi } from '../api'

const { Option } = Select

function ApprovalConfig() {
  const [configs, setConfigs] = useState([])
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
      const data = await approvalConfigApi.getAll()
      setConfigs(data)
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
      isRequired: String(record.isRequired)
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await approvalConfigApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        isRequired: parseInt(values.isRequired, 10)
      }
      if (editingId) {
        await approvalConfigApi.update(editingId, submitData)
        message.success('更新成功')
      } else {
        await approvalConfigApi.create(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const airspaceTypes = [
    { value: 'A', label: 'A类空域' },
    { value: 'B', label: 'B类空域' },
    { value: 'C', label: 'C类空域' },
    { value: 'D', label: 'D类空域' },
    { value: 'G', label: 'G类空域' }
  ]

  const columns = [
    { title: '空域类型', dataIndex: 'airspaceType', key: 'airspaceType', width: 120 },
    { title: '审批层级', dataIndex: 'level', key: 'level', width: 100 },
    { title: '节点名称', dataIndex: 'nodeName', key: 'nodeName', width: 150 },
    { title: '审批角色', dataIndex: 'approverRole', key: 'approverRole', width: 120 },
    { title: '审批顺序', dataIndex: 'sequence', key: 'sequence', width: 100 },
    { title: '是否必需', dataIndex: 'isRequired', key: 'isRequired', width: 100,
      render: (val) => val === 1 ? '是' : '否'
    },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>审批节点配置</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增配置
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={configs}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? '编辑审批节点' : '新增审批节点'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="airspaceType"
            label="空域类型"
            rules={[{ required: true, message: '请选择空域类型' }]}
          >
            <Select placeholder="请选择空域类型">
              {airspaceTypes.map(t => (
                <Option key={t.value} value={t.value}>{t.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="level"
            label="审批层级"
            rules={[{ required: true, message: '请输入审批层级' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入审批层级" />
          </Form.Item>
          <Form.Item
            name="nodeName"
            label="节点名称"
            rules={[{ required: true, message: '请输入节点名称' }]}
          >
            <Input placeholder="请输入节点名称" />
          </Form.Item>
          <Form.Item
            name="approverRole"
            label="审批角色"
            rules={[{ required: true, message: '请输入审批角色' }]}
          >
            <Input placeholder="请输入审批角色" />
          </Form.Item>
          <Form.Item
            name="sequence"
            label="审批顺序"
            rules={[{ required: true, message: '请输入审批顺序' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入审批顺序" />
          </Form.Item>
          <Form.Item
            name="isRequired"
            label="是否必需"
            initialValue="1"
          >
            <Select>
              <Option value="1">是</Option>
              <Option value="0">否</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ApprovalConfig
