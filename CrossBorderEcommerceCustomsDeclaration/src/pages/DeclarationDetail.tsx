import { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Table,
  Button,
  Tag,
  Descriptions,
  Alert,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Spin,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import {
  getDeclaration,
  submitDeclaration,
  resubmitDeclaration,
  updateDeclarationItem,
} from '@/api/declaration';
import type { Declaration, DeclarationItem } from '@/types';

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  submitted: 'blue',
  reviewing: 'orange',
  released: 'green',
  rejected: 'red',
};

const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '草稿',
  submitted: '已申报',
  reviewing: '审核中',
  released: '已放行',
  rejected: '已退单',
};

const STEP_ITEMS = [
  { title: '草稿' },
  { title: '已申报' },
  { title: '审核中' },
  { title: '已放行' },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'draft':
      return 0;
    case 'submitted':
      return 1;
    case 'reviewing':
      return 2;
    case 'released':
      return 3;
    case 'rejected':
      return 2;
    default:
      return 0;
  }
}

export default function DeclarationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DeclarationItem | null>(null);
  const [editForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchDeclaration = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getDeclaration(Number(id));
      if (res.data.code === 0) {
        setDeclaration(res.data.data);
      }
    } catch {
      message.error('获取申报详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclaration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async () => {
    if (!declaration) return;
    try {
      const res = await submitDeclaration(declaration.id);
      if (res.data.code === 0) {
        message.success('提交申报成功');
        fetchDeclaration();
      } else {
        message.error(res.data.message || '提交失败');
      }
    } catch {
      message.error('提交申报失败');
    }
  };

  const handleResubmit = async () => {
    if (!declaration) return;
    try {
      const res = await resubmitDeclaration(declaration.id);
      if (res.data.code === 0) {
        message.success('重新申报成功');
        fetchDeclaration();
      } else {
        message.error(res.data.message || '重新申报失败');
      }
    } catch {
      message.error('重新申报失败');
    }
  };

  const openEditModal = (item: DeclarationItem) => {
    setEditingItem(item);
    editForm.setFieldsValue(item);
    setEditModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!declaration || !editingItem) return;
    try {
      const values = await editForm.validateFields();
      setSaving(true);
      const res = await updateDeclarationItem(declaration.id, editingItem.id, values);
      if (res.data.code === 0) {
        message.success('更新申报项成功');
        setEditModalVisible(false);
        fetchDeclaration();
      } else {
        message.error(res.data.message || '更新失败');
      }
    } catch {
      message.error('更新申报项失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!declaration) {
    return <Card>未找到申报记录</Card>;
  }

  const itemColumns: ColumnsType<DeclarationItem> = [
    { title: '商品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: 'HS编码', dataIndex: 'hs_code', key: 'hs_code' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '单价',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (val: number) => `¥${val?.toFixed(2)}`,
    },
    { title: '原产国', dataIndex: 'origin_country', key: 'origin_country' },
    {
      title: '申报金额',
      dataIndex: 'declaration_amount',
      key: 'declaration_amount',
      render: (val: number) => `¥${val?.toFixed(2)}`,
    },
    { title: '税号', dataIndex: 'tax_no', key: 'tax_no' },
  ];

  if (declaration.status === 'rejected') {
    itemColumns.push({
      title: '操作',
      key: 'action',
      render: (_: unknown, record: DeclarationItem) => (
        <Button type="link" onClick={() => openEditModal(record)}>
          编辑
        </Button>
      ),
    });
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Steps
          current={getStepIndex(declaration.status)}
          status={declaration.status === 'rejected' ? 'error' : 'process'}
          items={
            declaration.status === 'rejected'
              ? STEP_ITEMS.map((item, idx) =>
                  idx === 3 ? { title: '已退单', description: declaration.reject_type } : item
                )
              : STEP_ITEMS
          }
        />
      </Card>

      {declaration.status === 'rejected' && (
        <Alert
          message="申报被退单"
          description={
            <div>
              <p>
                <strong>退单类型：</strong>
                {declaration.reject_type || '-'}
              </p>
              <p>
                <strong>退单原因：</strong>
                {declaration.reject_reason || '-'}
              </p>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card title="申报信息" style={{ marginBottom: 16 }}>
        <Descriptions column={3} bordered size="small">
          <Descriptions.Item label="申报编号">
            {declaration.declaration_no}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={STATUS_COLOR_MAP[declaration.status]}>
              {STATUS_LABEL_MAP[declaration.status] || declaration.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="申报金额">
            ¥{declaration.total_amount?.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="商品数量">
            {declaration.total_quantity}
          </Descriptions.Item>
          <Descriptions.Item label="提交时间">
            {declaration.submitted_at
              ? dayjs(declaration.submitted_at).format('YYYY-MM-DD HH:mm')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(declaration.created_at).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          {declaration.status === 'draft' && (
            <Button type="primary" onClick={handleSubmit}>
              提交申报
            </Button>
          )}
          {declaration.status === 'rejected' && (
            <Button type="primary" onClick={handleResubmit}>
              重新申报
            </Button>
          )}
        </div>
      </Card>

      <Card title="申报商品明细" style={{ marginBottom: 16 }}>
        <Table
          rowKey="id"
          columns={itemColumns}
          dataSource={declaration.declaration_items || []}
          pagination={false}
          size="small"
        />
      </Card>

      {declaration.status === 'released' && (
        <Card title="关联信息" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>关税记录：</strong>
              <a onClick={() => navigate('/tariff')}>查看关税记录</a>
            </div>
            <div>
              <strong>归档信息：</strong>
              <a onClick={() => navigate('/archive')}>查看归档</a>
            </div>
          </Space>
        </Card>
      )}

      <Modal
        title="编辑申报项"
        open={editModalVisible}
        onOk={handleSaveItem}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={saving}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="product_name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="hs_code" label="HS编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit_price" label="单价" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="origin_country" label="原产国">
            <Input />
          </Form.Item>
          <Form.Item name="declaration_amount" label="申报金额" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tax_no" label="税号">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
