import axios from 'axios';
import type { ApiResponse } from '@/types';
import { message } from 'antd';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const msg = data?.message || `请求错误 (${status})`;
      message.error(msg);
    } else if (error.request) {
      message.error('网络异常，请检查网络连接');
    } else {
      message.error('请求配置错误');
    }
    return Promise.reject(error);
  },
);

export default request;

export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}
