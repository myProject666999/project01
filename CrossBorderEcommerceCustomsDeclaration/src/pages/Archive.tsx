import { useCallback, useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Drawer, Pagination, Descriptions, Empty, Spin, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { getArchives, getArchive } from '@/api/archive';
import type { GetArchivesParams } from '@/api/archive';
import { unwrap } from '@/api/request';
import type { CustomsArchive } from '@/types';
import dayjs from 'dayjs';

const statusMap: Record<string, { color: string; label: string }> = {
  archived: { color: 'gold', label: '已存档' },
  pending: { color: 'blue', label: '待存档' },
};

export default function Archive() {
  const [archives, setArchives] = useState<CustomsArchive[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<CustomsArchive | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchArchives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: GetArchivesParams = { page, pageSize };
      const res = await getArchives(params);
      const data = unwrap(res);
      if (data && data.list !== undefined) {
        setArchives(data.list);
        setTotal(data.total || 0);
      } else {
        setArchives([]);
        setTotal(0);
      }
    } catch (e: any) {
      setError(e?.message || '加载数据失败');
      setArchives([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const handleClickCard = async (record: CustomsArchive) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await getArchive(record.id);
      setDetail(unwrap(res));
    } catch {
      setDetail(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#999' }}>加载中...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Alert type="error" message={error} showIcon />
        </div>
      );
    }

    if (archives.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Empty
            image={<InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description="暂无报关单存档数据"
          >
            <div style={{ color: '#999', fontSize: 13, marginTop: 8 }}>
              申报放行后会自动生成归档记录
            </div>
          </Empty>
        </div>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {archives.map((item) => {
          const st = statusMap[item.status] || { color: 'default', label: item.status };
          return (
            <Col span={8} key={item.id}>
              <Card
                hoverable
                style={{ borderTop: '3px solid #D4A843' }}
                onClick={() => handleClickCard(item)}
              >
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                  {item.archive_no}
                </div>
                <div style={{ color: '#666', marginBottom: 4 }}>
                  申报编号：{item.declaration_no}
                </div>
                <div style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>
                  {dayjs(item.archive_date).format('YYYY-MM-DD')}
                </div>
                <Tag color={st.color}>{st.label}</Tag>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <div>
      {renderContent()}

      {total > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
          />
        </div>
      )}

      <Drawer
        title="存档详情"
        width={560}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDetail(null);
        }}
        loading={detailLoading}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="存档编号">{detail.archive_no}</Descriptions.Item>
            <Descriptions.Item label="申报编号">{detail.declaration_no}</Descriptions.Item>
            <Descriptions.Item label="存档日期">
              {dayjs(detail.archive_date).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="文档地址">{detail.document_url}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {(() => {
                const st = statusMap[detail.status] || { color: 'default', label: detail.status };
                return <Tag color={st.color}>{st.label}</Tag>;
              })()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
