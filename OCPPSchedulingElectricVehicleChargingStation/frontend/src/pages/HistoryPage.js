import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Empty } from 'antd';
import { HistoryOutlined, ThunderboltOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { chargeAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await chargeAPI.getTransactions();
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error('Load history error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'completed':
        return <Tag color="green">已完成</Tag>;
      case 'active':
        return <Tag color="blue">充电中</Tag>;
      case 'starting':
        return <Tag color="gold">启动中</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <div className="page-container">
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>
          <HistoryOutlined /> 充电记录
        </Title>

        {transactions.length === 0 && !loading ? (
          <Empty description="暂无充电记录" />
        ) : (
          <List
            loading={loading}
            dataSource={transactions}
            renderItem={tx => (
              <List.Item
                actions={[getStatusTag(tx.status)]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ThunderboltOutlined style={{ color: '#52c41a' }} />
                      <Text strong>{tx.transaction_id}</Text>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 24, marginBottom: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined style={{ fontSize: 12 }} />
                          {tx.start_time ? dayjs(tx.start_time).format('YYYY-MM-DD HH:mm') : '-'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ThunderboltOutlined style={{ fontSize: 12 }} />
                          {tx.consumed_kwh?.toFixed(2) || 0} kWh
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <DollarOutlined style={{ fontSize: 12 }} />
                          ¥{tx.amount?.toFixed(2) || 0}
                        </span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

export default HistoryPage;
