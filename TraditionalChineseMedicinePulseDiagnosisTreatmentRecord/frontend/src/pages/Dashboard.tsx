import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  AlertOutlined
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import type { Patient, Consultation, Prescription } from '@/types'
import { patientApi, consultationApi, prescriptionApi } from '@/api'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [stats, setStats] = useState({
    patientCount: 0,
    consultationCount: 0,
    prescriptionCount: 0,
    herbCount: 271
  })
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([])
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [patients, consultations, prescriptions] = await Promise.all([
        patientApi.getPage({ pageNum: 1, pageSize: 100 }),
        consultationApi.getPage({ pageNum: 1, pageSize: 10 }),
        prescriptionApi.getPage({ pageNum: 1, pageSize: 10 })
      ])

      setStats({
        patientCount: patients.total,
        consultationCount: consultations.total,
        prescriptionCount: prescriptions.total,
        herbCount: 271
      })

      setRecentPatients(patients.records.slice(0, 5))
      setRecentConsultations(consultations.records.slice(0, 5))
      setRecentPrescriptions(prescriptions.records.slice(0, 5))
    } catch (error) {
      console.error('加载数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: '患者总数', value: stats.patientCount, icon: <TeamOutlined />, color: '#8B4513' },
    { title: '诊疗记录', value: stats.consultationCount, icon: <FileTextOutlined />, color: '#2E7D32' },
    { title: '处方总数', value: stats.prescriptionCount, icon: <MedicineBoxOutlined />, color: '#D4AF37' },
    { title: '草药种类', value: stats.herbCount, icon: <AlertOutlined />, color: '#C62828' }
  ]

  const patientColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '性别', dataIndex: 'gender', key: 'gender', render: (v: string) => v === 'MALE' ? '男' : '女' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Patient) => (
        <Link to={`/patients/${record.id}`} className="text-tcm-brown hover:underline">
          查看详情
        </Link>
      )
    }
  ]

  const consultationColumns = [
    { title: '患者', dataIndex: ['patient', 'name'], key: 'patientName' },
    { title: '主诉', dataIndex: 'chiefComplaint', key: 'chiefComplaint', ellipsis: true },
    { title: '就诊时间', dataIndex: 'visitDate', key: 'visitDate', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '脉象',
      dataIndex: 'pulseTypes',
      key: 'pulseTypes',
      render: (v: string) => v ? v.split(',').map(p => <Tag key={p} color="brown">{p}</Tag>) : '-'
    }
  ]

  const prescriptionColumns = [
    { title: '患者', dataIndex: ['patient', 'name'], key: 'patientName' },
    { title: '诊断', dataIndex: 'diagnosis', key: 'diagnosis', ellipsis: true },
    { title: '剂数', dataIndex: 'totalDosage', key: 'totalDosage', render: (v: number) => `${v}剂` },
    { title: '开方时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('YYYY-MM-DD') }
  ]

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-tcm-brown font-kai mb-2">欢迎使用中医脉案诊疗记录系统</h2>
        <p className="text-gray-500">以望闻问切四诊为纲，辨证施治为宗，传承中医精华</p>
      </div>

      <Row gutter={[16, 16]}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="card-tcm">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.icon}
                </div>
                <Statistic title={stat.title} value={stat.value} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="最近患者" className="card-tcm" extra={<Link to="/patients" className="text-tcm-brown">查看全部</Link>}>
            <Table
              columns={patientColumns}
              dataSource={recentPatients}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="最近诊疗" className="card-tcm">
            <Table
              columns={consultationColumns}
              dataSource={recentConsultations}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="最近处方" className="card-tcm">
            <Table
              columns={prescriptionColumns}
              dataSource={recentPrescriptions}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card title="中医四诊合参" className="card-tcm">
        <Row gutter={[16, 16]}>
          {[
            { name: '望诊', desc: '观面色、察舌象、辨神形', icon: '👁️' },
            { name: '闻诊', desc: '听声音、嗅气味、辨呼吸', icon: '👂' },
            { name: '问诊', desc: '问病情、询病史、察二便', icon: '💬' },
            { name: '切诊', desc: '诊脉象、按胸腹、辨虚实', icon: '🖐️' }
          ].map((item, index) => (
            <Col xs={12} md={6} key={index}>
              <div className="text-center p-6 bg-tcm-beige-dark rounded-lg">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-tcm-brown font-kai mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}

export default Dashboard
