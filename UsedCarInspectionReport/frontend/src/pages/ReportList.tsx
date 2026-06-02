import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  message,
  Card,
  Select,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  ShareAltOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../services/api';
import { InspectionReport } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;

const ReportList: React.FC = () => {
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('');
  const navigate = useNavigate();

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await reportApi.getList({
        page,
        pageSize,
        keyword,
        status: status || undefined,
      });
      if (response.code === 200) {
        setReports(response.data.list);
        setTotal(response.data.total);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [page, status]);

  const handleSearch = () => {
    setPage(1);
    loadReports();
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定删除吗？',
      onOk: async () => {
        try {
          await reportApi.delete(id);
          message.success('删除成功');
          loadReports();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleShare = async (id: number) => {
    try {
      const response = await reportApi.generateShareLink(id);
      if (response.code === 200) {
        const shareUrl = `${window.location.origin}/share/${response.data.shareToken}`;
        Modal.success({
          title: '分享链接已生成',
          content: (
            <div>
              <p>链接有效期30天</p>
              <Input.TextArea
                value={shareUrl}
                readOnly
                autoSize
              />
              <Button
                type="primary"
                style={{ marginTop: 8 }}
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  message.success('已复制到剪贴板');
                }}
              >
                复制链接
              </Button>
            </div>
          ),
        });
      }
    } catch (error) {
      message.error('生成分享链接失败');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      submitted: { color: 'success', text: '已提交' },
      expired: { color: 'warning', text: '已过期' },
    };
    const info = statusMap[status] || { color: 'default', text: status };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const getLevelTag = (level: string) => {
    const levelMap: Record<string, string> = {
      A: 'success',
      B: 'blue',
      C: 'orange',
      D: 'red',
    };
    return <Tag color={levelMap[level] || 'default'}>{level}级</Tag>;
  };

  const columns = [
    {
      title: '报告编号',
      dataIndex: 'reportNo',
      key: 'reportNo',
      width: 180,
    },
    {
      title: '车辆信息',
      key: 'vehicle',
      render: (_: any, record: InspectionReport) => (
        record.vehicle ? (
          <div>
            <div>{record.vehicle.brand} {record.vehicle.model}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {record.vehicle.licensePlate || record.vehicle.vin}
            </div>
          </div>
        ) : '-'
      ),
    },
    {
      title: '综合评分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 120,
      render: (score: number, record: InspectionReport) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{score?.toFixed(1) || '-'}</div>
          {record.level && getLevelTag(record.level)}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '检测员',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 100,
      render: (inspector: any) => inspector?.realName || '-',
    },
    {
      title: '检测日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: any, record: InspectionReport) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/reports/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'submitted' && (
            <Button
              type="link"
              size="small"
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(record.id)}
            >
              分享
            </Button>
          )}
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="检测报告列表">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="搜索报告编号、车辆信息"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
            />
            <Select
              placeholder="状态筛选"
              value={status || undefined}
              onChange={(v) => { setStatus(v); setPage(1); }}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="draft">草稿</Option>
              <Option value="submitted">已提交</Option>
              <Option value="expired">已过期</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/')}>
            新建检测
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
          }}
        />
      </Card>
    </div>
  );
};

export default ReportList;
