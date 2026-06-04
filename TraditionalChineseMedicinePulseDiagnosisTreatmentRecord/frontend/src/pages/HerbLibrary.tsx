import { Card, Button, Table, Input, Form, Modal, Space, Tag, message, Descriptions, Row, Col } from 'antd'
import { SearchOutlined, PlusOutlined, InfoCircleOutlined, EditOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import type { Herb, HerbAlias, PageResult } from '@/types'
import { herbApi } from '@/api'

const { TextArea } = Input

const HerbLibrary = () => {
  const [data, setData] = useState<PageResult<Herb> | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchForm] = Form.useForm()
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentHerb, setCurrentHerb] = useState<Herb | null>(null)
  const [aliases, setAliases] = useState<HerbAlias[]>([])
  const [aliasModalVisible, setAliasModalVisible] = useState(false)
  const [newAlias, setNewAlias] = useState('')
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20 })

  useEffect(() => {
    loadData()
  }, [pagination])

  const loadData = async () => {
    setLoading(true)
    try {
      const values = searchForm.getFieldsValue()
      const result = await herbApi.getPage({
        ...pagination,
        keyword: values.keyword
      })
      setData(result)
    } catch (error) {
      console.error('加载草药库失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(p => ({ ...p, pageNum: 1 }))
    loadData()
  }

  const handleViewDetail = async (herb: Herb) => {
    setCurrentHerb(herb)
    try {
      const result = await herbApi.getAliases(herb.id!)
      setAliases(result as unknown as HerbAlias[])
    } catch (error) {
      console.error('加载别名失败', error)
      setAliases([])
    }
    setDetailVisible(true)
  }

  const handleAddAlias = async () => {
    if (!currentHerb || !newAlias.trim()) return
    try {
      await herbApi.addAlias(currentHerb.id!, newAlias.trim())
      message.success('别名添加成功')
      setNewAlias('')
      const result = await herbApi.getAliases(currentHerb.id!)
      setAliases(result as unknown as HerbAlias[])
    } catch (error) {
      console.error('添加别名失败', error)
    }
  }

  const handleRemoveAlias = async (aliasId: number) => {
    Modal.confirm({
      title: '确认删除别名',
      content: '确定要删除这个别名吗？',
      onOk: async () => {
        try {
          await herbApi.removeAlias(aliasId)
          message.success('删除成功')
          if (currentHerb) {
            const result = await herbApi.getAliases(currentHerb.id!)
            setAliases(result as unknown as HerbAlias[])
          }
        } catch (error) {
          console.error('删除失败', error)
        }
      }
    })
  }

  const columns = [
    {
      title: '药材名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => <span className="font-bold text-tcm-brown">{text}</span>
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 180,
      render: (text: string) => text ? <Tag color="green">{text}</Tag> : '-'
    },
    {
      title: '性味',
      key: 'natureFlavor',
      width: 150,
      render: (_: any, record: Herb) => (
        <Space>
          {record.nature && <Tag color="orange">{record.nature}</Tag>}
          {record.flavor && <Tag color="blue">{record.flavor}</Tag>}
        </Space>
      )
    },
    {
      title: '归经',
      dataIndex: 'channelTropism',
      key: 'channelTropism',
      width: 150,
      render: (text: string) => text ? text.split(',').map(c => <Tag key={c} color="purple">{c}</Tag>) : '-'
    },
    {
      title: '用量',
      dataIndex: 'dosageRange',
      key: 'dosageRange',
      width: 120,
      render: (text: string) => text || '-'
    },
    {
      title: '功效',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Herb) => (
        <Button type="link" icon={<InfoCircleOutlined />} onClick={() => handleViewDetail(record)}>
          详情
        </Button>
      )
    }
  ]

  const natureColors: Record<string, string> = {
    '寒': 'blue',
    '热': 'red',
    '温': 'orange',
    '凉': 'cyan',
    '平': 'default'
  }

  const flavorColors: Record<string, string> = {
    '辛': 'orange',
    '甘': 'yellow',
    '酸': 'green',
    '苦': 'blue',
    '咸': 'purple',
    '淡': 'default',
    '涩': 'default'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-tcm-brown font-kai">草药库</h2>
        <div className="text-gray-500">
          共收录 <span className="text-xl font-bold text-tcm-brown">{data?.total || 0}</span> 味中草药
        </div>
      </div>

      <Card className="card-tcm">
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input
              placeholder="搜索药材名称、别名、分类、功效..."
              prefix={<SearchOutlined />}
              style={{ width: 400 }}
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button onClick={() => { searchForm.resetFields(); handleSearch() }}>重置</Button>
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
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination.pageNum,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 味`,
            onChange: (page, pageSize) => setPagination({ pageNum: page, pageSize })
          }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <span className="font-kai font-bold text-xl text-tcm-brown">{currentHerb?.name}</span>
          </div>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={null}
      >
        {currentHerb && (
          <div className="space-y-4">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="分类">
                <Tag color="green">{currentHerb.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="用量范围">
                {currentHerb.dosageRange || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="四气">
                {currentHerb.nature ? (
                  <Tag color={natureColors[currentHerb.nature] || 'default'}>
                    {currentHerb.nature}
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="五味">
                {currentHerb.flavor ? currentHerb.flavor.split('、').map(f => (
                  <Tag key={f} color={flavorColors[f] || 'default'} className="mr-1">
                    {f}
                  </Tag>
                )) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="归经" span={2}>
                {currentHerb.channelTropism ? currentHerb.channelTropism.split(',').map(c => (
                  <Tag key={c} color="purple" className="mr-1 mb-1">
                    {c}
                  </Tag>
                )) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="功效" span={2}>
                {currentHerb.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="使用禁忌" span={2}>
                {currentHerb.contraindications ? (
                  <span className="text-tcm-red">{currentHerb.contraindications}</span>
                ) : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" className="text-tcm-brown font-kai font-bold">
              别名管理
            </Divider>

            <div className="mb-3">
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="输入新别名"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  onPressEnter={handleAddAlias}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAlias}>
                  添加别名
                </Button>
              </Space.Compact>
            </div>

            <div className="flex flex-wrap gap-2">
              <Tag color="brown" className="py-1 px-3">
                {currentHerb.name} (正名)
              </Tag>
              {aliases.map(alias => (
                <Tag
                  key={alias.id}
                  closable
                  onClose={(e) => {
                    e.preventDefault()
                    handleRemoveAlias(alias.id!)
                  }}
                  className="py-1 px-3"
                >
                  {alias.aliasName}
                </Tag>
              ))}
              {aliases.length === 0 && (
                <span className="text-gray-400">暂无别名</span>
              )}
            </div>

            <div className="p-4 bg-tcm-beige-dark rounded-lg mt-4">
              <div className="text-sm text-gray-500 mb-1">
                <strong>特别说明：</strong>生姜、干姜、老姜为三种不同药材，请注意区分：
              </div>
              <Row gutter={[8, 8]}>
                <Col span={8}>
                  <div className="p-2 bg-white rounded">
                    <div className="font-bold text-tcm-brown">生姜</div>
                    <div className="text-xs text-gray-500">发汗解表，温中止呕</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="p-2 bg-white rounded">
                    <div className="font-bold text-tcm-brown">干姜</div>
                    <div className="text-xs text-gray-500">温中散寒，回阳通脉</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="p-2 bg-white rounded">
                    <div className="font-bold text-tcm-brown">老姜</div>
                    <div className="text-xs text-gray-500">发汗解表，药性较烈</div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HerbLibrary
