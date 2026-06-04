import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  Space,
  message,
} from 'antd';
import { PlusOutlined, SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getHsCodes,
  createHsCode,
  updateHsCode,
  autoMatch,
  getUnmatchedItems,
  manualMatch,
} from '@/api/hsCode';
import type { HSCode, OrderItem } from '@/types';

const CATEGORY_OPTIONS = [
  '食品', '饮料', '化妆品', '服装', '鞋帽',
  '箱包', '电子产品', '家居用品', '玩具', '保健品',
  '母婴用品', '图书', '文具', '运动户外', '其他',
];

export default function HsCodes() {
  const [activeTab, setActiveTab] = useState('dictionary');
  const [hsCodes, setHsCodes] = useState<HSCode[]>([]);
  const [hsTotal, setHsTotal] = useState(0);
  const [hsLoading, setHsLoading] = useState(false);
  const [hsPage, setHsPage] = useState(1);
  const [hsPageSize, setHsPageSize] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [keywordFilter, setKeywordFilter] = useState('');

  const [unmatchedItems, setUnmatchedItems] = useState<OrderItem[]>([]);
  const [unmatchedTotal, setUnmatchedTotal] = useState(0);
  const [unmatchedLoading, setUnmatchedLoading] = useState(false);
  const [unmatchedPage, setUnmatchedPage] = useState(1);
  const [unmatchedPageSize, setUnmatchedPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HSCode | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [matchTarget, setMatchTarget] = useState<OrderItem | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchForm] = Form.useForm();
  const [searchResults, setSearchResults] = useState<HSCode[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchHsCodes = useCallback(async () => {
    setHsLoading(true);
    try {
      const res = await getHsCodes({
        page: hsPage,
        pageSize: hsPageSize,
        category: categoryFilter,
        keyword: keywordFilter || undefined,
      });
      setHsCodes(res.data.data.list);
      setHsTotal(res.data.data.total);
    } catch {
      message.error('获取HS编码列表失败');
    } finally {
      setHsLoading(false);
    }
  }, [hsPage, hsPageSize, categoryFilter, keywordFilter]);

  const fetchUnmatched = useCallback(async () => {
    setUnmatchedLoading(true);
    try {
      const res = await getUnmatchedItems({
        page: unmatchedPage,
        pageSize: unmatchedPageSize,
      });
      setUnmatchedItems(res.data.data.list);
      setUnmatchedTotal(res.data.data.total);
    } catch {
      message.error('获取未匹配商品列表失败');
    } finally {
      setUnmatchedLoading(false);
    }
  }, [unmatchedPage, unmatchedPageSize]);

  useEffect(() => {
    fetchHsCodes();
  }, [fetchHsCodes]);

  useEffect(() => {
    if (activeTab === 'unmatched') {
      fetchUnmatched();
    }
  }, [activeTab, fetchUnmatched]);

  const handleAutoMatch = async () => {
    try {
      const res = await autoMatch();
      message.success(res.data.message || '自动匹配完成');
      if (activeTab === 'unmatched') {
        fetchUnmatched();
      }
      fetchHsCodes();
    } catch {
      message.error('自动匹配失败');
    }
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: HSCode) => {
    setEditingRecord(record);
    setModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue({
        code: record.code,
        description: record.description,
        category: record.category,
        tax_rate: record.tax_rate,
        unit: record.unit,
        remark: record.remark,
      });
    }, 0);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (editingRecord) {
        await updateHsCode(editingRecord.code, values);
        message.success('更新成功');
      } else {
        await createHsCode(values);
        message.success('新增成功');
      }
      setModalOpen(false);
      fetchHsCodes();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(editingRecord ? '更新失败' : '新增失败');
    } finally {
      setModalLoading(false);
    }
  };

  const openMatchModal = (record: OrderItem) => {
    setMatchTarget(record);
    matchForm.resetFields();
    setSearchResults([]);
    setMatchModalOpen(true);
  };

  const handleHsCodeSearch = async (value: string) => {
    if (!value || value.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await getHsCodes({ page: 1, pageSize: 20, keyword: value });
      setSearchResults(res.data.data.list);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleMatchOk = async () => {
    try {
      const values = await matchForm.validateFields();
      setMatchLoading(true);
      await manualMatch(matchTarget!.id, values.hs_code);
      message.success('指定编码成功');
      setMatchModalOpen(false);
      fetchUnmatched();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error('指定编码失败');
    } finally {
      setMatchLoading(false);
    }
  };

  const hsColumns: ColumnsType<HSCode> = [
    {
      title: 'HS编码',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (text: string) => <span className="font-bold">{text}</span>,
    },
    { title: '商品描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '类目',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '税率',
      dataIndex: 'tax_rate',
      key: 'tax_rate',
      width: 100,
      render: (val: number) => `${val}%`,
    },
    { title: '计量单位', dataIndex: 'unit', key: 'unit', width: 100 },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: HSCode) => (
        <Button type="link" size="small" onClick={() => openEditModal(record)}>
          编辑
        </Button>
      ),
    },
  ];

  const unmatchedColumns: ColumnsType<OrderItem> = [
    { title: '商品名称', dataIndex: 'product_name', key: 'product_name', ellipsis: true },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 140 },
    {
      title: '类目',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text: string) => <Tag>{text}</Tag>,
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    {
      title: '单价',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      render: (val: number) => `¥${val.toFixed(2)}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: OrderItem) => (
        <Button type="link" size="small" onClick={() => openMatchModal(record)}>
          指定编码
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'dictionary',
            label: 'HS编码字典',
            children: (
              <>
                <Space style={{ marginBottom: 16 }} wrap>
                  <Select
                    allowClear
                    placeholder="选择类目"
                    style={{ width: 160 }}
                    value={categoryFilter}
                    onChange={(val) => {
                      setCategoryFilter(val);
                      setHsPage(1);
                    }}
                    options={CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))}
                  />
                  <Input.Search
                    placeholder="搜索编码或描述"
                    allowClear
                    style={{ width: 240 }}
                    onSearch={(val) => {
                      setKeywordFilter(val);
                      setHsPage(1);
                    }}
                    prefix={<SearchOutlined />}
                  />
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                    新增编码
                  </Button>
                  <Button icon={<ThunderboltOutlined />} onClick={handleAutoMatch}>
                    自动匹配
                  </Button>
                </Space>
                <Table<HSCode>
                  rowKey="id"
                  columns={hsColumns}
                  dataSource={hsCodes}
                  loading={hsLoading}
                  pagination={{
                    current: hsPage,
                    pageSize: hsPageSize,
                    total: hsTotal,
                    showSizeChanger: true,
                    onChange: (page, size) => {
                      setHsPage(page);
                      setHsPageSize(size);
                    },
                  }}
                />
              </>
            ),
          },
          {
            key: 'unmatched',
            label: '未匹配商品',
            children: (
              <Table<OrderItem>
                rowKey="id"
                columns={unmatchedColumns}
                dataSource={unmatchedItems}
                loading={unmatchedLoading}
                pagination={{
                  current: unmatchedPage,
                  pageSize: unmatchedPageSize,
                  total: unmatchedTotal,
                  showSizeChanger: true,
                  onChange: (page, size) => {
                    setUnmatchedPage(page);
                    setUnmatchedPageSize(size);
                  },
                }}
              />
            ),
          },
        ]}
      />

      <Modal
        title={editingRecord ? '编辑HS编码' : '新增HS编码'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false} initialValues={editingRecord || {}}>
          <Form.Item
            name="code"
            label="HS编码"
            rules={[{ required: !editingRecord, message: '请输入HS编码' }]}
          >
            <Input disabled={!!editingRecord} placeholder="请输入HS编码" />
          </Form.Item>
          <Form.Item name="description" label="商品描述" rules={[{ required: true, message: '请输入商品描述' }]}>
            <Input.TextArea rows={2} placeholder="请输入商品描述" />
          </Form.Item>
          <Form.Item name="category" label="类目" rules={[{ required: true, message: '请选择类目' }]}>
            <Select placeholder="请选择类目" options={CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item name="tax_rate" label="税率(%)" rules={[{ required: true, message: '请输入税率' }]}>
            <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} placeholder="请输入税率" />
          </Form.Item>
          <Form.Item name="unit" label="计量单位" rules={[{ required: true, message: '请输入计量单位' }]}>
            <Input placeholder="请输入计量单位" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`指定编码 - ${matchTarget?.product_name ?? ''}`}
        open={matchModalOpen}
        onOk={handleMatchOk}
        onCancel={() => setMatchModalOpen(false)}
        confirmLoading={matchLoading}
        destroyOnClose
      >
        <Form form={matchForm} layout="vertical" preserve={false}>
          <Form.Item name="hs_code" label="HS编码" rules={[{ required: true, message: '请输入或选择HS编码' }]}>
            <Select
              showSearch
              placeholder="输入搜索HS编码"
              filterOption={false}
              onSearch={handleHsCodeSearch}
              loading={searchLoading}
              notFoundContent={searchLoading ? '搜索中...' : '无匹配结果'}
              options={searchResults.map((item) => ({
                label: `${item.code} - ${item.description}`,
                value: item.code,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
