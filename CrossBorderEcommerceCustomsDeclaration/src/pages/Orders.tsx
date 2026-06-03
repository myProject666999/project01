import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
  Drawer,
  Descriptions,
  Dropdown,
  message,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  SyncOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getOrders, syncOrders } from '@/api/order';
import type { GetOrdersParams } from '@/api/order';
import type { Order, OrderItem, PaginatedResponse } from '@/types';
import { unwrap } from '@/api/request';

const { RangePicker } = DatePicker;

const platformOptions = [
  { label: '全部', value: '' },
  { label: 'Shopify', value: 'shopify' },
  { label: 'Amazon', value: 'amazon' },
];

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待处理', value: 'pending' },
  { label: '已匹配', value: 'hs_matched' },
  { label: '已申报', value: 'declared' },
  { label: '已放行', value: 'released' },
  { label: '已退单', value: 'rejected' },
];

const statusTagMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'blue', label: '待处理' },
  hs_matched: { color: 'cyan', label: '已匹配' },
  declared: { color: 'blue', label: '已申报' },
  released: { color: 'green', label: '已放行' },
  rejected: { color: 'red', label: '已退单' },
};

const platformTagMap: Record<string, { color: string; label: string }> = {
  shopify: { color: 'green', label: 'Shopify' },
  amazon: { color: 'orange', label: 'Amazon' },
};

interface FilterState {
  platform: string;
  status: string;
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    platform: '',
    status: '',
    dateRange: null,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetOrdersParams = {
        page,
        pageSize,
        ...(filters.platform ? { platform: filters.platform } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.dateRange?.[0] && filters.dateRange?.[1]
          ? {
              startDate: filters.dateRange[0].format('YYYY-MM-DD'),
              endDate: filters.dateRange[1].format('YYYY-MM-DD'),
            }
          : {}),
      };
      const res = await getOrders(params);
      const data: PaginatedResponse<Order> = unwrap(res);
      setOrders(data.list);
      setTotal(data.total);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const handleReset = () => {
    setFilters({ platform: '', status: '', dateRange: null });
    setPage(1);
  };

  const handleSync = async (platform: string) => {
    setSyncLoading(true);
    try {
      await syncOrders(platform);
      message.success(`${platform === 'shopify' ? 'Shopify' : 'Amazon'}订单同步成功`);
      fetchOrders();
    } catch {
      message.error('订单同步失败，请重试');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleViewDetail = (record: Order) => {
    setCurrentOrder(record);
    setDrawerOpen(true);
  };

  const columns: ColumnsType<Order> = [
    {
      title: '平台订单号',
      dataIndex: 'platform_order_id',
      key: 'platform_order_id',
      width: 180,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (val: string) => {
        const cfg = platformTagMap[val];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : val;
      },
    },
    {
      title: '订单日期',
      dataIndex: 'order_date',
      key: 'order_date',
      width: 130,
      render: (val: string | null) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '客户名称',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 150,
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 150,
      render: (val: number, record: Order) => `${val.toFixed(2)} ${record.currency}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: string) => {
        const cfg = statusTagMap[val];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : val;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Order) => (
        <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
          <EyeOutlined /> 查看详情
        </Button>
      ),
    },
  ];

  const itemColumns: ColumnsType<OrderItem> = [
    { title: '商品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 130 },
    { title: '类目', dataIndex: 'category', key: 'category', width: 100 },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    {
      title: '单价',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      render: (val: number) => val.toFixed(2),
    },
    { title: 'HS编码', dataIndex: 'hs_code', key: 'hs_code', width: 110 },
    { title: '原产国', dataIndex: 'origin_country', key: 'origin_country', width: 90 },
    {
      title: 'HS匹配',
      dataIndex: 'hs_matched',
      key: 'hs_matched',
      width: 90,
      render: (val: boolean) =>
        val ? <Tag color="green">已匹配</Tag> : <Tag color="default">未匹配</Tag>,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Select
            value={filters.platform}
            onChange={(val) => setFilters((f) => ({ ...f, platform: val }))}
            options={platformOptions}
            style={{ width: 130 }}
            placeholder="平台"
          />
          <Select
            value={filters.status}
            onChange={(val) => setFilters((f) => ({ ...f, status: val }))}
            options={statusOptions}
            style={{ width: 130 }}
            placeholder="状态"
          />
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) =>
              setFilters((f) => ({
                ...f,
                dateRange: dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
              }))
            }
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
        <Dropdown
          menu={{
            items: [
              { key: 'shopify', label: '同步Shopify订单' },
              { key: 'amazon', label: '同步Amazon订单' },
            ],
            onClick: ({ key }) => handleSync(key),
          }}
        >
          <Button
            style={{ float: 'right' }}
            icon={<SyncOutlined spin={syncLoading} />}
            loading={syncLoading}
          >
            同步订单
          </Button>
        </Dropdown>
      </Card>

      <Card>
        <Table<Order>
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 条`,
          }}
          onChange={(pagination) => setPage(pagination.current || 1)}
          scroll={{ x: 910 }}
        />
      </Card>

      <Drawer
        title="订单详情"
        open={drawerOpen}
        width={720}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        {currentOrder && (
          <>
            <Descriptions
              title="基本信息"
              column={2}
              bordered
              size="small"
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="平台订单号">
                {currentOrder.platform_order_id}
              </Descriptions.Item>
              <Descriptions.Item label="平台">
                {(() => {
                  const cfg = platformTagMap[currentOrder.platform];
                  return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : currentOrder.platform;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="订单日期">
                {currentOrder.order_date
                  ? dayjs(currentOrder.order_date).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="客户名称">
                {currentOrder.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="订单金额">
                {currentOrder.total_amount.toFixed(2)} {currentOrder.currency}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {(() => {
                  const cfg = statusTagMap[currentOrder.status];
                  return cfg ? (
                    <Tag color={cfg.color}>{cfg.label}</Tag>
                  ) : (
                    currentOrder.status
                  );
                })()}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>订单商品</h4>
              <Table<OrderItem>
                rowKey="id"
                columns={itemColumns}
                dataSource={currentOrder.order_items || []}
                pagination={false}
                size="small"
                scroll={{ x: 890 }}
              />
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
