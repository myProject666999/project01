import React, { useEffect, useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, message, Space } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { approvalApi, flightPlanApi } from '../api'

const { TextArea } = Input

function ApprovalList() {
  const [approvals, setApprovals] = useState([])
  const [plans, setPlans] = useState({})
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentApproval, setCurrentApproval] = useState(null)
  const [actionType, setActionType] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await approvalApi.getPending(2)
      setApprovals(data)

      const planIds = [...new Set(data.map(a => a.flightPlanId))]
      const planMap = {}
      for (const planId of planIds) {
        try {
          const plan = await flightPlanApi.getById(planId)
          planMap[planId] = plan
        } catch (e) {
          console.error(`加载计划${planId}失败`, e)
        }
      }
      setPlans(planMap)
    } catch (error) {
      message.error('加载数据失败')
    }
    setLoading(false)
  }

  const handleAction = (record, type) => {
    setCurrentApproval(record)
    setActionType(type)
    setModalVisible(true)
    form.resetFields()
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const requestData = {
        approverUserId: 2,
        approverName: '审批员张三',
        comment: values.comment
      }

      if (actionType === 'approve') {
        await approvalApi.approve(currentApproval.id, requestData)
        message.success('审批通过')
      } else {
        await approvalApi.reject(currentApproval.id, requestData)
        message.success('已驳回')
      }

      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: '节点名称', dataIndex: 'nodeName', key: 'nodeName', width: 150 },
    {
      title: '飞行计划',
      dataIndex: 'flightPlanId',
      key: 'flightPlanId',
      render: (id) => plans[id]?.planNumber || id,
      width: 180
    },
    {
      title: '起飞机场',
      dataIndex: 'flightPlanId',
      key: 'departure',
      render: (id) => plans[id]?.departureAirport || '-'
    },
    {
      title: '降落机场',
      dataIndex: 'flightPlanId',
      key: 'arrival',
      render: (id) => plans[id]?.arrivalAirport || '-'
    },
    {
      title: '起飞时间',
      dataIndex: 'flightPlanId',
      key: 'departureTime',
      render: (id) => plans[id]?.departureTime || '-',
      width: 180
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'PENDING' ? 'processing' : 'default'}>
          {status === 'PENDING' ? '待审批' : status}
        </Tag>
      ),
      width: 100
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleAction(record, 'approve')}
          >
            通过
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => handleAction(record, 'reject')}
          >
            驳回
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>待审批列表</h2>

      <Table
        columns={columns}
        dataSource={approvals}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={actionType === 'approve' ? '审批通过' : '审批驳回'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form}>
          <Form.Item
            name="comment"
            label="审批意见"
            rules={actionType === 'reject' ? [{ required: true, message: '请填写驳回理由' }] : []}
          >
            <TextArea rows={4} placeholder={actionType === 'reject' ? '请填写驳回理由' : '请填写审批意见（选填）'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ApprovalList
