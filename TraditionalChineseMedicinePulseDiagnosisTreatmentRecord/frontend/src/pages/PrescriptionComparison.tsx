import { Card, Button, Table, Tag, Empty, Row, Col, Select, Space, Divider, Alert } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons'
import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import type { Prescription, Patient } from '@/types'
import { prescriptionApi, patientApi } from '@/api'
import dayjs from 'dayjs'
import { useAppStore } from '@/store'

const { Option } = Select

const PrescriptionComparison = () => {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patient, setPatient] = useState<Patient | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const { currentPatient } = useAppStore()

  useEffect(() => {
    if (patientId) {
      loadData(parseInt(patientId))
    }
  }, [patientId])

  const loadData = async (pid: number) => {
    setLoading(true)
    try {
      const [p, pres] = await Promise.all([
        currentPatient?.id === pid ? currentPatient : patientApi.getById(pid),
        prescriptionApi.getForComparison(pid)
      ])
      setPatient(p)
      setPrescriptions(pres)
      if (pres.length >= 2) {
        setSelectedIds(pres.slice(0, 4).map(pr => pr.id!))
      }
    } catch (error) {
      console.error('加载数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedPrescriptions = useMemo(() => {
    return prescriptions.filter(p => selectedIds.includes(p.id!))
  }, [prescriptions, selectedIds])

  const allHerbs = useMemo(() => {
    const herbSet = new Set<string>()
    selectedPrescriptions.forEach(p => {
      p.items?.forEach(item => {
        herbSet.add(item.herbName)
      })
    })
    return Array.from(herbSet).sort()
  }, [selectedPrescriptions])

  const getHerbDosage = (prescription: Prescription, herbName: string) => {
    const item = prescription.items?.find(i => i.herbName === herbName)
    return item ? item.dosage : null
  }

  const getHerbMethod = (prescription: Prescription, herbName: string) => {
    const item = prescription.items?.find(i => i.herbName === herbName)
    return item?.preparationMethod
  }

  const getChangeType = (dosages: (number | null)[]) => {
    const validDosages = dosages.filter(d => d !== null) as number[]
    if (validDosages.length < 2) return 'new'
    
    const first = validDosages[0]
    const last = validDosages[validDosages.length - 1]
    
    if (dosages.filter(d => d === null).length > 0) {
      if (dosages[0] === null) return 'added'
      if (dosages[dosages.length - 1] === null) return 'removed'
    }
    
    if (last > first) return 'increased'
    if (last < first) return 'decreased'
    return 'unchanged'
  }

  const getRowStyle = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return { backgroundColor: '#E8F5E9' }
      case 'removed':
        return { backgroundColor: '#FFEBEE' }
      case 'increased':
        return { backgroundColor: '#FFF3E0' }
      case 'decreased':
        return { backgroundColor: '#E3F2FD' }
      default:
        return {}
    }
  }

  const columns = [
    {
      title: '药材',
      dataIndex: 'herbName',
      key: 'herbName',
      width: 120,
      fixed: 'left' as const,
      render: (text: string, record: any) => {
        const colorMap: Record<string, string> = {
          added: 'green',
          removed: 'red',
          increased: 'orange',
          decreased: 'blue',
          unchanged: 'default',
          new: 'default'
        }
        return (
          <Space>
            <Tag color={colorMap[record.changeType]}>
              {record.changeType === 'added' && '↑新增'}
              {record.changeType === 'removed' && '↓移除'}
              {record.changeType === 'increased' && '↗加量'}
              {record.changeType === 'decreased' && '↘减量'}
              {record.changeType === 'unchanged' && '→'}
              {record.changeType === 'new' && '•'}
            </Tag>
            <span className="font-bold text-tcm-brown">{text}</span>
          </Space>
        )
      }
    },
    ...selectedPrescriptions.map(pres => ({
      title: (
        <div className="text-center">
          <div className="font-bold">{dayjs(pres.createdAt).format('YYYY-MM-DD')}</div>
          <div className="text-xs text-gray-500">{pres.diagnosis || '无诊断'}</div>
          <div className="text-xs text-tcm-brown">{pres.items?.length}味药 / {pres.totalDosage}剂</div>
        </div>
      ),
      key: pres.id,
      width: 150,
      render: (_: any, record: any) => {
        const dosage = getHerbDosage(pres, record.herbName)
        const method = getHerbMethod(pres, record.herbName)
        if (dosage === null) {
          return <span className="text-gray-300">-</span>
        }
        return (
          <div className="text-center">
            <div className="text-lg font-bold text-tcm-brown">{dosage}g</div>
            {method && method !== '常规煎服' && (
              <Tag color="gold" className="mt-1">{method}</Tag>
            )}
          </div>
        )
      }
    }))
  ]

  const tableData = useMemo(() => {
    return allHerbs.map(herbName => {
      const dosages = selectedPrescriptions.map(p => getHerbDosage(p, herbName))
      const changeType = getChangeType(dosages)
      return {
        key: herbName,
        herbName,
        changeType
      }
    })
  }, [allHerbs, selectedPrescriptions])

  if (prescriptions.length < 2 && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/patients/${patientId}`)}>
            返回
          </Button>
          <h2 className="text-2xl font-bold text-tcm-brown font-kai m-0">处方对比</h2>
        </div>
        <Card className="card-tcm">
          <Empty
            description="该患者处方不足2张，无法进行对比"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to={`/prescriptions/new/${patientId}`}>
              <Button type="primary" icon={<PlusOutlined />}>
                新增处方
              </Button>
            </Link>
          </Empty>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/patients/${patientId}`)}>
          返回
        </Button>
        <h2 className="text-2xl font-bold text-tcm-brown font-kai m-0">处方对比</h2>
        {patient && (
          <div className="ml-auto">
            <Tag color="brown">患者：{patient.name}</Tag>
            <Tag color="green">{patient.gender === 'MALE' ? '男' : '女'}</Tag>
            <Tag color="blue">{patient.age}岁</Tag>
          </div>
        )}
      </div>

      <Card className="card-tcm">
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-gray-600">选择要对比的处方（最多4张，按时间顺序排列）：</span>
            <Select
              mode="multiple"
              placeholder="请选择处方"
              value={selectedIds}
              onChange={(values) => {
                if (values.length > 4) {
                  values = values.slice(0, 4)
                }
                setSelectedIds(values)
              }}
              style={{ minWidth: 400 }}
            >
              {prescriptions.map(pres => (
                <Option key={pres.id} value={pres.id}>
                  {dayjs(pres.createdAt).format('YYYY-MM-DD')} - {pres.diagnosis || '未填写诊断'} ({pres.items?.length}味)
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {selectedIds.length < 2 ? (
          <Alert
            type="info"
            showIcon
            message="请至少选择2张处方进行对比"
          />
        ) : (
          <>
            <Row gutter={[16, 16]} className="mb-4">
              {selectedPrescriptions.map(pres => (
                <Col xs={24} sm={12} lg={6} key={pres.id}>
                  <Card size="small" className="h-full card-tcm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-tcm-brown">
                        {dayjs(pres.createdAt).format('YYYY-MM-DD')}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">第 {selectedPrescriptions.indexOf(pres) + 1} 诊</div>
                      <div className="flex justify-around">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-tcm-green">{pres.items?.length || 0}</div>
                          <div className="text-xs text-gray-500">药材数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-tcm-brown">{pres.totalDosage || 0}</div>
                          <div className="text-xs text-gray-500">剂数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-tcm-gold">
                            {pres.items?.reduce((sum, i) => sum + (i.dosage || 0), 0).toFixed(0) || 0}
                          </div>
                          <div className="text-xs text-gray-500">总重量(g)</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <Divider orientation="left" className="text-tcm-brown font-kai font-bold">
              <BarChartOutlined /> 药材用量变化对比
            </Divider>

            <div className="mb-4 flex flex-wrap gap-2">
              <Tag color="green">↑新增</Tag>
              <Tag color="red">↓移除</Tag>
              <Tag color="orange">↗加量</Tag>
              <Tag color="blue">↘减量</Tag>
              <Tag color="default">→ 不变</Tag>
            </div>

            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 120 * (selectedPrescriptions.length + 1) }}
              onRow={(record) => ({
                style: getRowStyle(record.changeType)
              })}
            />

            <Divider orientation="left" className="text-tcm-brown font-kai font-bold mt-6">
              <BarChartOutlined /> 用药思路演变分析
            </Divider>

            <Card size="small" className="bg-tcm-beige-dark">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tableData.filter(r => r.changeType === 'added').length}
                  </div>
                  <div className="text-sm text-gray-600">新增药材</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {tableData.filter(r => r.changeType === 'removed').length}
                  </div>
                  <div className="text-sm text-gray-600">移除药材</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {tableData.filter(r => r.changeType === 'increased').length}
                  </div>
                  <div className="text-sm text-gray-600">增加用量</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tableData.filter(r => r.changeType === 'decreased').length}
                  </div>
                  <div className="text-sm text-gray-600">减少用量</div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <p className="text-gray-700">
                  从 <span className="font-bold text-tcm-brown">{selectedPrescriptions.length}</span> 张处方的对比可以看出，
                  医生在辨证施治过程中，根据患者病情变化，
                  {tableData.filter(r => r.changeType === 'added').length > 0 && (
                    <span> 新增了 <span className="font-bold text-green-600">
                      {tableData.filter(r => r.changeType === 'added').map(r => r.herbName).join('、')}
                    </span> 等药物，</span>
                  )}
                  {tableData.filter(r => r.changeType === 'removed').length > 0 && (
                    <span> 去除了 <span className="font-bold text-red-600">
                      {tableData.filter(r => r.changeType === 'removed').map(r => r.herbName).join('、')}
                    </span> 等药物，</span>
                  )}
                  {tableData.filter(r => r.changeType === 'increased').length > 0 && (
                    <span> 增加了 <span className="font-bold text-orange-600">
                      {tableData.filter(r => r.changeType === 'increased').map(r => r.herbName).join('、')}
                    </span> 的用量，</span>
                  )}
                  {tableData.filter(r => r.changeType === 'decreased').length > 0 && (
                    <span> 减少了 <span className="font-bold text-blue-600">
                      {tableData.filter(r => r.changeType === 'decreased').map(r => r.herbName).join('、')}
                    </span> 的用量。</span>
                  )}
                </p>
                <p className="text-gray-500 mt-2 text-sm italic">
                  注：以上分析由系统自动生成，仅供参考。
                </p>
              </div>
            </Card>
          </>
        )}
      </Card>
    </div>
  )
}

export default PrescriptionComparison
