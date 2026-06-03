import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Drawer,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Space,
  Descriptions,
} from 'antd';
import { DollarOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { getTariffs, getTariff, payTariff, getStatistics } from '@/api/tariff';
import type { GetTariffsParams, TariffStatistics } from '@/api/tariff';
import { unwrap } from '@/api/request';
import type { TariffRecord, TariffItem } from '@/types';

const { RangePicker } = DatePicker;

export default function Tariff() {
  const [records, setRecords] = useState<TariffRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<TariffStatistics>({
    total_tariff: 0,
    paid_tariff: 0,
    unpaid_tariff: 0,
  });
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<TariffRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetTariffsParams = { page, pageSize };
      if (paymentStatus) params.paymentStatus = paymentStatus;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      const res = await getTariffs(params);
      const data = unwrap(res);
      setRecords(data.list);
      setTotal(data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, paymentStatus, dateRange]);

  const fetchStatistics = useCallback(async () => {
    try {
      const params: { startDate?: string; endDate?: string } = {};
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      const res = await getStatistics(params);
      setStatistics(unwrap(res));
    } catch {
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSearch = () => {
    setPage(1);
    fetchRecords();
    fetchStatistics();
  };

  const handleViewDetail = async (record: TariffRecord) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await getTariff(record.id);
      setDetail(unwrap(res));
    } catch {
      setDetail(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePay = async (id: number) => {
    try {
      await payTariff(id);
      message.success('缴纳成功');
      fetchRecords();
      fetchStatistics();
    } catch {
    }
  };

  const columns: ColumnsType<TariffRecord> = [
    { title: '申报编号', dataIndex: 'declaration_no', key: 'declaration_no' },
    {
      title: '税费金额',
      dataIndex: 'tariff_amount',
      key: 'tariff_amount',
      render: (val: number) => val?.toFixed(2),
    },
    { title: '币种', dataIndex: 'currency', key: 'currency' },
    {
      title: '缴纳状态',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) =>
        status === 'paid' ? (
          <Tag color="green">已缴纳</Tag>
        ) : (
          <Tag color="red">未缴纳</Tag>
        ),
    },
    {
      title: '缴纳日期',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (val: string | null) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TariffRecord) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            查看详情
          </Button>
          {record.payment_status === 'unpaid' && (
            <Popconfirm
              title="确认缴纳"
              description="确定要缴纳该笔关税吗？"
              onConfirm={() => handlePay(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger>
                确认缴纳
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns: ColumnsType<TariffItem> = [
    { title: 'HS编码', dataIndex: 'hs_code', key: 'hs_code' },
    { title: '税种', dataIndex: 'tax_type', key: 'tax_type' },
    {
      title: '税率(%)',
      dataIndex: 'tax_rate',
      key: 'tax_rate',
      render: (val: number) => val?.toFixed(2),
    },
    {
      title: '计税金额',
      dataIndex: 'taxable_amount',
      key: 'taxable_amount',
      render: (val: number) => val?.toFixed(2),
    },
    {
      title: '税额',
      dataIndex: 'tax_amount',
      key: 'tax_amount',
      render: (val: number) => val?.toFixed(2),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总税费金额"
              value={statistics.total_tariff}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已缴纳"
              value={statistics.paid_tariff}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="未缴纳"
              value={statistics.unpaid_tariff}
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            placeholder="缴纳状态"
            allowClear
            style={{ width: 140 }}
            value={paymentStatus}
            onChange={setPaymentStatus}
            options={[
              { label: '全部', value: undefined },
              { label: '已缴纳', value: 'paid' },
              { label: '未缴纳', value: 'unpaid' },
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
        </Space>

        <Table<TariffRecord>
          rowKey="id"
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <Drawer
        title="税费详情"
        width={640}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDetail(null);
        }}
        loading={detailLoading}
      >
        {detail && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="申报编号">{detail.declaration_no}</Descriptions.Item>
              <Descriptions.Item label="税费金额">{detail.tariff_amount?.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="缴纳状态">
                {detail.payment_status === 'paid' ? (
                  <Tag color="green">已缴纳</Tag>
                ) : (
                  <Tag color="red">未缴纳</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="缴纳日期">
                {detail.payment_date ? dayjs(detail.payment_date).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Table<TariffItem>
              rowKey="id"
              columns={itemColumns}
              dataSource={detail.tariff_items || []}
              pagination={false}
              size="small"
              summary={() => {
                const totalAmount = (detail.tariff_items || []).reduce(
                  (sum, item) => sum + (item.tax_amount || 0),
                  0,
                );
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      <strong>合计</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>{totalAmount.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
