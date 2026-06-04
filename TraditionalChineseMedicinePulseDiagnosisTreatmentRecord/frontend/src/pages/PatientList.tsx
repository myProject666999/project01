import { Button, Table, Input, Form, Modal, Space, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import type { Patient, PageResult } from '@/types'
import { patientApi } from '@/api'
import { useNavigate } from 'react-router-dom'
import { GENDER_OPTIONS } from '@/types'
import dayjs from 'dayjs'

const PatientList = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<PageResult<Patient> | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [patientForm] = Form.useForm()
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 10 })

  useEffect(() => {
    loadData()
  }, [pagination])

  const loadData = async () => {
    setLoading(true)
    try {
      const values = searchForm.getFieldsValue()
      const result = await patientApi.getPage({
        ...pagination,
        ...values
      })
      setData(result)
    } catch (error) {
      console.error('加载患者列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(p => ({ ...p, pageNum: 1 }))
    loadData()
  }

  const handleReset = () => {
    searchForm.resetFields()
    handleSearch()
  }

  const handleAdd = () => {
    setEditingPatient(null)
    patientForm.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Patient) => {
    setEditingPatient(record)
    patientForm.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后将无法恢复，是否继续？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await patientApi.delete(id)
          message.success('删除成功')
          loadData()
        } catch (error) {
          console.error('删除失败', error)
        }
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await patientForm.validateFields()
      if (editingPatient) {
        await patientApi.update(editingPatient.id!, values)
        message.success('更新成功')
      } else {
        await patientApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('保存失败', error)
    }
  }

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (v: string) => GENDER_OPTIONS.find(o => o.value === v)?.label || v
    },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Patient) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/patients/${record.id}`)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id!)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-tcm-brown font-kai">患者管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增患者
        </Button>
      </div>

      <Card className="card-tcm">
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="name" label="姓名">
            <Input placeholder="请输入姓名" prefix={<SearchOutlined />} />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" prefix={<SearchOutlined />} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="card-tcm">
        <Table
          columns={columns}
          dataSource={data?.records}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.pageNum,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ pageNum: page, pageSize })
          }}
        />
      </Card>

      <Modal
        title={editingPatient ? '编辑患者' : '新增患者'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={patientForm} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
              <select className="w-full h-10 border border-gray-300 rounded px-3">
                <option value="">请选择</option>
                {GENDER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Form.Item>
            <Form.Item name="age" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}>
              <Input type="number" placeholder="请输入年龄" />
            </Form.Item>
            <Form.Item name="phone" label="电话">
              <Input placeholder="请输入电话" />
            </Form.Item>
          </div>
          <Form.Item name="idCard" label="身份证号">
            <Input placeholder="请输入身份证号" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input.TextArea rows={2} placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PatientList
