import { useCallback, useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Drawer, Pagination, Descriptions } from 'antd';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<CustomsArchive | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchArchives = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetArchivesParams = { page, pageSize };
      const res = await getArchives(params);
      const data = unwrap(res);
      setArchives(data.list);
      setTotal(data.total);
    } catch {
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

  return (
    <div>
      <Row gutter={[16, 16]}>
        {archives.map((item) => {
          const st = statusMap[item.status] || { color: 'default', label: item.status };
          return (
            <Col span={8} key={item.id}>
              <Card
                hoverable
                loading={loading}
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
