<template>
  <div class="conflict-check-page">
    <el-card>
      <template #header>
        <span>利益冲突检索</span>
      </template>

      <div class="search-section">
        <el-input
          v-model="searchName"
          placeholder="请输入当事人姓名进行冲突检索"
          size="large"
          style="max-width: 500px"
          @keyup.enter="checkConflict"
        >
          <template #append>
            <el-button type="primary" @click="checkConflict" :loading="searching">
              <el-icon><Search /></el-icon>
              检索
            </el-button>
          </template>
        </el-input>
      </div>

      <div class="result-section" v-if="searchResult">
        <el-alert
          v-if="searchResult.hasDirectConflict"
          title="存在直接利益冲突！"
          type="error"
          :closable="false"
          show-icon
        >
          <template #default>
            该当事人在历史案件中作为对方当事人，根据执业规范，不能接受委托。
          </template>
        </el-alert>

        <el-alert
          v-else-if="searchResult.hasPotentialConflict"
          title="存在潜在利益冲突"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            该当事人在历史案件中作为我方当事人，请评估是否存在冲突。
          </template>
        </el-alert>

        <el-alert
          v-else
          title="未发现利益冲突"
          type="success"
          :closable="false"
          show-icon
        >
          <template #default>
            未检索到相关案件记录，可以接受委托。
          </template>
        </el-alert>

        <el-table
          :data="searchResult.conflicts"
          border
          style="margin-top: 20px"
          v-if="searchResult.conflicts && searchResult.conflicts.length > 0"
        >
          <el-table-column prop="caseNumber" label="案件编号" width="140" />
          <el-table-column prop="caseName" label="案件名称" min-width="200" />
          <el-table-column prop="clientName" label="匹配当事人" width="150" />
          <el-table-column prop="roleInCase" label="在案件中的角色" width="150">
            <template #default="{ row }">
              <el-tag :type="row.conflictType === 'DIRECT' ? 'danger' : 'warning'">
                {{ row.roleInCase }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="conflictType" label="冲突类型" width="120">
            <template #default="{ row }">
              {{ row.conflictType === 'DIRECT' ? '直接冲突' : '潜在冲突' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewCase(row.caseId)">
                查看案件
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-empty v-else description="请输入当事人姓名进行检索" style="margin-top: 60px" />
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>检索说明</span>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="姓名归一化">
          系统会自动处理空格、繁简体转换、同音字匹配，确保检索准确性
        </el-descriptions-item>
        <el-descriptions-item label="直接冲突">
          当事人曾作为对方当事人出现在历史案件中，禁止接受委托
        </el-descriptions-item>
        <el-descriptions-item label="潜在冲突">
          当事人曾作为我方当事人出现在历史案件中，需评估是否存在冲突
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { conflictCheckApi } from '../api'

const router = useRouter()
const searchName = ref('')
const searching = ref(false)
const searchResult = ref(null)

const checkConflict = async () => {
  if (!searchName.value.trim()) {
    ElMessage.warning('请输入当事人姓名')
    return
  }

  searching.value = true
  try {
    searchResult.value = await conflictCheckApi.check(searchName.value)
  } catch (error) {
    ElMessage.error('检索失败')
  } finally {
    searching.value = false
  }
}

const viewCase = (caseId) => {
  router.push(`/case-detail/${caseId}`)
}
</script>

<style scoped>
.conflict-check-page {
  padding: 0;
}

.search-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.result-section {
  margin-top: 20px;
}
</style>
