<template>
  <div class="backward-trace">
    <div class="search-section">
      <el-form :inline="true">
        <el-form-item label="选择成品批次">
          <el-select v-model="selectedBatch" placeholder="请选择成品批次" style="width: 350px" filterable>
            <el-option
              v-for="batch in productBatches"
              :key="batch.id"
              :label="`${batch.batch_no} - ${batch.product_name}`"
              :value="batch.batch_no"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doTrace" :loading="loading">
            开始反向溯源
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="traceResult" class="result-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="chain-box">
            <div class="chain-title">
              <span class="icon">🎁</span>
              问题成品批次
            </div>
            <div v-for="item in traceResult.productBatches" :key="item.id" class="chain-item product">
              <div class="item-main">{{ item.product_name }}</div>
              <div class="item-sub">批次号：{{ item.batch_no }}</div>
              <div class="item-sub">数量：{{ item.quantity }} 箱</div>
              <div class="item-sub">生产日期：{{ item.production_date }}</div>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="chain-box">
            <div class="chain-title">
              <span class="icon">🏭</span>
              对应的生产工单
            </div>
            <div v-for="item in traceResult.workOrders" :key="item.id" class="chain-item workorder">
              <div class="item-main">{{ item.product_name }}</div>
              <div class="item-sub">工单号：{{ item.order_no }}</div>
              <div class="item-sub">计划/实际：{{ item.plan_quantity }} / {{ item.actual_quantity }}</div>
              <div class="item-sub">状态：{{ item.status }}</div>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="chain-box">
            <div class="chain-title">
              <span class="icon">📦</span>
              使用到的原料批次
            </div>
            <div v-for="item in traceResult.materialBatches" :key="item.id" class="chain-item material">
              <div class="item-main">{{ item.material_name }}</div>
              <div class="item-sub">批次号：{{ item.batch_no }}</div>
              <div class="item-sub">供应商：{{ item.supplier_name }}</div>
              <div class="item-sub">入库数量：{{ item.quantity }} {{ item.unit }}</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="summary-card" style="margin-top: 20px">
        <el-alert
          title="溯源结论"
          type="info"
          :closable="false"
          show-icon
        >
          <div class="summary-content">
            <p>该成品批次共涉及 <strong>{{ traceResult.materialBatches.length }}</strong> 种原料批次，来自 <strong>{{ new Set(traceResult.materialBatches.map(m => m.supplier_name)).size }}</strong> 家供应商。</p>
            <p v-if="traceResult.materialBatches.length > 0">需要对以下供应商进行质量追溯：</p>
            <div class="supplier-tags">
              <el-tag 
                v-for="supplier in [...new Set(traceResult.materialBatches.map(m => m.supplier_name))]" 
                :key="supplier"
                type="warning"
                effect="dark"
                style="margin-right: 8px"
              >
                {{ supplier }}
              </el-tag>
            </div>
          </div>
        </el-alert>
      </div>

      <div class="flow-diagram" style="margin-top: 20px">
        <div class="chain-title">
          <span class="icon">📊</span>
          反向溯源流程图（BFS广度优先遍历）
        </div>
        <div class="diagram-container">
          <div class="level">
            <div class="level-label">Level 0</div>
            <div class="nodes">
              <div v-for="p in traceResult.productBatches" :key="'p-' + p.id" class="node node-product">
                <div class="node-title">{{ p.product_name }}</div>
                <div class="node-sub">{{ p.batch_no }}</div>
              </div>
            </div>
          </div>
          <div class="arrow">↑</div>
          <div class="level">
            <div class="level-label">Level 1</div>
            <div class="nodes">
              <div v-for="w in traceResult.workOrders" :key="'w-' + w.id" class="node node-workorder">
                <div class="node-title">{{ w.product_name }}</div>
                <div class="node-sub">{{ w.order_no }}</div>
              </div>
            </div>
          </div>
          <div class="arrow">↑</div>
          <div class="level">
            <div class="level-label">Level 2</div>
            <div class="nodes">
              <div v-for="m in traceResult.materialBatches" :key="'m-' + m.id" class="node node-material">
                <div class="node-title">{{ m.material_name }}</div>
                <div class="node-sub">{{ m.batch_no }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="请选择成品批次，开始反向溯源分析" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const selectedBatch = ref('')
const productBatches = ref([])
const traceResult = ref(null)
const loading = ref(false)

const fetchProducts = async () => {
  try {
    const res = await axios.get('/api/products')
    if (res.data.success) {
      productBatches.value = res.data.data
    }
  } catch (err) {
    ElMessage.error('获取成品批次失败')
  }
}

const doTrace = async () => {
  if (!selectedBatch.value) {
    ElMessage.warning('请先选择成品批次')
    return
  }
  
  loading.value = true
  traceResult.value = null
  
  try {
    const res = await axios.get(`/api/trace/product/${selectedBatch.value}`)
    if (res.data.success) {
      traceResult.value = res.data.data
      ElMessage.success('反向溯源完成')
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
  fetchProducts()
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

.chain-box {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.chain-title {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

.chain-item.product {
  border-left-color: #4facfe;
}

.chain-item.workorder {
  border-left-color: #f5576c;
}

.chain-item.material {
  border-left-color: #667eea;
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

.summary-card {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.summary-content {
  padding: 16px 0;
}

.summary-content p {
  margin-bottom: 12px;
  line-height: 1.8;
}

.supplier-tags {
  margin-top: 8px;
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

.node-product {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.node-workorder {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.node-material {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
