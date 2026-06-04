import React, { useState, useEffect } from 'react';
import { Card, Button, InputNumber, message, Typography, Space, List } from 'antd';
import { WalletOutlined, PlusOutlined } from '@ant-design/icons';
import { paymentAPI } from '../services/api';

const { Title, Text } = Typography;

function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await paymentAPI.getBalance();
      setBalance(res.data.balance);
    } catch (error) {
      console.error('Load balance error');
    }
  };

  const handleRecharge = async () => {
    if (rechargeAmount <= 0) {
      message.warning('请输入充值金额');
      return;
    }
    setRecharging(true);
    try {
      await paymentAPI.recharge(rechargeAmount);
      message.success(`充值成功 ¥${rechargeAmount}`);
      loadBalance();
    } catch (error) {
      message.error('充值失败');
    } finally {
      setRecharging(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <div className="page-container" style={{ maxWidth: 500, margin: '0 auto' }}>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>
          <WalletOutlined /> 我的钱包
        </Title>

        <div className="balance-display">
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>账户余额</Text>
          <div className="balance-value">¥{balance.toFixed(2)}</div>
        </div>

        <Card size="small" title="充值" style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">选择金额</Text>
            <Space wrap style={{ marginTop: 8 }}>
              {quickAmounts.map(amount => (
                <Button
                  key={amount}
                  type={rechargeAmount === amount ? 'primary' : 'default'}
                  onClick={() => setRechargeAmount(amount)}
                >
                  ¥{amount}
                </Button>
              ))}
            </Space>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">自定义金额</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 8 }}
              min={1}
              value={rechargeAmount}
              onChange={setRechargeAmount}
              prefix="¥"
              size="large"
            />
          </div>

          <Button
            type="primary"
            size="large"
            block
            icon={<PlusOutlined />}
            loading={recharging}
            onClick={handleRecharge}
          >
            立即充值
          </Button>
        </Card>

        <Card size="small" title="使用说明" style={{ marginTop: 16 }}>
          <List size="small">
            <List.Item>• 余额可用于支付充电费用</List.Item>
            <List.Item>• 充电结束后自动从余额扣款</List.Item>
            <List.Item>• 余额不足时需先充值再使用</List.Item>
          </List>
        </Card>
      </Card>
    </div>
  );
}

export default WalletPage;
