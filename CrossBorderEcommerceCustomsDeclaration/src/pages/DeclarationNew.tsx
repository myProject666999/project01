import { useState, useEffect } from 'react';
import { Card, Steps, Table, Button, Space, message, Descriptions, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { createDeclaration } from '@/api/declaration';
import { getOrders } from '@/api/order';
import type { Order, OrderItem } from '@/types';

export default function DeclarationNew() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders({ page: 1, pageSize: 100, status: 'hs_matched' });
      if (res.data.code === 0) {
        setOrders(res.data.data.list);
      }
    } catch {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.id));

  const allItems = selectedOrders.flatMap(
    (o) => (o.order_items || []) as OrderItem[]
  );

  const totalAmount = allItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const totalQuantity = allItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCreate = async () => {
    if (selectedOrderIds.length === 0) {
      message.warning('请至少选择一个订单');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createDeclaration({ order_ids: selectedOrderIds });
      if (res.data.code === 0) {
        message.success('创建申报成功');
        navigate('/declarations');
      } else {
        message.error(res.data.message || '创建申报失败');
      }
    } catch {
      message.error('创建申报失败');
    } finally {
      setSubmitting(false);
    }
  };

  const orderColumns: ColumnsType<Order> = [
    {
      title: '平台订单号',
      dataIndex: 'platform_order_id',
      key: 'platform_order_id',
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: '客户名称',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val: number) => `¥${val?.toFixed(2)}`,
    },
    {
      title: '订单日期',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (val: string | null) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
  ];

  const itemColumns: ColumnsType<OrderItem> = [
    { title: '商品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'HS编码', dataIndex: 'hs_code', key: 'hs_code' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '单价',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (val: number) => `¥${val?.toFixed(2)}`,
    },
    {
      title: '金额',
      key: 'amount',
      render: (_: unknown, record: OrderItem) =>
        `¥${(record.quantity * record.unit_price).toFixed(2)}`,
    },
    { title: '原产国', dataIndex: 'origin_country', key: 'origin_country' },
  ];

  return (
    <div>
      <Card>
        <Steps
          current={current}
          onChange={setCurrent}
          items={[
            { title: '选择订单' },
            { title: '确认申报信息' },
            { title: '提交' },
          ]}
          style={{ marginBottom: 24 }}
        />

        {current === 0 && (
          <>
            <Table
              rowKey="id"
              columns={orderColumns}
              dataSource={orders}
              loading={loading}
              rowSelection={{
                selectedRowKeys: selectedOrderIds,
                onChange: (keys) => setSelectedOrderIds(keys as number[]),
              }}
              pagination={false}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button
                type="primary"
                disabled={selectedOrderIds.length === 0}
                onClick={() => setCurrent(1)}
              >
                下一步：确认申报信息
              </Button>
            </div>
          </>
        )}

        {current === 1 && (
          <>
            {selectedOrders.map((order) => (
              <Card
                key={order.id}
                title={`订单: ${order.platform_order_id}`}
                size="small"
                style={{ marginBottom: 12 }}
              >
                <Descriptions column={3} size="small">
                  <Descriptions.Item label="平台">{order.platform}</Descriptions.Item>
                  <Descriptions.Item label="客户">{order.customer_name}</Descriptions.Item>
                  <Descriptions.Item label="金额">
                    ¥{order.total_amount?.toFixed(2)}
                  </Descriptions.Item>
                </Descriptions>
                <Table
                  rowKey="id"
                  columns={itemColumns}
                  dataSource={order.order_items || []}
                  pagination={false}
                  size="small"
                />
              </Card>
            ))}
            <Divider />
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="商品总数">{totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="申报总金额">
                ¥{totalAmount.toFixed(2)}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setCurrent(0)}>上一步</Button>
                <Button type="primary" onClick={() => setCurrent(2)}>
                  下一步：提交
                </Button>
              </Space>
            </div>
          </>
        )}

        {current === 2 && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="选中订单数">
                {selectedOrderIds.length}
              </Descriptions.Item>
              <Descriptions.Item label="商品总数">{totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="申报总金额" span={2}>
                ¥{totalAmount.toFixed(2)}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setCurrent(1)}>上一步</Button>
                <Button
                  type="primary"
                  loading={submitting}
                  onClick={handleCreate}
                >
                  确认提交申报
                </Button>
              </Space>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
