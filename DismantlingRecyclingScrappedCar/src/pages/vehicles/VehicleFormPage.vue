<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { http } from '@/utils/request';
import type { Vehicle } from '../../../shared/types';

const router = useRouter();
const route = useRoute();

const isEdit = computed(() => !!route.params.id);
const vehicleId = computed(() => Number(route.params.id));

const form = ref({
  plateNumber: '',
  vin: '',
  owner: '',
  ownerPhone: '',
  scrapReason: '',
  transferDate: '',
});

const loading = ref(false);
const submitting = ref(false);
const errors = ref<Record<string, string>>({});

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

const vehicle = ref<Vehicle | null>(null);

const fetchVehicle = async () => {
  if (!isEdit.value) return;

  loading.value = true;
  try {
    const res = await http.get<Vehicle>(`/vehicles/${vehicleId.value}`);
    if (res.success && res.data) {
      vehicle.value = res.data;
      form.value = {
        plateNumber: res.data.plateNumber,
        vin: res.data.vin,
        owner: res.data.owner,
        ownerPhone: res.data.ownerPhone || '',
        scrapReason: res.data.scrapReason || '',
        transferDate: res.data.transferDate ? res.data.transferDate.split('T')[0] : '',
      };
    } else {
      alert(res.error || '获取车辆信息失败');
      router.push('/vehicles');
    }
  } catch (error) {
    console.error('Failed to fetch vehicle:', error);
    alert('获取车辆信息失败');
    router.push('/vehicles');
  } finally {
    loading.value = false;
  }
};

const validate = (): boolean => {
  errors.value = {};

  if (!form.value.plateNumber.trim()) {
    errors.value.plateNumber = '请输入车牌号';
  }

  if (!form.value.vin.trim()) {
    errors.value.vin = '请输入VIN码';
  } else if (form.value.vin.length !== 17) {
    errors.value.vin = 'VIN码应为17位';
  }

  if (!form.value.owner.trim()) {
    errors.value.owner = '请输入车主姓名';
  }

  if (form.value.ownerPhone && !/^1[3-9]\d{9}$/.test(form.value.ownerPhone)) {
    errors.value.ownerPhone = '请输入有效的手机号码';
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;

  submitting.value = true;
  try {
    let res;

    if (isEdit.value) {
      res = await http.put(`/vehicles/${vehicleId.value}`, form.value);
    } else {
      res = await http.post('/vehicles', form.value);
    }

    if (res.success) {
      alert(isEdit.value ? '更新成功' : '创建成功');
      router.push('/vehicles');
    } else {
      alert(res.error || (isEdit.value ? '更新失败' : '创建失败'));
    }
  } catch (error) {
    console.error('Failed to submit vehicle:', error);
    alert(isEdit.value ? '更新失败' : '创建失败');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  router.push('/vehicles');
};

onMounted(() => {
  if (isEdit.value) {
    fetchVehicle();
  }
});
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isEdit ? '编辑车辆' : '新增车辆' }}
      </h1>
      <button
        @click="handleCancel"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        返回列表
      </button>
    </div>

    <div v-if="isEdit && vehicle" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">车辆状态</h2>
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-600">当前状态：</span>
        <span :class="['px-3 py-1 text-sm font-medium rounded-full', statusColors[vehicle.status]]">
          {{ statusLabels[vehicle.status] }}
        </span>
        <span class="text-sm text-gray-500">
          登记时间：{{ new Date(vehicle.createdAt).toLocaleString('zh-CN') }}
        </span>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">
        {{ isEdit ? '编辑车辆信息' : '填写车辆信息' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              车牌号 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.plateNumber"
              type="text"
              placeholder="请输入车牌号"
              :class="[
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
                errors.plateNumber ? 'border-red-500' : 'border-gray-300',
              ]"
            />
            <p v-if="errors.plateNumber" class="mt-1 text-sm text-red-500">
              {{ errors.plateNumber }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              VIN码 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.vin"
              type="text"
              placeholder="请输入17位VIN码"
              :class="[
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
                errors.vin ? 'border-red-500' : 'border-gray-300',
              ]"
            />
            <p v-if="errors.vin" class="mt-1 text-sm text-red-500">
              {{ errors.vin }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              车主姓名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.owner"
              type="text"
              placeholder="请输入车主姓名"
              :class="[
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
                errors.owner ? 'border-red-500' : 'border-gray-300',
              ]"
            />
            <p v-if="errors.owner" class="mt-1 text-sm text-red-500">
              {{ errors.owner }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              联系电话
            </label>
            <input
              v-model="form.ownerPhone"
              type="tel"
              placeholder="请输入联系电话"
              :class="[
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
                errors.ownerPhone ? 'border-red-500' : 'border-gray-300',
              ]"
            />
            <p v-if="errors.ownerPhone" class="mt-1 text-sm text-red-500">
              {{ errors.ownerPhone }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              报废原因
            </label>
            <select
              v-model="form.scrapReason"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">请选择报废原因</option>
              <option value="达到使用年限">达到使用年限</option>
              <option value="事故报废">事故报废</option>
              <option value="排放标准不达标">排放标准不达标</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              过户时间
            </label>
            <input
              v-model="form.transferDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="handleCancel"
            class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="submitting || loading"
            class="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              v-if="submitting"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ submitting ? '提交中...' : (isEdit ? '保存修改' : '确认提交') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
