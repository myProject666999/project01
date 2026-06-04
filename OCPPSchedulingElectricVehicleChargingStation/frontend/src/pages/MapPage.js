import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Tag, Modal, message, Space, Typography } from 'antd';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { stationAPI, chargeAPI } from '../services/api';
import { EnvironmentOutlined, ThunderboltOutlined, ScanOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684937.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapEffect({ onMapClick }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', onMapClick);
    return () => map.off('click', onMapClick);
  }, [map, onMapClick]);
  return null;
}

function MapPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [chargePoints, setChargePoints] = useState([]);
  const [showChargePoints, setShowChargePoints] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const res = await stationAPI.getStations();
      setStations(res.data.stations);
    } catch (error) {
      message.error('加载充电站失败');
    }
  };

  const loadChargePoints = async (stationId) => {
    try {
      const res = await stationAPI.getChargePoints(stationId);
      setChargePoints(res.data.charge_points);
      setShowChargePoints(true);
    } catch (error) {
      message.error('加载充电桩失败');
    }
  };

  const handleScanQR = async () => {
    if (!qrCode) {
      message.warning('请输入二维码内容');
      return;
    }
    setScanning(true);
    try {
      const res = await stationAPI.scanQR(qrCode);
      setSelectedConnector(res.data);
      setShowStartModal(true);
    } catch (error) {
      message.error(error.response?.data?.error || '二维码无效');
    } finally {
      setScanning(false);
    }
  };

  const handleReserveAndStart = async () => {
    if (!selectedConnector) return;
    
    try {
      const reserveRes = await chargeAPI.reserve(selectedConnector.connector.id);
      if (reserveRes.data.success) {
        message.success(reserveRes.data.message);
        
        setTimeout(async () => {
          try {
            const startRes = await chargeAPI.startCharge(selectedConnector.connector.id);
            message.success('充电已启动');
            setShowStartModal(false);
            setTimeout(() => window.location.href = '/charge', 1000);
          } catch (err) {
            message.error(err.response?.data?.error || '启动失败');
          }
        }, 1000);
      } else {
        message.warning(reserveRes.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.error || '占桩失败');
    }
  };

  const quickScanCodes = [
    'QR-CP-WJ-001-1', 'QR-CP-WJ-002-1',
    'QR-CP-ZGC-001-1', 'QR-CP-ZGC-002-1',
    'QR-CP-LJZ-001-1', 'QR-CP-LJZ-002-1'
  ];

  const getStatusTag = (status, isOnline) => {
    if (!isOnline) return <Tag color="red">离线</Tag>;
    switch (status) {
      case 'Available': return <Tag color="green">空闲可用</Tag>;
      case 'Charging': return <Tag color="blue">充电中</Tag>;
      case 'Reserved': return <Tag color="gold">已预约</Tag>;
      case 'Faulted': return <Tag color="red">故障</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const center = stations.length > 0 
    ? [stations[0].latitude || 39.9042, stations[0].longitude || 116.4074]
    : [39.9042, 116.4074];

  return (
    <div className="page-container">
      <Card className="scan-qr-section">
        <Title level={4} style={{ marginBottom: 16 }}>
          <ScanOutlined /> 扫码充电
        </Title>
        <Space.Compact className="qr-input" style={{ width: '100%' }}>
          <Input
            size="large"
            placeholder="输入充电桩二维码编号"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            onPressEnter={handleScanQR}
          />
          <Button type="primary" size="large" onClick={handleScanQR} loading={scanning}>
            扫码
          </Button>
        </Space.Compact>
        <div className="quick-scan-buttons">
          <Text type="secondary">快速测试：</Text>
          {quickScanCodes.map(code => (
            <Button key={code} size="small" onClick={() => { setQrCode(code); handleScanQR(); }}>
              {code}
            </Button>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        <Card title={<><EnvironmentOutlined /> 充电站地图</>}>
          <div className="map-container">
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {stations.map(station => (
                <Marker
                  key={station.id}
                  position={[station.latitude, station.longitude]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedStation(station);
                      loadChargePoints(station.id);
                    }
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: 200 }}>
                      <strong>{station.name}</strong>
                      <p style={{ margin: '8px 0' }}>{station.address}</p>
                      <p>
                        空闲: <Tag color="green">{station.available_count}</Tag> /
                        总桩数: <Tag>{station.total_count}</Tag>
                      </p>
                      <Button type="link" onClick={() => {
                        setSelectedStation(station);
                        loadChargePoints(station.id);
                      }}>
                        查看详情
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <MapEffect onMapClick={() => {}} />
            </MapContainer>
          </div>
        </Card>

        <Card 
          title={selectedStation ? <><ThunderboltOutlined /> {selectedStation.name}</> : '充电桩列表'}
        >
          {!selectedStation ? (
            <List
              dataSource={stations}
              renderItem={station => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => {
                      setSelectedStation(station);
                      loadChargePoints(station.id);
                    }}>查看</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={station.name}
                    description={
                      <Space>
                        <Tag color="green">{station.available_count} 空闲</Tag>
                        <Tag>{station.total_count} 总桩</Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <List
              dataSource={chargePoints}
              renderItem={cp => (
                <List.Item
                  actions={[
                    cp.status === 'Available' && cp.is_online ? (
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => {
                          setSelectedConnector({
                            connector: { id: 1 },
                            charge_point: cp
                          });
                          setShowStartModal(true);
                        }}
                      >
                        扫码充电
                      </Button>
                    ) : null
                  ]}
                >
                  <List.Item.Meta
                    title={cp.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Space>{getStatusTag(cp.status, cp.isOnline)}</Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {cp.power_kw}kW · ¥{cp.price_per_kwh}/kWh
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
          {selectedStation && (
            <Button block style={{ marginTop: 16 }} onClick={() => {
              setSelectedStation(null);
              setShowChargePoints(false);
            }}>
              返回充电站列表
            </Button>
          )}
        </Card>
      </div>

      <Modal
        title="启动充电"
        open={showStartModal}
        onCancel={() => setShowStartModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowStartModal(false)}>取消</Button>,
          <Button key="start" type="primary" onClick={handleReserveAndStart}>
            立即充电
          </Button>
        ]}
      >
        {selectedConnector && (
          <div>
            <p><strong>充电桩：</strong>{selectedConnector.charge_point?.name}</p>
            <p><strong>充电站：</strong>{selectedConnector.station?.name}</p>
            <p><strong>电价：</strong>¥{selectedConnector.charge_point?.price_per_kwh}/kWh</p>
            <p><strong>功率：</strong>{selectedConnector.charge_point?.power_kw}kW</p>
            <p style={{ color: '#faad14', marginTop: 16 }}>
              💡 提示：系统将先为您占桩（5分钟有效），然后启动充电
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MapPage;
