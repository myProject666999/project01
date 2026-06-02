import React, { useState } from 'react';
import { Badge, Calendar, Modal, List, Tag, Space, Typography, Card } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const PilotageCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const mockData = {
      '2026-06-01': [
        { type: '进港', vesselName: '中远之星', pilot: '张三', time: '08:30', color: 'blue' },
        { type: '出港', vesselName: '海洋一号', pilot: '李四', time: '10:00', color: 'green' },
        { type: '移泊', vesselName: '长江七号', pilot: '王五', time: '14:30', color: 'orange' }
      ],
      '2026-06-02': [
        { type: '进港', vesselName: '海巡168', pilot: '赵六', time: '09:00', color: 'blue' },
        { type: '出港', vesselName: '东方明珠', pilot: '孙七', time: '15:00', color: 'green' }
      ],
      '2026-06-05': [
        { type: '进港', vesselName: '远洋一号', pilot: '张三', time: '07:00', color: 'blue' },
        { type: '出港', vesselName: '南海明珠', pilot: '李四', time: '11:00', color: 'green' },
        { type: '进港', vesselName: '黄河号', pilot: '王五', time: '16:00', color: 'blue' },
        { type: '移泊', vesselName: '珠江号', pilot: '赵六', time: '18:00', color: 'orange' }
      ],
      '2026-06-10': [
        { type: '进港', vesselName: '中海之星', pilot: '周八', time: '08:00', color: 'blue' }
      ],
      '2026-06-15': [
        { type: '出港', vesselName: '大西洋号', pilot: '吴九', time: '10:30', color: 'green' },
        { type: '进港', vesselName: '太平洋号', pilot: '郑十', time: '14:00', color: 'blue' }
      ],
      '2026-06-20': [
        { type: '移泊', vesselName: '印度洋号', pilot: '张三', time: '09:30', color: 'orange' },
        { type: '出港', vesselName: '北冰洋号', pilot: '李四', time: '13:00', color: 'green' },
        { type: '进港', vesselName: '南极号', pilot: '王五', time: '17:00', color: 'blue' }
      ]
    };
    return mockData[dateStr] || [];
  };

  const getMonthData = (value) => {
    if (value.month() === 5 && value.year() === 2026) {
      return 128;
    }
  };

  const monthCellRender = (value) => {
    const num = getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>本月任务</span>
      </div>
    ) : null;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.slice(0, 3).map((item, index) => (
          <li key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
            <Badge
              color={item.color}
              text={<span style={{ fontSize: '11px' }}>{item.vesselName}</span>}
            />
          </li>
        ))}
        {listData.length > 3 && (
          <li style={{ fontSize: '11px', color: '#999' }}>
            还有 {listData.length - 3} 项任务
          </li>
        )}
      </ul>
    );
  };

  const onSelect = (value) => {
    setSelectedDate(value);
    setModalVisible(true);
  };

  const handleOk = () => {
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const selectedDateTasks = selectedDate ? getListData(selectedDate) : [];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <Title level={3} style={{ marginBottom: '24px' }}>引航日历</Title>
        
        <Calendar
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          onSelect={onSelect}
          headerRender={({ value, onChange }) => {
            const start = value.clone().startOf('month');
            const end = value.clone().endOf('month');
            
            let monthTasks = 0;
            for (let day = start; day.isBefore(end) || day.isSame(end, 'day'); day = day.add(1, 'day')) {
              monthTasks += getListData(day).length;
            }
            
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>
                  {value.format('YYYY年MM月')}
                  <Text type="secondary" style={{ fontSize: '14px', marginLeft: '12px' }}>
                    本月共 {monthTasks} 项任务
                  </Text>
                </Title>
                <Space>
                  <span
                    style={{ cursor: 'pointer', padding: '4px 8px' }}
                    onClick={() => onChange(value.clone().add(-1, 'month'))}
                  >
                    上个月
                  </span>
                  <span
                    style={{ cursor: 'pointer', padding: '4px 8px' }}
                    onClick={() => onChange(dayjs())}
                  >
                    今天
                  </span>
                  <span
                    style={{ cursor: 'pointer', padding: '4px 8px' }}
                    onClick={() => onChange(value.clone().add(1, 'month'))}
                  >
                    下个月
                  </span>
                </Space>
              </div>
            );
          }}
        />

        <Modal
          title={
            <Space>
              <CalendarOutlined />
              <span>{selectedDate?.format('YYYY年MM月DD日')} 引航任务详情</span>
            </Space>
          }
          open={modalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          width={600}
          footer={null}
        >
          {selectedDateTasks.length > 0 ? (
            <List
              dataSource={selectedDateTasks}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.vesselName}</Text>
                        <Tag color={item.color}>{item.type}</Tag>
                      </Space>
                    }
                    description={
                      <Space size="large">
                        <span>
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          {item.time}
                        </span>
                        <span>
                          <UserOutlined style={{ marginRight: '4px' }} />
                          {item.pilot}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              该日期暂无引航任务
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default PilotageCalendar;
