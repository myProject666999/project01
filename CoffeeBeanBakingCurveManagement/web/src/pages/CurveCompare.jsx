import { useState, useEffect, useMemo } from 'react'
import { Card, Select, Button, Space, message, Empty } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { getRoastingRecords, compareRoastingRecords } from '../api'

const COLORS = ['#D2691E', '#B8860B', '#A0522D', '#8B4513', '#CD853F', '#DEB887', '#DAA520', '#D2B48C']

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function CurveCompare() {
  const [allRecords, setAllRecords] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [compareData, setCompareData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await getRoastingRecords()
        setAllRecords(res.data)
      } catch {
        message.error('获取烘焙记录失败')
      }
    }
    fetchRecords()
  }, [])

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      message.warning('请至少选择2条记录进行对比')
      return
    }
    setLoading(true)
    try {
      const res = await compareRoastingRecords(selectedIds)
      setCompareData(res.data)
    } catch {
      message.error('对比数据获取失败')
    }
    setLoading(false)
  }

  const chartOption = useMemo(() => {
    if (!compareData.length) return {}

    const series = []
    const legendData = []

    compareData.forEach((record, idx) => {
      const color = COLORS[idx % COLORS.length]
      const label = record.green_bean
        ? `${record.green_bean.origin} ${record.roasting_date}`
        : `记录#${record.id}`
      legendData.push(label)

      const beanTempPoints = (record.curve_points || [])
        .filter((p) => p.curve_type === 'bean_temp')
        .sort((a, b) => a.elapsed_seconds - b.elapsed_seconds)

      const airTempPoints = (record.curve_points || [])
        .filter((p) => p.curve_type === 'air_temp')
        .sort((a, b) => a.elapsed_seconds - b.elapsed_seconds)

      const offset = record.first_crack_start_time || 0

      const beanData = beanTempPoints.map((p) => [p.elapsed_seconds - offset, p.temperature])
      const airData = airTempPoints.map((p) => [p.elapsed_seconds - offset, p.temperature])

      series.push({
        name: `${label} - 豆温`,
        type: 'line',
        data: beanData,
        smooth: true,
        lineStyle: { color, width: 2.5 },
        itemStyle: { color },
        symbol: 'none',
      })

      series.push({
        name: `${label} - 炉温`,
        type: 'line',
        data: airData,
        smooth: true,
        lineStyle: { color, width: 1.5, type: 'dashed' },
        itemStyle: { color },
        symbol: 'none',
      })

      if (record.drop_time != null && offset != null) {
        series.push({
          name: `${label} - 出锅`,
          type: 'line',
          data: [[record.drop_time - offset, 0]],
          markLine: {
            data: [{
              xAxis: record.drop_time - offset,
              label: { formatter: `${label} 出锅`, fontSize: 10 },
              lineStyle: { color, width: 1.5, type: 'dotted' },
            }],
            symbol: 'none',
            animation: false,
          },
        })
      }
    })

    return {
      title: {
        text: '曲线对比（以一爆开始对齐）',
        left: 'center',
        textStyle: { color: '#3E2723', fontSize: 16 },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const sec = params[0].axisValue
          const sign = sec >= 0 ? '+' : ''
          let html = `<b>一爆${sign}${sec}s</b><br/>`
          params.forEach((p) => {
            if (p.value && p.value[1] !== undefined) {
              html += `${p.marker} ${p.seriesName}: ${p.value[1]}°C<br/>`
            }
          })
          return html
        },
      },
      legend: {
        data: legendData.flatMap((l) => [`${l} - 豆温`, `${l} - 炉温`]),
        top: 30,
        textStyle: { color: '#5D4037', fontSize: 11 },
        type: 'scroll',
      },
      grid: {
        left: 60,
        right: 40,
        top: 80,
        bottom: 50,
      },
      xAxis: {
        type: 'value',
        name: '一爆后时间(秒)',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          formatter: (v) => {
            const prefix = v >= 0 ? '+' : ''
            return `${prefix}${v}s`
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '温度(°C)',
        min: (value) => Math.floor(value.min / 10) * 10,
      },
      series,
    }
  }, [compareData])

  const selectOptions = allRecords.map((r) => ({
    value: r.id,
    label: `${r.green_bean?.origin || '未知'} - ${r.roasting_date} (${r.roast_level || '未定'})`,
  }))

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card title="曲线对比">
        <Space style={{ width: '100%', marginBottom: 16 }} wrap>
          <Select
            mode="multiple"
            placeholder="选择要对比的烘焙记录（至少2条）"
            value={selectedIds}
            onChange={setSelectedIds}
            options={selectOptions}
            style={{ minWidth: 500 }}
            maxTagCount={5}
          />
          <Button
            type="primary"
            icon={<SwapOutlined />}
            onClick={handleCompare}
            loading={loading}
            disabled={selectedIds.length < 2}
          >
            开始对比
          </Button>
        </Space>

        {compareData.length > 0 ? (
          <ReactECharts option={chartOption} style={{ height: 500 }} />
        ) : (
          <Empty description="请选择至少2条烘焙记录进行对比" />
        )}

        {compareData.length > 0 && (
          <Card size="small" title="对比记录概览" style={{ marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(compareData.length, 3)}, 1fr)`, gap: 16 }}>
              {compareData.map((r, idx) => {
                const color = COLORS[idx % COLORS.length]
                const label = r.green_bean
                  ? `${r.green_bean.origin} ${r.roasting_date}`
                  : `记录#${r.id}`
                return (
                  <div key={r.id} style={{ border: `2px solid ${color}`, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 600, color, marginBottom: 8 }}>{label}</div>
                    <div>烘焙度: {r.roast_level || '-'}</div>
                    <div>一爆开始: {formatTime(r.first_crack_start_time)}</div>
                    <div>出锅时间: {formatTime(r.drop_time)}</div>
                    <div>发展时间: {formatTime(r.development_time)}</div>
                    <div>总时间: {formatTime(r.total_time)}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </Card>
    </Space>
  )
}
