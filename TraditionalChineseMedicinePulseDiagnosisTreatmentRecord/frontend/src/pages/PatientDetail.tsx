import { Card, Button, Tag, Table, Tabs, Descriptions, Space, Divider, Empty, message } from 'antd'
import {
  PlusOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import type { Patient, Consultation, Prescription } from '@/types'
import { patientApi, consultationApi, prescriptionApi } from '@/api'
import { GENDER_OPTIONS } from '@/types'
import dayjs from 'dayjs'
import { useAppStore } from '@/store'

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(false)
  const { setCurrentPatient } = useAppStore()

  useEffect(() => {
    if (id) {
      loadData(parseInt(id))
    }
    return () => {
      setCurrentPatient(null)
    }
  }, [id])

  const loadData = async (patientId: number) => {
    setLoading(true)
    try {
      const [p, c, pr] = await Promise.all([
        patientApi.getById(patientId),
        consultationApi.getByPatientId(patientId),
        prescriptionApi.getByPatientId(patientId)
      ])
      setPatient(p)
      setCurrentPatient(p)
      setConsultations(c)
      setPrescriptions(pr)
    } catch (error) {
      console.error('加载数据失败', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConsultation = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后将无法恢复，是否继续？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await consultationApi.delete(id)
          message.success('删除成功')
          if (patient) {
            loadData(patient.id!)
          }
        } catch (error) {
          console.error('删除失败', error)
        }
      }
    })
  }

  const handleDeletePrescription = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后将无法恢复，是否继续？',
      onOk: async () => {
        try {
          await prescriptionApi.delete(id)
          message.success('删除成功')
          if (patient) {
            loadData(patient.id!)
          }
        } catch (error) {
          console.error('删除失败', error)
        }
      }
    })
  }

  const consultationColumns = [
    { title: '就诊时间', dataIndex: 'visitDate', key: 'visitDate', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: '主诉', dataIndex: 'chiefComplaint', key: 'chiefComplaint', ellipsis: true },
    {
      title: '脉象',
      dataIndex: 'pulseTypes',
      key: 'pulseTypes',
      render: (v: string) => v ? v.split(',').map(p => <Tag key={p} color="brown">{p}</Tag>) : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Consultation) => (
        <Space>
          <Link to={`/prescriptions/new/${patient?.id}?consultationId=${record.id}`} className="text-tcm-green">
            开具处方
          </Link>
          <Link to={`/consultations/edit/${record.id}`} className="text-tcm-brown">
            编辑
          </Link>
          <a onClick={() => handleDeleteConsultation(record.id!)} className="text-tcm-red">
            删除
          </a>
        </Space>
      )
    }
  ]

  const prescriptionColumns = [
    { title: '开方时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
    { title: '诊断', dataIndex: 'diagnosis', key: 'diagnosis', ellipsis: true },
    { title: '剂数', dataIndex: 'totalDosage', key: 'totalDosage', render: (v: number) => `${v}剂` },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: Prescription) => (
        <Space>
          <Link to={`/prescriptions/new/from/${record.id}`} className="text-tcm-green">
            加味/减味
          </Link>
          <Link to={`/prescriptions/edit/${record.id}`} className="text-tcm-brown">
            编辑
          </Link>
          <a onClick={() => handleDeletePrescription(record.id!)} className="text-tcm-red">
            删除
          </a>
        </Space>
      )
    }
  ]

  const { Modal } = require('antd')

  if (!patient && !loading) {
    return <Empty description="患者不存在" />
  }

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <FileTextOutlined /> 诊疗记录 ({consultations.length})
        </span>
      ),
      children: (
        <div>
          <div className="mb-4 flex justify-end">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/consultations/new/${patient?.id}`)}
            >
              新增诊疗
            </Button>
          </div>
          <Table
            columns={consultationColumns}
            dataSource={consultations}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: '暂无诊疗记录' }}
          />
        </div>
      )
    },
    {
      key: '2',
      label: (
        <span>
          <MedicineBoxOutlined /> 处方记录 ({prescriptions.length})
        </span>
      ),
      children: (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              onClick={() => navigate(`/prescriptions/comparison/${patient?.id}`)}
              disabled={prescriptions.length < 2}
            >
              处方对比
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/prescriptions/new/${patient?.id}`)}
            >
              新开处方
            </Button>
          </div>
          <Table
            columns={prescriptionColumns}
            dataSource={prescriptions}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: '暂无处方记录' }}
            expandable={{
              expandedRowRender: (record: Prescription) => (
                <div className="pl-8">
                  <Divider orientation="left" className="my-2">处方明细</Divider>
                  <div className="grid grid-cols-4 gap-2">
                    {record.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-tcm-beige-dark rounded">
                        <span>{item.herbName}</span>
                        <span className="text-tcm-brown font-bold">{item.dosage}g</span>
                        {item.preparationMethod && (
                          <Tag color="gold">{item.preparationMethod}</Tag>
                        )}
                      </div>
                    ))}
                  </div>
                  {record.prescriptionUsage && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <span className="text-gray-500">用法：</span>
                      <span>{record.prescriptionUsage}</span>
                    </div>
                  )}
                </div>
              )
            }}
          />
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patients')}>
          返回列表
        </Button>
        <h2 className="text-2xl font-bold text-tcm-brown font-kai m-0">患者详情</h2>
      </div>

      <Card className="card-tcm" loading={loading}>
        {patient && (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-tcm-brown font-kai">{patient.name}</h3>
                <div className="flex gap-3 mt-2">
                  <Tag color="blue">{GENDER_OPTIONS.find(o => o.value === patient.gender)?.label}</Tag>
                  <Tag color="green">{patient.age}岁</Tag>
                  {patient.phone && <Tag color="gold">{patient.phone}</Tag>}
                </div>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate(`/consultations/new/${patient.id}`)}
                >
                  新增诊疗
                </Button>
                <Button
                  icon={<MedicineBoxOutlined />}
                  onClick={() => navigate(`/prescriptions/new/${patient.id}`)}
                >
                  开具处方
                </Button>
              </Space>
            </div>

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="身份证号">{patient.idCard || '-'}</Descriptions.Item>
              <Descriptions.Item label="地址">{patient.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{patient.remark || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {patient.createdAt ? dayjs(patient.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {patient.updatedAt ? dayjs(patient.updatedAt).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>

      <Card className="card-tcm">
        <Tabs items={tabItems} defaultActiveKey="1" />
      </Card>
    </div>
  )
}

export default PatientDetail
