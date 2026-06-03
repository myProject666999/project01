<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '@/utils/request';
import type { Vehicle } from '../../shared/types';

const router = useRouter();

interface DashboardStats {
  todayRegistered: number;
  dismantlingCount: number;
  pendingHazardous: number;
  pendingWaybill: number;
}

interface TrendData {
  month: string;
  registered: number;
  completed: number;
}

const stats = ref<DashboardStats>({
  todayRegistered: 0,
  dismantlingCount: 0,
  pendingHazardous: 0,
  pendingWaybill: 0,
});

const trendData = ref<TrendData[]>([]);
const recentVehicles = ref<Vehicle[]>([]);
const loading = ref(false);

const statusLabels: Record<string, string> = {
  registered: '已登记',
  dismantling: '拆解中',
  completed: '已完成',
};

const statusColors: Record<string, string> = {
  registered: 'bg-blue-100 text-blue-800',
  dismantling: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const [statsRes, trendRes, vehiclesRes] = await Promise.all([
      http.get<DashboardStats>('/dashboard/stats'),
      http.get<TrendData[]>('/dashboard/trend'),
      http.get<Vehicle[]>('/dashboard/recent-vehicles'),
    ]);

    if (statsRes.success && statsRes.data) {
      stats.value = statsRes.data;
    }
    if (trendRes.success && trendRes.data) {
      trendData.value = trendRes.data;
    }
    if (vehiclesRes.success && vehiclesRes.data) {
      recentVehicles.value = vehiclesRes.data;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

const getMaxTrendValue = () => {
  if (trendData.value.length === 0) return 1;
  const max = Math.max(...trendData.value.flatMap(d => [d.registered, d.completed]));
  return max || 1;
};

const goToVehicleNew = () => {
  router.push('/vehicles/new');
};

const goToVehicles = () => {
  router.push('/vehicles');
};

const goToDismantling = () => {
  router.push('/dismantling');
};

const goToHazardous = () => {
  router.push('/hazardous');
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">数据概览</h1>
      <span class="text-sm text-gray-500">{{ new Date().toLocaleDateString('zh-CN') }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">今日登记车辆</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.todayRegistered }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">拆解中车辆</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.dismantlingCount }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">待处理危废</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.pendingHazardous }}</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">待回签联单</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.pendingWaybill }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">近6个月数据趋势</h2>
        <div class="h-64">
          <div class="flex items-end justify-between h-48 space-x-2">
            <div
              v-for="item in trendData"
              :key="item.month"
              class="flex-1 flex flex-col items-center space-y-1"
            >
              <div class="w-full flex justify-center space-x-1 h-36 items-end">
                <div
                  class="w-4 bg-blue-500 rounded-t transition-all duration-300"
                  :style="{ height: `${(item.registered / getMaxTrendValue()) * 100}%` }"
                  :title="`登记: ${item.registered}`"
                ></div>
                <div
                  class="w-4 bg-green-500 rounded-t transition-all duration-300"
                  :style="{ height: `${(item.completed / getMaxTrendValue()) * 100}%` }"
                  :title="`完成: ${item.completed}`"
                ></div>
              </div>
              <span class="text-xs text-gray-500">{{ item.month }}</span>
            </div>
          </div>
          <div class="flex justify-center space-x-6 mt-4">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-blue-500 rounded"></div>
              <span class="text-sm text-gray-600">登记车辆</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-green-500 rounded"></div>
              <span class="text-sm text-gray-600">完成拆解</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div class="grid grid-cols-2 gap-4">
          <button
            @click="goToVehicleNew"
            class="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">新增车辆</span>
          </button>

          <button
            @click="goToDismantling"
            class="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">拆解管理</span>
          </button>

          <button
            @click="goToHazardous"
            class="flex flex-col items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">危废处理</span>
          </button>

          <button
            @click="goToVehicles"
            class="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div class="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">车辆列表</span>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">最近登记车辆</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车牌号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN码</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车主</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">报废原因</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登记时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="vehicle in recentVehicles" :key="vehicle.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ vehicle.plateNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ vehicle.vin }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ vehicle.owner }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ vehicle.scrapReason || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusColors[vehicle.status]]">
                  {{ statusLabels[vehicle.status] }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(vehicle.createdAt).toLocaleString('zh-CN') }}
              </td>
            </tr>
            <tr v-if="recentVehicles.length === 0 && !loading">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
