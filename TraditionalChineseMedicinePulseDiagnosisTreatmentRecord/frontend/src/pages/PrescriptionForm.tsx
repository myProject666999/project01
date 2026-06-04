import { Card, Button, Form, Input, Select, Table, InputNumber, Space, message, Divider, Row, Col, Tag, Modal, Alert, Empty } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, AlertOutlined, SearchOutlined } from '@ant-design/icons'
import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import type { Prescription, PrescriptionItem, Patient, Herb, ValidationResult } from '@/types'
import { PREPARATION_METHODS } from '@/types'
import { prescriptionApi, patientApi, herbApi, compatibilityApi } from '@/api'
import { useAppStore } from '@/store'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select
const { confirm } = Modal

const PrescriptionForm = () => {
  const { id, patientId, sourceId } = useParams<{ id?: string; patientId?: string; sourceId?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const [items, setItems] = useState<PrescriptionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [herbSearchVisible, setHerbSearchVisible] = useState(false)
  const [herbSearchKeyword, setHerbSearchKeyword] = useState('')
  const [conflicts, setConflicts] = useState<ValidationResult[]>([])
  const [sourcePrescription, setSourcePrescription] = useState<Prescription | null>(null)
  const [mode, setMode] = useState<'new' | 'edit' | 'addFlavor' | 'removeFlavor'>('new')
  const { currentPatient, setSourcePrescription: setStoreSourcePrescription } = useAppStore()

  const isEdit = !!id

  useEffect(() => {
    if (sourceId) {
      setMode('addFlavor')
      loadSourcePrescription(parseInt(sourceId))
    } else if (id) {
      setMode('edit')
      loadPrescription(parseInt(id))
    } else if (patientId) {
      setMode('new')
      form.setFieldsValue({
        patientId: parseInt(patientId),
        totalDosage: 7,
        doctorName: '',
        prescriptionUsage: '水煎服，每日1剂，分早晚温服'
      })
      loadPatient(parseInt(patientId))
    }
    loadAllHerbs()
  }, [id, patientId, sourceId])

  useEffect(() => {
    validateCompatibility()
  }, [items])

  const loadAllHerbs = async () => {
    try {
      const result = await herbApi.getAll()
      setHerbs(result)
    } catch (error) {
      console.error('加载草药库失败', error)
    }
  }

  const loadPatient = async (pid: number) => {
    try {
      if (currentPatient?.id === pid) {
        setPatient(currentPatient)
      } else {
        const p = await patientApi.getById(pid)
        setPatient(p)
      }
    } catch (error) {
      console.error('加载患者信息失败', error)
    }
  }

  const loadSourcePrescription = async (sid: number) => {
    try {
      const pres = await prescriptionApi.getDetailById(sid)
      setSourcePrescription(pres)
      setStoreSourcePrescription(pres)
      if (pres.patientId) {
        loadPatient(pres.patientId)
      }
      form.setFieldsValue({
        patientId: pres.patientId,
        diagnosis: pres.diagnosis,
        totalDosage: pres.totalDosage,
        doctorName: pres.doctorName,
        prescriptionUsage: pres.prescriptionUsage
      })
    } catch (error) {
      console.error('加载源处方失败', error)
      message.error('加载源处方失败')
    }
  }

  const loadPrescription = async (pid: number) => {
    setLoading(true)
    try {
      const pres = await prescriptionApi.getDetailById(pid)
      form.setFieldsValue({
        ...pres,
        consultationId: searchParams.get('consultationId') ? parseInt(searchParams.get('consultationId')!) : pres.consultationId
      })
      setItems(pres.items || [])
      if (pres.patientId) {
        loadPatient(pres.patientId)
      }
    } catch (error) {
      console.error('加载处方失败', error)
      message.error('加载处方失败')
    } finally {
      setLoading(false)
    }
  }

  const validateCompatibility = async () => {
    if (items.length < 2) {
      setConflicts([])
      return
    }
    try {
      const herbNames = items.map(item => item.herbName)
      const result = await compatibilityApi.validatePrescription(herbNames)
      setConflicts(result)
    } catch (error) {
      console.error('配伍校验失败', error)
    }
  }

  const handleAddHerb = (herb: Herb) => {
    const existing = items.find(item => item.herbName === herb.name)
    if (existing) {
      message.warning(`"${herb.name}" 已在处方中`)
      return
    }
    const newItem: PrescriptionItem = {
      herbId: herb.id,
      herbName: herb.name,
      dosage: 10,
      preparationMethod: '常规煎服'
    }
    setItems([...items, newItem])
    setHerbSearchVisible(false)
    setHerbSearchKeyword('')
  }

  const handleRemoveHerb = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const handleUpdateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSwitchMode = (newMode: 'addFlavor' | 'removeFlavor') => {
    if (!sourcePrescription) return
    setMode(newMode)
    if (newMode === 'addFlavor') {
      setItems(sourcePrescription.items || [])
    } else {
      setItems(sourcePrescription.items || [])
    }
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      message.error('请添加至少一味药材')
      return
    }

    if (conflicts.length > 0) {
      confirm({
        title: '存在配伍禁忌',
        icon: <AlertOutlined className="text-tcm-red" />,
        content: (
          <div>
            <p className="mb-2">当前处方存在以下配伍禁忌：</p>
            {conflicts.map((c, idx) => (
              <Alert
                key={idx}
                type="error"
                showIcon
                message={`${c.herbA} 与 ${c.herbB} 存在${c.ruleType}禁忌`}
                description={c.description}
                className="mb-2"
              />
            ))}
            <p className="text-tcm-red font-bold mt-2">十八反十九畏为中医硬性禁忌，是否仍要保存？</p>
          </div>
        ),
        okText: '强制保存',
        okType: 'danger',
        cancelText: '返回修改',
        onOk: () => doSubmit()
      })
      return
    }

    doSubmit()
  }

  const doSubmit = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      const prescriptionData: Prescription = {
        ...values,
        items: items
      }

      if (mode === 'addFlavor' && sourceId) {
        await prescriptionApi.addFlavor(parseInt(sourceId), prescriptionData)
        message.success('加味成功')
      } else if (mode === 'removeFlavor' && sourceId) {
        await prescriptionApi.removeFlavor(parseInt(sourceId), prescriptionData)
        message.success('减味成功')
      } else if (isEdit && id) {
        await prescriptionApi.update(parseInt(id), prescriptionData)
        message.success('更新成功')
      } else {
        await prescriptionApi.create(prescriptionData)
        message.success('保存成功')
      }

      if (values.patientId) {
        navigate(`/patients/${values.patientId}`)
      } else {
        navigate('/patients')
      }
    } catch (error) {
      console.error('保存失败', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredHerbs = useMemo(() => {
    if (!herbSearchKeyword) return herbs
    const keyword = herbSearchKeyword.toLowerCase()
    return herbs.filter(h =>
      h.name.toLowerCase().includes(keyword) ||
      h.category?.toLowerCase().includes(keyword) ||
      h.aliases?.some(a => a.aliasName.toLowerCase().includes(keyword))
    )
  }, [herbs, herbSearchKeyword])

  const totalDosage = items.reduce((sum, item) => sum + (item.dosage || 0), 0)

  const itemColumns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '药材名称',
      dataIndex: 'herbName',
      key: 'herbName',
      width: 150,
      render: (text: string, record: PrescriptionItem) => {
        const herb = herbs.find(h => h.id === record.herbId)
        return (
          <div>
            <div className="font-bold text-tcm-brown">{text}</div>
            {herb && <div className="text-xs text-gray-500">{herb.category}</div>}
          </div>
        )
      }
    },
    {
      title: '用量(g)',
      dataIndex: 'dosage',
      key: 'dosage',
      width: 120,
      render: (value: number, _: any, index: number) => (
        <InputNumber
          min={0.1}
          step={0.5}
          value={value}
          onChange={(val) => handleUpdateItem(index, 'dosage', val)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '煎服法',
      dataIndex: 'preparationMethod',
      key: 'preparationMethod',
      width: 150,
      render: (value: string, _: any, index: number) => (
        <Select
          value={value}
          onChange={(val) => handleUpdateItem(index, 'preparationMethod', val)}
          style={{ width: '100%' }}
        >
          {PREPARATION_METHODS.map(method => (
            <Option key={method} value={method}>
              {method}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveHerb(index)}
        />
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(patient?.id ? `/patients/${patient.id}` : '/patients')}
        >
          返回
        </Button>
        <h2 className="text-2xl font-bold text-tcm-brown font-kai m-0">
          {mode === 'addFlavor' && '处方加味'}
          {mode === 'removeFlavor' && '处方减味'}
          {mode === 'edit' && '编辑处方'}
          {mode === 'new' && '开具处方'}
        </h2>
        {patient && (
          <div className="ml-auto">
            <Tag color="brown">患者：{patient.name}</Tag>
            <Tag color="green">{patient.gender === 'MALE' ? '男' : '女'}</Tag>
            <Tag color="blue">{patient.age}岁</Tag>
          </div>
        )}
      </div>

      {sourcePrescription && (
        <Card className="card-tcm">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-600">基于原方：</span>
            <Tag color="gold">{dayjs(sourcePrescription.createdAt).format('YYYY-MM-DD')} 处方</Tag>
            <span className="text-gray-500">共 {sourcePrescription.items?.length} 味药</span>
            <Space className="ml-auto">
              <Button
                type={mode === 'addFlavor' ? 'primary' : 'default'}
                onClick={() => handleSwitchMode('addFlavor')}
              >
                加味模式
              </Button>
              <Button
                type={mode === 'removeFlavor' ? 'primary' : 'default'}
                onClick={() => handleSwitchMode('removeFlavor')}
              >
                减味模式
              </Button>
            </Space>
          </div>
          <div className="flex flex-wrap gap-2">
            {sourcePrescription.items?.map((item, idx) => (
              <Tag key={idx} color="brown">
                {item.herbName} {item.dosage}g
              </Tag>
            ))}
          </div>
        </Card>
      )}

      {conflicts.length > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<AlertOutlined />}
          message="配伍禁忌警告"
          description={
            <div>
              {conflicts.map((c, idx) => (
                <div key={idx} className="mb-1">
                  <span className="text-tcm-red font-bold">{c.herbA}</span> 与
                  <span className="text-tcm-red font-bold"> {c.herbB}</span> 存在
                  <Tag color="red">{c.ruleType}</Tag> 禁忌：{c.description}
                </div>
              ))}
            </div>
          }
        />
      )}

      <Card className="card-tcm" loading={loading}>
        <Form form={form} layout="vertical">
          <Form.Item name="patientId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="consultationId" hidden>
            <Input />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item label="诊断" name="diagnosis" className="form-label">
                <TextArea rows={2} placeholder="请输入中医诊断结果" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="剂数" name="totalDosage" className="form-label" rules={[{ required: true, message: '请输入剂数' }]}>
                <InputNumber min={1} max={30} style={{ width: '100%' }} addonAfter="剂" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="医生姓名" name="doctorName" className="form-label">
                <Input placeholder="请输入医生姓名" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="用法" name="prescriptionUsage" className="form-label">
                <TextArea rows={2} placeholder="请输入用法，如：水煎服，每日1剂，分早晚温服" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="text-tcm-brown font-kai font-bold">
            🧪 处方明细
          </Divider>

          <div className="mb-4 flex justify-between items-center">
            <div>
              <span className="text-gray-600">共 </span>
              <span className="text-xl font-bold text-tcm-brown">{items.length}</span>
              <span className="text-gray-600"> 味药，总重量 </span>
              <span className="text-xl font-bold text-tcm-green">{totalDosage.toFixed(1)}</span>
              <span className="text-gray-600"> g</span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setHerbSearchVisible(true)}
            >
              添加药材
            </Button>
          </div>

          {items.length === 0 ? (
            <Empty
              description="请点击"添加药材"按钮开始开方"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={itemColumns}
              dataSource={items}
              rowKey="herbName"
              pagination={false}
              bordered
            />
          )}

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button onClick={() => navigate(patient?.id ? `/patients/${patient.id}` : '/patients')}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              danger={conflicts.length > 0}
            >
              {conflicts.length > 0 ? '强制保存' : '保存处方'}
            </Button>
          </div>
        </Form>
      </Card>

      <Modal
        title="选择药材"
        open={herbSearchVisible}
        onCancel={() => {
          setHerbSearchVisible(false)
          setHerbSearchKeyword('')
        }}
        width={800}
        footer={null}
      >
        <div className="mb-4">
          <Input
            placeholder="搜索药材名称、别名或分类..."
            prefix={<SearchOutlined />}
            value={herbSearchKeyword}
            onChange={(e) => setHerbSearchKeyword(e.target.value)}
            allowClear
          />
        </div>
        <div
          className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto"
          style={{ maxHeight: '400px', overflowY: 'auto' }}
        >
          {filteredHerbs.map(herb => (
            <div
              key={herb.id}
              className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-tcm-beige-dark hover:border-tcm-brown transition-all"
              onClick={() => handleAddHerb(herb)}
            >
              <div className="font-bold text-tcm-brown">{herb.name}</div>
              <div className="text-xs text-gray-500 truncate">{herb.category}</div>
              <div className="text-xs text-tcm-green">{herb.dosageRange}</div>
            </div>
          ))}
        </div>
        {filteredHerbs.length === 0 && (
          <Empty description="未找到匹配的药材" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Modal>
    </div>
  )
}

export default PrescriptionForm
