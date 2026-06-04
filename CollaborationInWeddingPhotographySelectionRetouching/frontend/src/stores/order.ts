import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, PaginatedResponse, PaginationParams } from '@/types'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const total = ref(0)

  const fetchOrders = async (params?: PaginationParams & { status?: string }) => {
    loading.value = true
    try {
      const response = await request.get<PaginatedResponse<Order>>('/orders', { params })
      orders.value = response.items
      total.value = response.total
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '获取订单列表失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchOrderById = async (id: number) => {
    loading.value = true
    try {
      const response = await request.get<Order>(`/orders/${id}`)
      currentOrder.value = response
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '获取订单详情失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (orderData: Partial<Order>) => {
    loading.value = true
    try {
      const response = await request.post<Order>('/orders', orderData)
      ElMessage.success('订单创建成功')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '创建订单失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateOrder = async (id: number, orderData: Partial<Order>) => {
    loading.value = true
    try {
      const response = await request.patch<Order>(`/orders/${id}`, orderData)
      const index = orders.value.findIndex(o => o.id === id)
      if (index !== -1) {
        orders.value[index] = response
      }
      if (currentOrder.value?.id === id) {
        currentOrder.value = response
      }
      ElMessage.success('订单更新成功')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '更新订单失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const startSelection = async (orderId: number) => {
    loading.value = true
    try {
      const response = await request.post<Order>(`/orders/${orderId}/start-selection`)
      ElMessage.success('已开始选片')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const submitSelection = async (orderId: number) => {
    loading.value = true
    try {
      const response = await request.post<Order>(`/orders/${orderId}/submit-selection`)
      ElMessage.success('选片已提交')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '提交失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    total,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    startSelection,
    submitSelection
  }
})
