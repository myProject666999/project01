const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const { params, ...restOptions } = options;
  
  let fullUrl = BASE_URL + url;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(restOptions.headers as Record<string, string> || {}),
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      ...restOptions,
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error(result.error || '请求失败');
    }

    return result;
  } catch (error) {
    console.error('Request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

export const http = {
  get: <T>(url: string, params?: Record<string, any>) =>
    request<T>(url, { method: 'GET', params }),
  post: <T>(url: string, data?: any) =>
    request<T>(url, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T>(url: string, data?: any) =>
    request<T>(url, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
};
