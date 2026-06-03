<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '@/utils/request';
import type { Vehicle } from '../../../shared/types';

const router = useRouter();

const vehicles = ref<Vehicle[]>([]);
const loading = ref(false);
const searchKeyword = ref('');
const statusFilter = ref('all');

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'registered', label: '已登记' },
  { value: 'dismantling', label: '拆解中' },
  { value: 'completed', label: '已完成' },
];

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

const filteredVehicles = computed(() => {
  return vehicles.value.filter((vehicle) => {
    const matchesSearch =
      !searchKeyword.value ||
      vehicle.plateNumber.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      vehicle.owner.toLowerCase().includes(searchKeyword.value.toLowerCase());

    const matchesStatus = statusFilter.value === 'all' || vehicle.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

const fetchVehicles = async () => {
  loading.value = true;
  try {
    const res = await http.get<Vehicle[]>('/vehicles');
    if (res.success && res.data) {
      vehicles.value = res.data;
    }
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
  } finally {
    loading.value = false;
  }
};

const goToNew = () => {
  router.push('/vehicles/new');
};

const goToEdit = (id: number) => {
  router.push(`/vehicles/${id}/edit`);
};

const handleDelete = async (id: number, plateNumber: string) => {
  if (!confirm(`确定要删除车辆 "${plateNumber}" 吗？`)) {
    return;
  }

  try {
    const res = await http.delete(`/vehicles/${id}`);
    if (res.success) {
      alert('删除成功');
      fetchVehicles();
    } else {
      alert(res.error || '删除失败');
    }
  } catch (error) {
    console.error('Failed to delete vehicle:', error);
    alert('删除失败');
  }
};

const handleCreateDismantling = async (vehicleId: number, plateNumber: string) => {
  if (!confirm(`确定要为车辆 "${plateNumber}" 创建拆解任务吗？`)) {
    return;
  }

  try {
    const res = await http.post('/dismantling', { vehicleId });
    if (res.success) {
      alert('拆解任务创建成功');
      fetchVehicles();
    } else {
      alert(res.error || '创建失败');
    }
  } catch (error) {
    console.error('Failed to create dismantling task:', error);
    alert('创建失败');
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

onMounted(() => {
  fetchVehicles();
});
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">车辆管理</h1>
      <button
        @click="goToNew"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增车辆
      </button>
    </div>

    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索车牌、VIN码、车主..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div class="md:w-48">
          <select
            v-model="statusFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车牌号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN码</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车主</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">报废原因</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">过户时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="vehicle in filteredVehicles" :key="vehicle.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ vehicle.plateNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ vehicle.vin }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ vehicle.owner }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ vehicle.scrapReason || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(vehicle.transferDate) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="['px-2 py-1 text-xs font-medium rounded-full', statusColors[vehicle.status]]"
                >
                  {{ statusLabels[vehicle.status] }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center space-x-2">
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="goToEdit(vehicle.id)"
                  >
                    查看
                  </button>
                  <button
                    class="text-indigo-600 hover:text-indigo-800"
                    @click="goToEdit(vehicle.id)"
                  >
                    编辑
                  </button>
                  <button
                    class="text-red-600 hover:text-red-800"
                    @click="handleDelete(vehicle.id, vehicle.plateNumber)"
                  >
                    删除
                  </button>
                  <button
                    v-if="vehicle.status === 'registered'"
                    class="text-yellow-600 hover:text-yellow-800"
                    @click="handleCreateDismantling(vehicle.id, vehicle.plateNumber)"
                  >
                    创建拆解任务
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredVehicles.length === 0 && !loading">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>{{ searchKeyword || statusFilter !== 'all' ? '没有找到匹配的车辆' : '暂无车辆数据' }}</p>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                加载中...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
