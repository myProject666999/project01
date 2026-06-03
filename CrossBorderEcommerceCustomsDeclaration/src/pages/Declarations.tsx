import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Select, DatePicker, Button, Tag, Modal, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { getDeclarations, submitDeclaration, resubmitDeclaration } from '@/api/declaration';
import type { GetDeclarationsParams } from '@/api/declaration';
import type { Declaration } from '@/types';

const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已申报', value: 'submitted' },
  { label: '审核中', value: 'reviewing' },
  { label: '已放行', value: 'released' },
  { label: '已退单', value: 'rejected' },
];

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

export default function Declarations() {
  const navigate = useNavigate();
  const [data, setData] = useState<Declaration[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentReject, setCurrentReject] = useState<Declaration | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetDeclarationsParams = { page, pageSize };
      if (status) params.status = status;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      const res = await getDeclarations(params);
      if (res.data.code === 0) {
        setData(res.data.data.list);
        setTotal(res.data.data.total);
      }
    } catch {
      message.error('获取申报列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (id: number) => {
    try {
      const res = await submitDeclaration(id);
      if (res.data.code === 0) {
        message.success('提交申报成功');
        fetchData();
      } else {
        message.error(res.data.message || '提交失败');
      }
    } catch {
      message.error('提交申报失败');
    }
  };

  const handleResubmit = async (id: number) => {
    try {
      const res = await resubmitDeclaration(id);
      if (res.data.code === 0) {
        message.success('重新申报成功');
        fetchData();
      } else {
        message.error(res.data.message || '重新申报失败');
      }
    } catch {
      message.error('重新申报失败');
    }
  };

  const handleReset = () => {
    setStatus('');
    setDateRange(null);
    setPage(1);
  };

  const showRejectDetail = (record: Declaration) => {
    setCurrentReject(record);
    setRejectModalVisible(true);
  };

  const columns: ColumnsType<Declaration> = [
    {
      title: '申报编号',
      dataIndex: 'declaration_no',
      key: 'declaration_no',
      render: (text: string, record: Declaration) => (
        <a onClick={() => navigate(`/declarations/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLOR_MAP[status] || 'default'}>
          {STATUS_LABEL_MAP[status] || status}
        </Tag>
      ),
    },
    {
      title: '申报金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val: number) => `¥${val?.toFixed(2)}`,
    },
    {
      title: '商品数量',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
    },
    {
      title: '驳回原因',
      dataIndex: 'reject_reason',
      key: 'reject_reason',
      render: (text: string, record: Declaration) =>
        record.status === 'rejected' ? text : '-',
    },
    {
      title: '提交时间',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (text: string | null) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Declaration) => {
        switch (record.status) {
          case 'draft':
            return (
              <Button type="link" onClick={() => handleSubmit(record.id)}>
                提交申报
              </Button>
            );
          case 'submitted':
          case 'reviewing':
          case 'released':
            return (
              <Button type="link" onClick={() => navigate(`/declarations/${record.id}`)}>
                查看
              </Button>
            );
          case 'rejected':
            return (
              <Space>
                <Button type="link" onClick={() => showRejectDetail(record)}>
                  查看退单原因
                </Button>
                <Button type="link" onClick={() => handleResubmit(record.id)}>
                  重新申报
                </Button>
              </Space>
            );
          default:
            return null;
        }
      },
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            style={{ width: 140 }}
            placeholder="申报状态"
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchData}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/declarations/new')}
            style={{ marginLeft: 'auto' }}
          >
            新建申报
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/declarations/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <Modal
        title="退单原因"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
      >
        {currentReject && (
          <div>
            <p>
              <strong>退单类型：</strong>
              {currentReject.reject_type || '-'}
            </p>
            <p>
              <strong>退单原因：</strong>
              {currentReject.reject_reason || '-'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
