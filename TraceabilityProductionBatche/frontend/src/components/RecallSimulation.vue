<template>
  <div class="recall-simulation">
    <div class="search-section">
      <el-form :inline="true">
        <el-form-item label="选择原料批次">
          <el-select v-model="selectedBatch" placeholder="请选择原料批次" style="width: 350px" filterable>
            <el-option
              v-for="batch in materialBatches"
              :key="batch.id"
              :label="`${batch.batch_no} - ${batch.material_name} (${batch.supplier_name})`"
              :value="batch.batch_no"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doTrace" :loading="loading">
            开始溯源分析
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="traceResult" class="result-section">
      <el-alert
        v-if="traceResult.totalRecallCost > 0"
        :title="`预估召回成本：¥${traceResult.totalRecallCost.toLocaleString()}`"
        type="warning"
        :closable="false"
        show-icon
        class="cost-alert"
      />

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="chain-box">
            <div class="chain-title">
              <span class="icon">📦</span>
              问题原料批次
            </div>
            <div v-for="item in traceResult.materialBatches" :key="item.id" class="chain-item material">
              <div class="item-main">{{ item.material_name }}</div>
              <div class="item-sub">批次号：{{ item.batch_no }}</div>
              <div class="item-sub">供应商：{{ item.supplier_name }}</div>
              <div class="item-sub">数量：{{ item.quantity }} {{ item.unit }}</div>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="chain-box">
            <div class="chain-title">
              <span class="icon">🏭</span>
              影响的生产工单
            </div>
            <div v-for="item in traceResult.workOrders" :key="item.id" class="chain-item workorder">
              <div class="item-main">{{ item.product_name }}</div>
              <div class="item-sub">工单号：{{ item.order_no }}</div>
              <div class="item-sub">产量：{{ item.actual_quantity }} 箱</div>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="chain-box">
            <div class="chain-title">
              <span class="icon">🎁</span>
              受影响的成品批次
            </div>
            <div v-for="item in traceResult.productBatches" :key="item.id" class="chain-item product">
              <div class="item-main">{{ item.product_name }}</div>
              <div class="item-sub">批次号：{{ item.batch_no }}</div>
              <div class="item-sub">数量：{{ item.quantity }} 箱</div>
              <div class="item-sub">单价：¥{{ item.product_price }}</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="chain-box distributors-box" style="margin-top: 20px">
        <div class="chain-title">
          <span class="icon">🚚</span>
          已发往的经销商（需要通知召回）
        </div>
        <el-table :data="traceResult.distributors" border>
          <el-table-column prop="name" label="经销商名称" width="200" />
          <el-table-column prop="contact" label="联系人" width="120" />
          <el-table-column prop="phone" label="联系电话" width="140" />
          <el-table-column prop="region" label="区域" width="100" />
          <el-table-column prop="address" label="地址" />
          <el-table-column prop="shipped_quantity" label="涉及数量" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="danger">{{ row.shipped_quantity }} 箱</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="flow-diagram" style="margin-top: 20px">
        <div class="chain-title">
          <span class="icon">📊</span>
          溯源流程图（BFS广度优先遍历）
        </div>
        <div class="diagram-container">
          <div class="level">
            <div class="level-label">Level 0</div>
            <div class="nodes">
              <div v-for="m in traceResult.materialBatches" :key="'m-' + m.id" class="node node-material">
                <div class="node-title">{{ m.material_name }}</div>
                <div class="node-sub">{{ m.batch_no }}</div>
              </div>
            </div>
          </div>
          <div class="arrow">↓</div>
          <div class="level">
            <div class="level-label">Level 1</div>
            <div class="nodes">
              <div v-for="w in traceResult.workOrders" :key="'w-' + w.id" class="node node-workorder">
                <div class="node-title">{{ w.product_name }}</div>
                <div class="node-sub">{{ w.order_no }}</div>
              </div>
            </div>
          </div>
          <div class="arrow">↓</div>
          <div class="level">
            <div class="level-label">Level 2</div>
            <div class="nodes">
              <div v-for="p in traceResult.productBatches" :key="'p-' + p.id" class="node node-product">
                <div class="node-title">{{ p.product_name }}</div>
                <div class="node-sub">{{ p.batch_no }}</div>
              </div>
            </div>
          </div>
          <div class="arrow">↓</div>
          <div class="level">
            <div class="level-label">Level 3</div>
            <div class="nodes">
              <div v-for="d in traceResult.distributors" :key="'d-' + d.id" class="node node-distributor">
                <div class="node-title">{{ d.name }}</div>
                <div class="node-sub">{{ d.region }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="请选择原料批次，开始召回模拟分析" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const selectedBatch = ref('')
const materialBatches = ref([])
const traceResult = ref(null)
const loading = ref(false)

const fetchMaterials = async () => {
  try {
    const res = await axios.get('/api/materials')
    if (res.data.success) {
      materialBatches.value = res.data.data
    }
  } catch (err) {
    ElMessage.error('获取原料批次失败')
  }
}

const doTrace = async () => {
  if (!selectedBatch.value) {
    ElMessage.warning('请先选择原料批次')
    return
  }
  
  loading.value = true
  traceResult.value = null
  
  try {
    const res = await axios.get(`/api/trace/material/${selectedBatch.value}`)
    if (res.data.success) {
      traceResult.value = res.data.data
      ElMessage.success('溯源分析完成')
    } else {
      ElMessage.error(res.data.error || '溯源分析失败')
    }
  } catch (err) {
    ElMessage.error('溯源分析失败：' + (err.response?.data?.error || err.message))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMaterials()
})
</script>

<style scoped>
.search-section {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.result-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.cost-alert {
  margin-bottom: 20px;
}

.cost-alert .el-alert__title {
  font-size: 20px;
  font-weight: bold;
}

.chain-box {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.chain-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chain-title .icon {
  font-size: 18px;
}

.chain-item {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  border-left: 4px solid;
}

.chain-item.material {
  border-left-color: #667eea;
}

.chain-item.workorder {
  border-left-color: #f5576c;
}

.chain-item.product {
  border-left-color: #4facfe;
}

.chain-item.distributor {
  border-left-color: #43e97b;
}

.chain-item:last-child {
  border-bottom: none;
}

.item-main {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.item-sub {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}

.distributors-box {
  overflow: hidden;
}

.flow-diagram {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.diagram-container {
  padding: 24px;
}

.level {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-label {
  width: 80px;
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.node {
  padding: 10px 16px;
  border-radius: 8px;
  text-align: center;
  min-width: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-material {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.node-workorder {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.node-product {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.node-distributor {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.node-title {
  font-weight: 500;
  font-size: 14px;
}

.node-sub {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 4px;
}

.arrow {
  text-align: center;
  padding: 8px 0;
  font-size: 24px;
  color: #c0c4cc;
  margin-left: 80px;
}

.empty-state {
  padding: 80px 0;
}
</style>
