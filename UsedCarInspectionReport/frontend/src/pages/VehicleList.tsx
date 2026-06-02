import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Card,
  Popconfirm,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { vehicleApi } from '../services/api';
import { Vehicle } from '../types';
import dayjs from 'dayjs';

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form] = Form.useForm();

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleApi.getList({
        page,
        pageSize,
        keyword,
      });
      if (response.code === 200) {
        setVehicles(response.data.list);
        setTotal(response.data.total);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadVehicles();
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue({
      ...vehicle,
      firstRegistrationDate: vehicle.firstRegistrationDate ? dayjs(vehicle.firstRegistrationDate) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await vehicleApi.delete(id);
      message.success('删除成功');
      loadVehicles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.firstRegistrationDate = values.firstRegistrationDate?.format('YYYY-MM-DD');

      if (editingVehicle) {
        await vehicleApi.update(editingVehicle.id, values);
        message.success('更新成功');
      } else {
        await vehicleApi.create(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadVehicles();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '车架号(VIN)',
      dataIndex: 'vin',
      key: 'vin',
      width: 180,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '年款',
      dataIndex: 'year',
      key: 'year',
      width: 80,
    },
    {
      title: '车牌号',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      width: 100,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 80,
    },
    {
      title: '里程(公里)',
      dataIndex: 'mileage',
      key: 'mileage',
      width: 120,
      render: (mileage: number) => mileage?.toLocaleString() || '-',
    },
    {
      title: '首次登记日期',
      dataIndex: 'firstRegistrationDate',
      key: 'firstRegistrationDate',
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
      width: 120,
      render: (_: any, record: Vehicle) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="车辆管理">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="搜索车架号、品牌、型号"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加车辆
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={vehicles}
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

      <Modal
        title={editingVehicle ? '编辑车辆' : '添加车辆'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="车架号(VIN)"
            name="vin"
            rules={[
              { required: true, message: '请输入车架号' },
              { len: 17, message: '车架号必须是17位' },
            ]}
          >
            <Input placeholder="请输入17位车架号" maxLength={17} />
          </Form.Item>
          <Form.Item
            label="品牌"
            name="brand"
            rules={[{ required: true, message: '请输入品牌' }]}
          >
            <Input placeholder="请输入品牌" />
          </Form.Item>
          <Form.Item
            label="型号"
            name="model"
            rules={[{ required: true, message: '请输入型号' }]}
          >
            <Input placeholder="请输入型号" />
          </Form.Item>
          <Form.Item label="年款" name="year">
            <Input type="number" placeholder="请输入年款" />
          </Form.Item>
          <Form.Item label="车牌号" name="licensePlate">
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item label="颜色" name="color">
            <Input placeholder="请输入颜色" />
          </Form.Item>
          <Form.Item label="里程(公里)" name="mileage">
            <Input type="number" placeholder="请输入里程" />
          </Form.Item>
          <Form.Item label="首次登记日期" name="firstRegistrationDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehicleList;
