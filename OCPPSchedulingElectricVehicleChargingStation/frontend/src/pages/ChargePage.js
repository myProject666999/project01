import React, { useState, useEffect } from 'react';
import { Card, Button, Statistic, Progress, message, Space, Typography, Empty } from 'antd';
import { ThunderboltOutlined, PauseOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { chargeAPI, paymentAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function ChargePage() {
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [chargingData, setChargingData] = useState({
    kwh: 0,
    amount: 0,
    duration: 0
  });
  const [stopping, setStopping] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [balance, setBalance] = useState(0);
  const timerRef = React.useRef(null);

  useEffect(() => {
    loadTransactions();
    loadBalance();
    timerRef.current = setInterval(loadTransactions, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const loadBalance = async () => {
    try {
      const res = await paymentAPI.getBalance();
      setBalance(res.data.balance);
    } catch (error) {
      console.error('Load balance error');
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await chargeAPI.getTransactions();
      const txs = res.data.transactions;
      const activeTx = txs.find(tx => tx.status === 'active' || tx.status === 'starting');
      
      if (activeTx) {
        setCurrentTransaction(activeTx);
        const detailRes = await chargeAPI.getTransaction(activeTx.transaction_id);
        const detail = detailRes.data.transaction;
        setChargingData({
          kwh: detail.consumed_kwh || 0,
          amount: detail.amount || 0,
          duration: detail.start_time ? dayjs().diff(dayjs(detail.start_time), 'minute') : 0
        });
      } else {
        const completedTx = txs.find(tx => tx.status === 'completed');
        if (completedTx && !currentTransaction) {
          setCurrentTransaction(completedTx);
          setChargingData({
            kwh: completedTx.consumed_kwh || 0,
            amount: completedTx.amount || 0,
            duration: 0
          });
        } else if (!completedTx) {
          setCurrentTransaction(null);
        }
      }
    } catch (error) {
      console.error('Load transactions error');
    }
  };

  const handleStopCharge = async () => {
    if (!currentTransaction) return;
    setStopping(true);
    try {
      await chargeAPI.stopCharge(currentTransaction.transaction_id);
      message.success('停止充电指令已发送');
      clearInterval(timerRef.current);
      setTimeout(() => {
        loadTransactions();
        setShowPayment(true);
      }, 2000);
    } catch (error) {
      message.error(error.response?.data?.error || '停止失败');
    } finally {
      setStopping(false);
    }
  };

  const handlePay = async () => {
    if (!currentTransaction) return;
    try {
      await paymentAPI.pay(currentTransaction.transaction_id);
      message.success('支付成功');
      setShowPayment(false);
      setCurrentTransaction(null);
      loadBalance();
    } catch (error) {
      message.error(error.response?.data?.error || '支付失败');
    }
  };

  if (!currentTransaction) {
    return (
      <div className="page-container">
        <Card>
          <Empty
            description="当前没有进行中的充电"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => window.location.href = '/map'}>
              去找充电桩
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const isCharging = currentTransaction.status === 'active' || currentTransaction.status === 'starting';

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <ThunderboltOutlined /> 充电中
      </Title>

      <Card className="charging-live">
        <div className="charging-card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div className="charging-value">{chargingData.kwh.toFixed(2)}</div>
              <div className="charging-label">kWh 已充电</div>
            </div>
            <div>
              <div className="charging-value">¥{chargingData.amount.toFixed(2)}</div>
              <div className="charging-label">预估金额</div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ClockCircleOutlined />
              <span>充电时长: {Math.floor(chargingData.duration / 60)}小时 {chargingData.duration % 60}分钟</span>
            </div>
            <Progress 
              percent={isCharging ? 99 : 100} 
              status={isCharging ? 'active' : 'success'}
              strokeColor="#52c41a"
            />
          </div>
        </div>

        <Card size="small" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">订单号</Text>
              <Text code>{currentTransaction.transaction_id}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">开始时间</Text>
              <Text>{currentTransaction.start_time ? dayjs(currentTransaction.start_time).format('YYYY-MM-DD HH:mm') : '-'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">充电状态</Text>
              <Text type={isCharging ? 'success' : 'default'}>
                {isCharging ? '🔋 充电中' : '✅ 已结束'}
              </Text>
            </div>
          </Space>
        </Card>

        <div style={{ marginTop: 24 }}>
          {isCharging ? (
            <Button 
              type="primary" 
              danger 
              size="large" 
              block 
              icon={<PauseOutlined />}
              loading={stopping}
              onClick={handleStopCharge}
            >
              结束充电
            </Button>
          ) : (
            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<DollarOutlined />}
              onClick={handlePay}
            >
              立即支付 ¥{chargingData.amount.toFixed(2)}
            </Button>
          )}
        </div>

        <Card size="small" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">账户余额</Text>
            <Text strong style={{ fontSize: 18 }}>¥{balance.toFixed(2)}</Text>
          </div>
        </Card>
      </Card>
    </div>
  );
}

export default ChargePage;
