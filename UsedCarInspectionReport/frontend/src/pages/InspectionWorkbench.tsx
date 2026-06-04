import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Radio,
  Input,
  Upload,
  Image,
  Space,
  Select,
  DatePicker,
  Form,
  message,
  Tag,
  Modal,
} from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { inspectionApi, vehicleApi, reportApi, uploadApi } from '../services/api';
import { InspectionCategory, InspectionItem, Vehicle, InspectionResult, InspectionPhoto } from '../types';

const { TextArea } = Input;

const InspectionWorkbench: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState<{ category: InspectionCategory; items: InspectionItem[] }[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [form] = Form.useForm();
  const [results, setResults] = useState<Map<number, InspectionResult>>(new Map());
  const [photos, setPhotos] = useState<Map<number, InspectionPhoto[]>>(new Map());
  const [reportId, setReportId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, vehiclesRes] = await Promise.all([
        inspectionApi.getItemsWithCategories(),
        vehicleApi.getList({ pageSize: 100 }),
      ]);
      if (itemsRes.code === 200) {
        setCategories(itemsRes.data);
      }
      if (vehiclesRes.code === 200) {
        setVehicles(vehiclesRes.data.list);
      }
    } catch (error) {
      message.error('加载数据失败');
    }
  };

  const handleVehicleSelect = async (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle || null);
  };

  const startInspection = async (values: any) => {
    if (!selectedVehicle) {
      message.error('请选择车辆');
      return;
    }

    try {
      const response = await reportApi.create({
        vehicleId: selectedVehicle.id,
        inspectionDate: values.inspectionDate.format('YYYY-MM-DD'),
        mileage: Number(values.mileage),
      });

      if (response.code === 200) {
        setReportId(response.data.id);
        setShowVehicleModal(false);
        message.success('开始检测');
      } else {
        message.error(response.message || '创建报告失败');
      }
    } catch (error: any) {
      console.error('创建报告错误:', error);
      message.error(error.response?.data?.message || '创建报告失败');
    }
  };

  const handleResultChange = (item: InspectionItem, result: 'ok' | 'attention' | 'abnormal') => {
    const score = result === 'ok' ? item.scoreOk : result === 'attention' ? item.scoreAttention : item.scoreAbnormal;
    
    const newResults = new Map(results);
    const existing = newResults.get(item.id);
    newResults.set(item.id, {
      ...existing,
      id: 0,
      reportId: reportId || 0,
      itemId: item.id,
      categoryId: item.categoryId,
      result,
      score,
      remark: existing?.remark || '',
    });
    setResults(newResults);
  };

  const handleRemarkChange = (itemId: number, remark: string) => {
    const newResults = new Map(results);
    const existing = newResults.get(itemId);
    if (existing) {
      newResults.set(itemId, {
        ...existing,
        remark,
      });
      setResults(newResults);
    }
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError, itemId } = options as any;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportId', String(reportId));
      formData.append('itemId', String(itemId));
      formData.append('vin', selectedVehicle?.vin || '');

      const response = await uploadApi.uploadPhoto(formData);
      if (response.code === 200) {
        const newPhotos = new Map(photos);
        const itemPhotos = newPhotos.get(itemId) || [];
        itemPhotos.push(response.data);
        newPhotos.set(itemId, itemPhotos);
        setPhotos(newPhotos);
        onSuccess?.(response.data);
        message.success('上传成功');
      }
    } catch (error) {
      onError?.(error as Error);
      message.error('上传失败');
    }
  };

  const handleDeletePhoto = async (photoId: number, itemId: number) => {
    try {
      await uploadApi.deletePhoto(photoId);
      const newPhotos = new Map(photos);
      const itemPhotos = newPhotos.get(itemId) || [];
      newPhotos.set(itemId, itemPhotos.filter(p => p.id !== photoId));
      setPhotos(newPhotos);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const saveResults = async () => {
    if (!reportId) return;
    
    try {
      const resultsArray = Array.from(results.values());
      await reportApi.saveResults(reportId, resultsArray);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleSubmit = async () => {
    if (!reportId) return;

    Modal.confirm({
      title: '确认提交',
      content: '提交后将生成正式报告，无法修改。确定提交吗？',
      onOk: async () => {
        setSubmitting(true);
        try {
          await saveResults();
          const response = await reportApi.submit(reportId);
          if (response.code === 200) {
            message.success('报告提交成功');
            setTimeout(() => {
              window.location.href = `/reports/${response.data.id}`;
            }, 1000);
          }
        } catch (error) {
          message.error('提交失败');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const currentCategory = categories[currentStep];
  const getResultIcon = (result?: string) => {
    if (result === 'ok') return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />;
    if (result === 'attention') return <WarningOutlined style={{ color: '#faad14', fontSize: 20 }} />;
    if (result === 'abnormal') return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />;
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>检测工作台</h2>
        {selectedVehicle && (
          <Space>
            <Tag color="blue">{selectedVehicle.brand} {selectedVehicle.model}</Tag>
            <Tag color="green">VIN: {selectedVehicle.vin}</Tag>
          </Space>
        )}
      </div>

      <Modal
        title="选择检测车辆"
        open={showVehicleModal}
        onCancel={() => {}}
        footer={null}
        width={600}
        closable={false}
      >
        <Form form={form} layout="vertical" onFinish={startInspection}>
          <Form.Item
            label="选择车辆"
            name="vehicleId"
            rules={[{ required: true, message: '请选择车辆' }]}
          >
            <Select
              placeholder="请选择要检测的车辆"
              showSearch
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleVehicleSelect}
              options={vehicles.map(v => ({
                key: v.id,
                value: v.id,
                label: `${v.brand} ${v.model} - ${v.licensePlate || v.vin}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="检测日期"
            name="inspectionDate"
            rules={[{ required: true, message: '请选择检测日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="当前里程(公里)"
            name="mileage"
            rules={[{ required: true, message: '请输入当前里程' }]}
          >
            <Input type="number" placeholder="请输入当前里程" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              开始检测
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {!showVehicleModal && currentCategory && (
        <>
          <Steps
            current={currentStep}
            items={categories.map(cat => ({
              title: cat.category.name,
            }))}
            style={{ marginBottom: 24 }}
          />

          <Card
            title={
              <Space>
                <span>{currentCategory.category.name}</span>
                <Tag color="blue">{currentCategory.items.length}项</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button onClick={saveResults}>保存进度</Button>
                <Button type="primary" onClick={handleSubmit} loading={submitting}>
                  提交报告
                </Button>
              </Space>
            }
          >
            <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
              {currentCategory.items.map((item, index) => {
                const itemResult = results.get(item.id);
                const itemPhotos = photos.get(item.id) || [];

                return (
                  <Card
                    key={item.id}
                    size="small"
                    style={{ marginBottom: 12 }}
                    title={
                      <Space>
                        <span>{index + 1}. {item.name}</span>
                        {item.needPhoto ? <Tag color="orange">需拍照</Tag> : null}
                        {getResultIcon(itemResult?.result)}
                      </Space>
                    }
                    extra={
                      <Radio.Group
                        value={itemResult?.result}
                        onChange={(e) => handleResultChange(item, e.target.value)}
                      >
                        <Radio.Button value="ok" style={{ color: '#52c41a' }}>正常</Radio.Button>
                        <Radio.Button value="attention" style={{ color: '#faad14' }}>注意</Radio.Button>
                        <Radio.Button value="abnormal" style={{ color: '#ff4d4f' }}>异常</Radio.Button>
                      </Radio.Group>
                    }
                  >
                    <p style={{ color: '#666', marginBottom: 8 }}>
                      <strong>检测标准：</strong>{item.standard}
                    </p>
                    <Form.Item label="检测说明" style={{ marginBottom: 8 }}>
                      <TextArea
                        rows={2}
                        placeholder="请输入检测说明"
                        value={itemResult?.remark || ''}
                        onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                      />
                    </Form.Item>
                    {item.needPhoto && (
                      <div>
                        <Upload
                          listType="picture-card"
                          customRequest={handleUpload}
                          data={{ itemId: item.id }}
                          multiple
                        >
                          <div>
                            <CameraOutlined />
                            <div style={{ marginTop: 8 }}>上传照片</div>
                          </div>
                        </Upload>
                        {itemPhotos.length > 0 && (
                          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {itemPhotos.map(photo => (
                              <div key={photo.id} style={{ position: 'relative' }}>
                                <Image
                                  width={100}
                                  height={100}
                                  src={photo.filePath}
                                  style={{ objectFit: 'cover' }}
                                />
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  style={{ position: 'absolute', top: 0, right: 0 }}
                                  onClick={() => handleDeletePhoto(photo.id, item.id)}
                                >
                                  删除
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </Card>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              上一步
            </Button>
            <Button
              type="primary"
              disabled={currentStep === categories.length - 1}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              下一步
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default InspectionWorkbench;
