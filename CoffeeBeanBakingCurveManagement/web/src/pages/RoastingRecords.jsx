import { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Card, message, Popconfirm } from 'antd'
import { PlusOutlined, EyeOutlined, DeleteOutlined, LineChartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getRoastingRecords, deleteRoastingRecord } from '../api'

const ROAST_LEVEL_MAP = {
  '浅烘': { color: '#FFE0B2', text: '#E65100' },
  '中浅烘': { color: '#FFCC80', text: '#BF360C' },
  '中烘': { color: '#FFB74D', text: '#8D3B00' },
  '中深烘': { color: '#FF8A65', text: '#4E1600' },
  '深烘': { color: '#6D4C41', text: '#FFFFFF' },
}

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function RoastingRecords() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRoastingRecords()
      setData(res.data)
    } catch {
      message.error('获取烘焙记录失败')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id) => {
    try {
      await deleteRoastingRecord(id)
      message.success('删除成功')
      fetchData()
    } catch {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '烘焙日期',
      dataIndex: 'roasting_date',
      width: 110,
    },
    {
      title: '生豆',
      width: 140,
      render: (_, r) => r.green_bean ? `${r.green_bean.origin}` : '-',
    },
    {
      title: '烘焙度',
      dataIndex: 'roast_level',
      width: 100,
      render: (v) => {
        const style = ROAST_LEVEL_MAP[v]
        return v ? <Tag color={style?.color} style={{ color: style?.text }}>{v}</Tag> : '-'
      },
    },
    {
      title: '入锅温度',
      width: 100,
      render: (_, r) => r.bean_temp_start ? `${r.bean_temp_start}°C` : '-',
    },
    {
      title: '一爆开始',
      width: 100,
      render: (_, r) => formatTime(r.first_crack_start_time),
    },
    {
      title: '出锅时间',
      width: 100,
      render: (_, r) => formatTime(r.drop_time),
    },
    {
      title: '发展时间',
      width: 100,
      render: (_, r) => formatTime(r.development_time),
    },
    {
      title: '总时间',
      width: 90,
      render: (_, r) => formatTime(r.total_time),
    },
    {
      title: '失水率',
      width: 90,
      render: (_, r) => {
        if (r.charge_weight && r.drop_weight && r.charge_weight > 0) {
          return `${((1 - r.drop_weight / r.charge_weight) * 100).toFixed(1)}%`
        }
        return '-'
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/roasting-records/${record.id}`)}>
            详情
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="烘焙记录"
      extra={
        <Space>
          <Button icon={<LineChartOutlined />} onClick={() => navigate('/curve-compare')}>曲线对比</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/artisan-import')}>
            新增记录
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1200 }}
        onRow={(record) => ({
          onDoubleClick: () => navigate(`/roasting-records/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </Card>
  )
}
