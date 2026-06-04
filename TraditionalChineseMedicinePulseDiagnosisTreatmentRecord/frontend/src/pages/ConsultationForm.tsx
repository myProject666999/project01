import { Card, Button, Form, Input, Select, Upload, Space, message, Divider, Row, Col, Tag } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import type { Consultation, Patient } from '@/types'
import { PULSE_TYPES } from '@/types'
import { consultationApi, patientApi, uploadApi } from '@/api'
import dayjs from 'dayjs'
import { useAppStore } from '@/store'

const { TextArea } = Input
const { Option } = Select

const ConsultationForm = () => {
  const { id, patientId } = useParams<{ id?: string; patientId?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [tongueImageUrl, setTongueImageUrl] = useState<string | null>(null)
  const { currentPatient } = useAppStore()

  const isEdit = !!id

  useEffect(() => {
    if (patientId) {
      loadPatient(parseInt(patientId))
    }
    if (id) {
      loadConsultation(parseInt(id))
    } else if (patientId) {
      form.setFieldsValue({
        patientId: parseInt(patientId),
        visitDate: dayjs().format('YYYY-MM-DDTHH:mm:ss')
      })
    }
  }, [id, patientId])

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

  const loadConsultation = async (cid: number) => {
    setLoading(true)
    try {
      const consultation = await consultationApi.getById(cid)
      form.setFieldsValue({
        ...consultation,
        pulseTypes: consultation.pulseTypes ? consultation.pulseTypes.split(',') : []
      })
      setTongueImageUrl(consultation.tongueImageUrl || null)
      if (consultation.patientId) {
        loadPatient(consultation.patientId)
      }
    } catch (error) {
      console.error('加载诊疗记录失败', error)
      message.error('加载诊疗记录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadApi.uploadTongueImage(file)
      setTongueImageUrl(result.url)
      form.setFieldsValue({ tongueImageUrl: result.url })
      message.success('上传成功')
    } catch (error) {
      console.error('上传失败', error)
    }
    return false
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      values.pulseTypes = values.pulseTypes?.join(',') || ''

      if (isEdit && id) {
        await consultationApi.update(parseInt(id), values)
        message.success('更新成功')
      } else {
        await consultationApi.create(values)
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

  const uploadProps = {
    beforeUpload: handleUpload,
    accept: 'image/*',
    showUploadList: false
  }

  const selectedPulseTypes = Form.useWatch('pulseTypes', form) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(patient?.id ? `/patients/${patient.id}` : '/patients')}
        >
          返回
        </Button>
        <h2 className="text-2xl font-bold text-tcm-brown font-kai m-0">
          {isEdit ? '编辑诊疗记录' : '新增诊疗记录'}
        </h2>
        {patient && (
          <div className="ml-auto">
            <Tag color="brown">患者：{patient.name}</Tag>
            <Tag color="green">{patient.gender === 'MALE' ? '男' : '女'}</Tag>
            <Tag color="blue">{patient.age}岁</Tag>
          </div>
        )}
      </div>

      <Card className="card-tcm" loading={loading}>
        <Form form={form} layout="vertical">
          <Form.Item name="patientId" hidden>
            <Input />
          </Form.Item>

          <div className="mb-6">
            <Divider orientation="left" className="text-tcm-brown font-kai font-bold">
              👁️ 望诊
            </Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="面色" name="complexion" className="form-label">
                  <TextArea rows={2} placeholder="请记录面色观察结果，如：面色萎黄、面色苍白等" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="舌象" name="tongueAppearance" className="form-label">
                  <TextArea rows={2} placeholder="请记录舌象观察结果，如：舌红苔黄、舌淡苔白腻等" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="舌象照片" className="form-label">
                  <div className="flex gap-4 items-center">
                    {tongueImageUrl && (
                      <div className="relative">
                        <img
                          src={tongueImageUrl.startsWith('/') ? `http://localhost:8080/api${tongueImageUrl}` : tongueImageUrl}
                          alt="舌象"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-tcm-brown/20"
                        />
                        <Button
                          size="small"
                          danger
                          className="absolute -top-2 -right-2"
                          onClick={() => {
                            setTongueImageUrl(null)
                            form.setFieldsValue({ tongueImageUrl: null })
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    )}
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>
                        {tongueImageUrl ? '重新上传' : '上传舌象照片'}
                      </Button>
                    </Upload>
                    <span className="text-gray-500 text-sm">支持 JPG、PNG、GIF 格式，最大 10MB</span>
                    <Form.Item name="tongueImageUrl" noStyle>
                      <Input type="hidden" />
                    </Form.Item>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="mb-6">
            <Divider orientation="left" className="text-tcm-brown font-kai font-bold">
              👂 闻诊
            </Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item label="口气" name="breath" className="form-label">
                  <TextArea rows={2} placeholder="请记录口气情况，如：口气臭秽、口气轻微等" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="咳嗽声" name="cough" className="form-label">
                  <TextArea rows={2} placeholder="请记录咳嗽声音特征，如：咳声重浊、干咳无痰等" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="语音" name="voice" className="form-label">
                  <TextArea rows={2} placeholder="请记录语音特征，如：语声低微、语声洪亮等" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="mb-6">
            <Divider orientation="left" className="text-tcm-brown font-kai font-bold">
              💬 问诊
            </Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  label="主诉"
                  name="chiefComplaint"
                  className="form-label"
                  rules={[{ required: true, message: '请输入主诉' }]}
                >
                  <TextArea rows={2} placeholder="请输入患者主要不适症状及持续时间" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="伴随症状" name="associatedSymptoms" className="form-label">
                  <TextArea rows={3} placeholder="请记录伴随症状，如：乏力、纳差、眠差等" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="大便情况" name="stool" className="form-label">
                  <TextArea rows={2} placeholder="请记录大便情况，如：便干、便溏、日行几次等" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="小便情况" name="urine" className="form-label">
                  <TextArea rows={2} placeholder="请记录小便情况，如：小便黄、夜尿多等" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="mb-6">
            <Divider orientation="left" className="text-tcm-brown font-kai font-bold">
              🖐️ 切诊
            </Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item label="脉象" name="pulseTypes" className="form-label">
                  <Select
                    mode="multiple"
                    placeholder="请选择脉象，可多选"
                    style={{ width: '100%' }}
                    tagRender={(props) => (
                      <Tag color="brown" closable={props.closable} onClose={props.onClose}>
                        {props.label}
                      </Tag>
                    )}
                  >
                    {PULSE_TYPES.map(pulse => (
                      <Option key={pulse} value={pulse}>{pulse}</Option>
                    ))}
                  </Select>
                </Form.Item>
                {selectedPulseTypes.length > 0 && (
                  <div className="mb-4 p-3 bg-tcm-beige-dark rounded-lg">
                    <span className="text-gray-500 mr-2">已选脉象：</span>
                    {selectedPulseTypes.map((p: string) => (
                      <Tag key={p} color="brown" className="mr-1 mb-1">{p}</Tag>
                    ))}
                  </div>
                )}
              </Col>
            </Row>
          </div>

          <div className="mb-6">
            <Divider orientation="left" className="text-tcm-brown font-kai font-bold">
              📝 基本信息
            </Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="就诊时间"
                  name="visitDate"
                  className="form-label"
                  rules={[{ required: true, message: '请选择就诊时间' }]}
                >
                  <Input type="datetime-local" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="备注" name="remark" className="form-label">
                  <TextArea rows={2} placeholder="其他需要记录的信息" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={() => navigate(patient?.id ? `/patients/${patient.id}` : '/patients')}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={submitting}
            >
              保存诊疗记录
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default ConsultationForm
