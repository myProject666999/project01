import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Popconfirm,
  Space,
  Tag,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getMappings, createMapping, updateMapping, deleteMapping, getHsCodes } from '@/api/hsCode';
import type { CategoryMapping, HSCode } from '@/types';

export default function HsCodeMapping() {
  const [mappings, setMappings] = useState<CategoryMapping[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CategoryMapping | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  const [hsOptions, setHsOptions] = useState<HSCode[]>([]);
  const [hsSearchLoading, setHsSearchLoading] = useState(false);

  const fetchMappings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMappings({ page, pageSize });
      setMappings(res.data.data.list);
      setTotal(res.data.data.total);
    } catch {
      message.error('获取映射列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  const handleHsCodeSearch = async (value: string) => {
    if (!value || value.length < 2) {
      setHsOptions([]);
      return;
    }
    setHsSearchLoading(true);
    try {
      const res = await getHsCodes({ page: 1, pageSize: 20, keyword: value });
      setHsOptions(res.data.data.list);
    } catch {
      setHsOptions([]);
    } finally {
      setHsSearchLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setHsOptions([]);
    setModalOpen(true);
  };

  const openEditModal = (record: CategoryMapping) => {
    setEditingRecord(record);
    form.setFieldsValue({
      category: record.category,
      hs_code: record.hs_code,
      priority: record.priority,
      auto_match: record.auto_match,
    });
    setHsOptions([]);
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (editingRecord) {
        await updateMapping(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createMapping(values);
        message.success('新增成功');
      }
      setModalOpen(false);
      fetchMappings();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(editingRecord ? '更新失败' : '新增失败');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMapping(id);
      message.success('删除成功');
      fetchMappings();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<CategoryMapping> = [
    {
      title: '类目',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: 'HS编码',
      dataIndex: 'hs_code',
      key: 'hs_code',
      render: (text: string) => <span className="font-bold">{text}</span>,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (val: number) => val,
    },
    {
      title: '自动匹配',
      dataIndex: 'auto_match',
      key: 'auto_match',
      width: 100,
      render: (val: boolean, record: CategoryMapping) => (
        <Switch
          checked={val}
          onChange={async (checked) => {
            try {
              await updateMapping(record.id, { auto_match: checked });
              message.success('更新成功');
              fetchMappings();
            } catch {
              message.error('更新失败');
            }
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: CategoryMapping) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除此映射吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          新增映射
        </Button>
      </Space>
      <Table<CategoryMapping>
        rowKey="id"
        columns={columns}
        dataSource={mappings}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          },
        }}
      />

      <Modal
        title={editingRecord ? '编辑映射' : '新增映射'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="category" label="类目" rules={[{ required: true, message: '请输入类目' }]}>
            <Input placeholder="请输入类目" />
          </Form.Item>
          <Form.Item name="hs_code" label="HS编码" rules={[{ required: true, message: '请输入或选择HS编码' }]}>
            <Select
              showSearch
              placeholder="输入搜索HS编码"
              filterOption={false}
              onSearch={handleHsCodeSearch}
              loading={hsSearchLoading}
              notFoundContent={hsSearchLoading ? '搜索中...' : '无匹配结果'}
              options={hsOptions.map((item) => ({
                label: `${item.code} - ${item.description}`,
                value: item.code,
              }))}
            />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true, message: '请输入优先级' }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="请输入优先级" />
          </Form.Item>
          <Form.Item name="auto_match" label="自动匹配" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
