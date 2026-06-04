<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF;">
              <el-icon size="28"><Tickets /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.auctions }}</div>
              <div class="stat-label">拍卖会</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67C23A;">
              <el-icon size="28"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.lots }}</div>
              <div class="stat-label">拍品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C;">
              <el-icon size="28"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.bidders }}</div>
              <div class="stat-label">竞买人</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #F56C6C;">
              <el-icon size="28"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近拍卖会</span>
              <el-button type="primary" link @click="$router.push('/auctions')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentAuctions" style="width: 100%">
            <el-table-column prop="name" label="拍卖会名称" />
            <el-table-column prop="auction_no" label="编号" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="auction_date" label="拍卖日期" width="180" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待审核资格</span>
              <el-button type="primary" link @click="$router.push('/qualifications')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="pendingQualifications" style="width: 100%">
            <el-table-column prop="bidder.name" label="竞买人" />
            <el-table-column prop="paddle_number" label="号牌" width="100" />
            <el-table-column prop="deposit_amount" label="保证金" width="120">
              <template #default="{ row }">¥{{ row.deposit_amount }}</template>
            </el-table-column>
            <el-table-column prop="qualification_status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag type="warning">待审核</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuctionList, getQualificationList } from '../api'

const stats = ref({
  auctions: 0,
  lots: 0,
  bidders: 0,
  pending: 0
})

const recentAuctions = ref([])
const pendingQualifications = ref([])

const statusType = (status) => {
  const map = { draft: 'info', preview: 'primary', ongoing: 'success', completed: '', cancelled: 'danger' }
  return map[status] || ''
}

const statusText = (status) => {
  const map = { draft: '草稿', preview: '预展中', ongoing: '拍卖中', completed: '已结束', cancelled: '已取消' }
  return map[status] || status
}

onMounted(async () => {
  const [auctionRes, qualRes] = await Promise.all([
    getAuctionList({ page_size: 5 }),
    getQualificationList({ qualification_status: 'pending', page_size: 5 })
  ])
  
  stats.value.auctions = auctionRes.data.total
  stats.value.bidders = qualRes.data.total
  stats.value.pending = qualRes.data.total
  recentAuctions.value = auctionRes.data.list
  pendingQualifications.value = qualRes.data.list
})
</script>

<style scoped>
.stat-card {
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
