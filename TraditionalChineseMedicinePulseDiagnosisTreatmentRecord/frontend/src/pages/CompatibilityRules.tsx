import { Card, Tabs, Table, Tag, Alert, Row, Col, Divider, Input, Form, Button, message, Space } from 'antd'
import { AlertOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import type { CompatibilityRule, ValidationResult } from '@/types'
import { compatibilityApi } from '@/api'

const { Search } = Input

const CompatibilityRules = () => {
  const [eighteenRules, setEighteenRules] = useState<CompatibilityRule[]>([])
  const [nineteenRules, setNineteenRules] = useState<CompatibilityRule[]>([])
  const [loading, setLoading] = useState(false)
  const [validateForm] = Form.useForm()
  const [validateResult, setValidateResult] = useState<ValidationResult | null>(null)
  const [herb1, setHerb1] = useState('')
  const [herb2, setHerb2] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [eighteen, nineteen] = await Promise.all([
        compatibilityApi.getEighteen(),
        compatibilityApi.getNineteen()
      ])
      setEighteenRules(eighteen)
      setNineteenRules(nineteen)
    } catch (error) {
      console.error('加载配伍禁忌规则失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!herb1.trim() || !herb2.trim()) {
      message.warning('请输入两味药材名称')
      return
    }
    try {
      const result = await compatibilityApi.validatePair(herb1.trim(), herb2.trim())
      setValidateResult(result)
    } catch (error) {
      console.error('校验失败', error)
    }
  }

  const eighteenColumns = [
    {
      title: '药材A',
      dataIndex: ['herbA', 'name'],
      key: 'herbA',
      width: 120,
      render: (text: string) => <span className="font-bold text-tcm-red">{text}</span>
    },
    {
      title: '禁忌关系',
      key: 'relation',
      width: 80,
      render: () => (
        <div className="text-center">
          <AlertOutlined className="text-tcm-red text-xl" />
          <div className="text-xs text-tcm-red font-bold">反</div>
        </div>
      )
    },
    {
      title: '药材B',
      dataIndex: ['herbB', 'name'],
      key: 'herbB',
      width: 120,
      render: (text: string) => <span className="font-bold text-tcm-red">{text}</span>
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description'
    }
  ]

  const nineteenColumns = [
    {
      title: '药材A',
      dataIndex: ['herbA', 'name'],
      key: 'herbA',
      width: 120,
      render: (text: string) => <span className="font-bold text-tcm-brown">{text}</span>
    },
    {
      title: '禁忌关系',
      key: 'relation',
      width: 80,
      render: () => (
        <div className="text-center">
          <AlertOutlined className="text-tcm-brown text-xl" />
          <div className="text-xs text-tcm-brown font-bold">畏</div>
        </div>
      )
    },
    {
      title: '药材B',
      dataIndex: ['herbB', 'name'],
      key: 'herbB',
      width: 120,
      render: (text: string) => <span className="font-bold text-tcm-brown">{text}</span>
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description'
    }
  ]

  const tabItems = [
    {
      key: '1',
      label: (
        <span className="font-kai font-bold">
          <AlertOutlined className="text-tcm-red" /> 十八反
        </span>
      ),
      children: (
        <div>
          <Alert
            type="error"
            showIcon
            icon={<AlertOutlined />}
            message="十八反歌诀"
            description="本草明言十八反，半蒌贝蔹芨攻乌，藻戟遂芫俱战草，诸参辛芍叛藜芦。"
            className="mb-4"
          />
          <Table
            columns={eighteenColumns}
            dataSource={eighteenRules}
            rowKey="id"
            pagination={false}
            loading={loading}
            size="small"
          />
        </div>
      )
    },
    {
      key: '2',
      label: (
        <span className="font-kai font-bold">
          <AlertOutlined className="text-tcm-brown" /> 十九畏
        </span>
      ),
      children: (
        <div>
          <Alert
            type="warning"
            showIcon
            icon={<InfoCircleOutlined />}
            message="十九畏歌诀"
            description="硫黄原是火中精，朴硝一见便相争。水银莫与砒霜见，狼毒最怕密陀僧。巴豆性烈最为上，偏与牵牛不顺情。丁香莫与郁金见，牙硝难合京三棱。川乌草乌不顺犀，人参最怕五灵脂。官桂善能调冷气，若逢石脂便相欺。"
            className="mb-4"
          />
          <Table
            columns={nineteenColumns}
            dataSource={nineteenRules}
            rowKey="id"
            pagination={false}
            loading={loading}
            size="small"
          />
        </div>
      )
    },
    {
      key: '3',
      label: (
        <span className="font-kai font-bold">
          <SearchOutlined /> 配伍校验
        </span>
      ),
      children: (
        <div>
          <Card className="card-tcm mb-4">
            <h3 className="section-title">两味药配伍禁忌校验</h3>
            <Form form={validateForm} layout="inline">
              <Form.Item>
                <Input
                  placeholder="输入第一味药"
                  value={herb1}
                  onChange={(e) => setHerb1(e.target.value)}
                  style={{ width: 200 }}
                  prefix={<span className="text-tcm-brown font-bold">药</span>}
                />
              </Form.Item>
              <Form.Item>
                <span className="text-xl text-tcm-red mx-2">VS</span>
              </Form.Item>
              <Form.Item>
                <Input
                  placeholder="输入第二味药"
                  value={herb2}
                  onChange={(e) => setHerb2(e.target.value)}
                  style={{ width: 200 }}
                  prefix={<span className="text-tcm-brown font-bold">药</span>}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleValidate} icon={<SearchOutlined />}>
                  开始校验
                </Button>
              </Form.Item>
            </Form>

            {validateResult && (
              <div className="mt-4">
                {validateResult.valid ? (
                  <Alert
                    type="success"
                    showIcon
                    message="配伍安全"
                    description={`${herb1} 与 ${herb2} 配伍无禁忌，可以使用。`}
                  />
                ) : (
                  <Alert
                    type="error"
                    showIcon
                    icon={<AlertOutlined />}
                    message="存在配伍禁忌"
                    description={
                      <div>
                        <p>
                          <span className="font-bold text-tcm-red">{validateResult.herbA}</span> 与
                          <span className="font-bold text-tcm-red"> {validateResult.herbB}</span> 存在
                          <Tag color="red">{validateResult.ruleType}</Tag> 禁忌
                        </p>
                        <p className="mt-2">{validateResult.description}</p>
                      </div>
                    }
                  />
                )}
              </div>
            )}
          </Card>

          <Card className="card-tcm">
            <h3 className="section-title">常见配伍禁忌示例</h3>
            <Row gutter={[16, 16]}>
              {[
                { herb1: '半夏', herb2: '川乌', rule: '十八反' },
                { herb1: '甘草', herb2: '甘遂', rule: '十八反' },
                { herb1: '人参', herb2: '五灵脂', rule: '十九畏' },
                { herb1: '丁香', herb2: '郁金', rule: '十九畏' }
              ].map((item, idx) => (
                <Col xs={24} md={12} key={idx}>
                  <div
                    className="p-4 bg-tcm-beige-dark rounded-lg cursor-pointer hover:bg-tcm-beige transition-colors"
                    onClick={() => {
                      setHerb1(item.herb1)
                      setHerb2(item.herb2)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <Space>
                        <Tag color="brown">{item.herb1}</Tag>
                        <AlertOutlined className="text-tcm-red" />
                        <Tag color="brown">{item.herb2}</Tag>
                      </Space>
                      <Tag color={item.rule === '十八反' ? 'red' : 'orange'}>{item.rule}</Tag>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-tcm-brown font-kai">配伍禁忌规则</h2>
        <div className="flex gap-2">
          <Tag color="red">十八反 {eighteenRules.length} 条</Tag>
          <Tag color="orange">十九畏 {nineteenRules.length} 条</Tag>
        </div>
      </div>

      <Alert
        type="error"
        showIcon
        icon={<AlertOutlined className="text-tcm-red" />}
        title="重要提示"
        message="十八反十九畏为中医临床用药必须遵守的硬性禁忌，系统在开方时会自动校验并拦截存在禁忌的处方。如确需使用，请在医生指导下谨慎处理。"
      />

      <Card className="card-tcm">
        <Tabs items={tabItems} defaultActiveKey="1" />
      </Card>

      <Card className="card-tcm">
        <Divider orientation="left" className="text-tcm-brown font-kai font-bold">
          配伍禁忌知识
        </Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-bold text-tcm-red font-kai mb-2">什么是十八反？</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                十八反是指两种药物同用能产生或增强毒性或副作用。十八反歌诀：
                "本草明言十八反，半蒌贝蔹芨攻乌，藻戟遂芫俱战草，诸参辛芍叛藜芦。"
                即：半夏、瓜蒌、贝母、白蔹、白及反乌头；海藻、大戟、甘遂、芫花反甘草；
                各种参类、细辛、芍药反藜芦。
              </p>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-bold text-tcm-brown font-kai mb-2">什么是十九畏？</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                十九畏是指两种药物同用能产生或增强毒性或副作用，属于配伍禁忌。
                十九畏包括：硫黄畏朴硝、水银畏砒霜、狼毒畏密陀僧、巴豆畏牵牛、
                丁香畏郁金、芒硝畏三棱、川乌草乌畏犀角、人参畏五灵脂、肉桂畏赤石脂。
              </p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default CompatibilityRules
