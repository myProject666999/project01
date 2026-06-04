<template>
  <div class="traceability-page" v-if="!loading">
    <div class="header-section">
      <div class="header-bg">
        <div class="pattern-overlay"></div>
      </div>
      <div class="header-content">
        <div class="certification-badge">
          <div class="badge-inner">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="white" stroke-width="2" fill="white"/>
              <path d="M8 12L10.5 14.5L16 9" stroke="#2d5a27" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>已安全检测</span>
        </div>
        <h1 class="product-title">{{ traceabilityData.product.name }}</h1>
        <p class="product-subtitle">{{ traceabilityData.variety.scientificName }}</p>
        <div class="product-tags">
          <span class="tag">道地药材</span>
          <span class="tag">有机种植</span>
          <span class="tag">溯源认证</span>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="card product-info-card">
        <div class="card-header">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#2d5a27" stroke-width="2"/>
              <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="#2d5a27" stroke-width="2"/>
            </svg>
          </div>
          <h3 class="card-title">产品基本信息</h3>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">产品规格</span>
            <span class="value">{{ traceabilityData.product.specification }}</span>
          </div>
          <div class="info-item">
            <span class="label">包装类型</span>
            <span class="value">{{ traceabilityData.product.packagingType }}</span>
          </div>
          <div class="info-item">
            <span class="label">净重量</span>
            <span class="value">{{ formatWeight(traceabilityData.product.netWeight) }}</span>
          </div>
          <div class="info-item">
            <span class="label">生产日期</span>
            <span class="value">{{ formatDate(traceabilityData.product.productionDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">保质期</span>
            <span class="value">{{ traceabilityData.product.shelfLife }}个月</span>
          </div>
          <div class="info-item">
            <span class="label">储存条件</span>
            <span class="value">{{ traceabilityData.product.storageCondition }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">产品批号</span>
            <span class="value">{{ traceabilityData.product.batchNo }}</span>
          </div>
        </div>
      </div>

      <div class="card timeline-card">
        <div class="card-header">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V22M12 2L8 6M12 2L16 6M5 9H19C20.1046 9 21 9.89543 21 11V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V11C3 9.89543 3.89543 9 5 9Z" stroke="#2d5a27" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="card-title">溯源链条</h3>
        </div>
        <div class="timeline">
          <div
            class="timeline-item"
            v-for="(item, index) in traceabilityData.timeline"
            :key="index"
            :class="{ active: item.completed, last: index === traceabilityData.timeline.length - 1 }"
          >
            <div class="timeline-dot">
              <svg v-if="item.completed" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="timeline-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
              <span class="timeline-date">{{ formatDate(item.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card plot-card">
        <div class="card-header">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#2d5a27" stroke-width="2"/>
            </svg>
          </div>
          <h3 class="card-title">种植地块信息</h3>
        </div>
        <div class="map-container">
          <div class="map-placeholder">
            <div class="map-pattern"></div>
            <div class="map-marker">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 16 20 10C20 6.13401 16.866 3 13 3C12.4477 3 11.9477 3.06015 11.479 3.1707C11.1795 2.4785 10.5303 2 9.76955 2C8.79259 2 8 2.79259 8 3.76955V5.05084C4.99977 5.94213 3 8.75332 3 12C3 16 12 22 12 22Z" fill="#2d5a27"/>
                <circle cx="10" cy="10" r="3" fill="white"/>
              </svg>
            </div>
            <div class="map-coords">
              <span>经度: {{ traceabilityData.plot.longitude }}°</span>
              <span>纬度: {{ traceabilityData.plot.latitude }}°</span>
            </div>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">海拔高度</span>
            <span class="value">{{ traceabilityData.plot.altitude }}m</span>
          </div>
          <div class="info-item">
            <span class="label">土壤类型</span>
            <span class="value">{{ traceabilityData.plot.soilType }}</span>
          </div>
          <div class="info-item">
            <span class="label">土壤pH值</span>
            <span class="value">{{ traceabilityData.plot.soilPh }}</span>
          </div>
          <div class="info-item">
            <span class="label">地块面积</span>
            <span class="value">{{ traceabilityData.plot.area }}亩</span>
          </div>
          <div class="info-item full-width">
            <span class="label">种苗来源</span>
            <span class="value">{{ traceabilityData.plot.seedlingSource }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">地块位置</span>
            <span class="value">{{ traceabilityData.plot.location }}</span>
          </div>
        </div>
      </div>

      <div class="card variety-card">
        <div class="card-header">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z" stroke="#2d5a27" stroke-width="2"/>
              <path d="M12 8C14.7614 8 17 10.2386 17 13C17 17 12 22 12 22C12 22 7 17 7 13C7 10.2386 9.23858 8 12 8Z" stroke="#2d5a27" stroke-width="2"/>
            </svg>
          </div>
          <h3 class="card-title">品种信息</h3>
        </div>
        <div class="variety-header">
          <div class="variety-image">
            <div class="image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L8 7H6C4.89543 7 4 7.89543 4 9V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H16L12 2Z" stroke="#2d5a27" stroke-width="2"/>
                <path d="M10 9H14V13H10V9Z" fill="#2d5a27"/>
              </svg>
            </div>
          </div>
          <div class="variety-info">
            <h4 class="variety-name">{{ traceabilityData.variety.name }}</h4>
            <p class="variety-scientific">{{ traceabilityData.variety.scientificName }}</p>
            <div class="origin-badge">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.6572 16.657L13.4142 20.9L9.17125 16.657C5.08825 12.574 5.08825 5.95703 9.17125 1.87403C13.2542 -2.20897 19.8712 -2.20897 23.9542 1.87403C28.0372 5.95703 28.0372 12.574 23.9542 16.657L17.6572 16.657Z" stroke="#c9a227" stroke-width="2"/>
                <circle cx="16.5" cy="9.5" r="2.5" fill="#c9a227"/>
              </svg>
              <span>道地产区：{{ traceabilityData.variety.originArea }}</span>
            </div>
          </div>
        </div>
        <div class="efficacy-section">
          <h5>功效描述</h5>
          <p>{{ traceabilityData.variety.efficacy }}</p>
        </div>
        <div class="variety-tags">
          <span v-for="(tag, index) in traceabilityData.variety.tags" :key="index" class="variety-tag">{{ tag }}</span>
        </div>
      </div>

      <div class="card farming-card">
        <div class="card-header">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 22H4V20C4 17.7909 5.79086 16 8 16H16C18.2091 16 20 17.7909 20 20V22Z" stroke="#2d5a27" stroke-width="2"/>
              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#2d5a27" stroke-width="2"/>
              <path d="M2 7V11M22 7V11M12 11V22" stroke="#7cb342" stroke-width="2" stroke-dasharray="2 2"/>
            </svg>
          </div>
          <h3 class="card-title">农事记录</h3>
        </div>
        <div class="record-list">
          <div
            class="record-item"
            v-for="(record, index) in traceabilityData.farmingRecords"
            :key="index"
          >
            <div class="record-date">
              <span class="date-day">{{ formatDate(record.operationDate, 'DD') }}</span>
              <span class="date-month">{{ formatDate(record.operationDate, 'YYYY-MM') }}</span>
            </div>
            <div class="record-content">
              <div class="record-header">
                <h4>{{ record.operationType }}</h4>
                <span class="record-operator">{{ record.operator }}</span>
              </div>
              <p class="record-desc">{{ record.description }}</p>
              <div class="record-details" v-if="record.details">
                <span v-for="(detail, idx) in record.details" :key="idx" class="detail-tag">
                  {{ detail }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card processing-card">
        <div class="card-header">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3H22V7H2V3Z" stroke="#2d5a27" stroke-width="2"/>
              <path d="M4 7V21C4 21.5523 4.44772 22 5 22H19C19.5523 22 20 21.5523 20 21V7" stroke="#2d5a27" stroke-width="2"/>
              <path d="M8 12H16M8 16H16" stroke="#7cb342" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 1V3" stroke="#c9a227" stroke-width="2"/>
            </svg>
          </div>
          <h3 class="card-title">加工记录</h3>
        </div>
        <div class="processing-list">
          <div
            class="processing-item"
            v-for="(record, index) in traceabilityData.processingRecords"
            :key="index"
          >
            <div class="processing-step">
              <span>{{ index + 1 }}</span>
            </div>
            <div class="processing-content">
              <h4>{{ record.stepType }}</h4>
              <div class="processing-params">
                <div class="param-item">
                  <span class="param-label">温度</span>
                  <span class="param-value">{{ record.temperature }}°C</span>
                </div>
                <div class="param-item">
                  <span class="param-label">时长</span>
                  <span class="param-value">{{ record.duration }}小时</span>
                </div>
                <div class="param-item">
                  <span class="param-label">操作人</span>
                  <span class="param-value">{{ record.operator }}</span>
                </div>
              </div>
              <div class="quality-check">
                <div class="check-result" :class="record.qualityResult === '合格' ? 'pass' : 'fail'">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ record.qualityResult }}</span>
                </div>
                <span class="check-date">{{ formatDate(record.processingDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card safety-card">
        <div class="card-header">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 16 20 10V5L12 2L4 5V10C4 16 12 22 12 22Z" stroke="#2d5a27" stroke-width="2"/>
              <path d="M9 12L11 14L15 10" stroke="#52c41a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="card-title">安全检查认证</h3>
        </div>
        <div class="safety-content">
          <div class="safety-badge">
            <div class="safety-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 16 20 10V5L12 2L4 5V10C4 16 12 22 12 22Z" fill="#52c41a"/>
                <path d="M9 12L11 14L15 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="safety-info">
              <h4>产品安全检测合格</h4>
              <p>检测日期：{{ formatDate(traceabilityData.safetyCheck.checkDate) }}</p>
              <p>检测机构：{{ traceabilityData.safetyCheck.institution }}</p>
            </div>
          </div>
          <div class="safety-items">
            <div
              class="safety-item"
              v-for="(item, index) in traceabilityData.safetyCheck.items"
              :key="index"
            >
              <span class="item-name">{{ item.name }}</span>
              <span class="item-result" :class="item.passed ? 'pass' : 'fail'">
                {{ item.passed ? '合格' : '不合格' }}
              </span>
            </div>
          </div>
          <div class="safety-report">
            <p><strong>检测结论：</strong>{{ traceabilityData.safetyCheck.conclusion }}</p>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <div class="footer-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#2d5a27" stroke-width="2" fill="#7cb342"/>
          </svg>
          <span>中药材溯源系统</span>
        </div>
        <p class="footer-text">本产品全程可追溯，品质有保障</p>
        <p class="footer-copyright">© 2024 传统中药材种植加工溯源平台</p>
      </div>
    </div>
  </div>

  <div class="loading-container" v-else>
    <div class="loading-spinner">
      <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#e0e6dc" stroke-width="4"/>
        <circle cx="25" cy="25" r="20" fill="none" stroke="#2d5a27" stroke-width="4" stroke-linecap="round" stroke-dasharray="31.4 31.4"/>
      </svg>
    </div>
    <p>正在加载溯源信息...</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { traceabilityApi } from '@/api'
import { formatDate, formatWeight } from '@/utils'

const route = useRoute()
const loading = ref(true)

const traceabilityData = reactive({
  product: {},
  variety: {},
  plot: {},
  timeline: [],
  farmingRecords: [],
  processingRecords: [],
  safetyCheck: {}
})

const mockData = {
  product: {
    name: '云南文山三七',
    specification: '20头/500g',
    packagingType: '精美纸盒',
    netWeight: 0.5,
    productionDate: '2024-06-01',
    shelfLife: 24,
    storageCondition: '阴凉干燥处密封保存',
    batchNo: 'B202406010001'
  },
  variety: {
    name: '三七',
    scientificName: 'Panax notoginseng (Burkill) F. H. Chen ex C. H.',
    originArea: '云南省文山壮族苗族自治州',
    efficacy: '散瘀止血，消肿定痛。用于咯血，吐血，衄血，便血，崩漏，外伤出血，胸腹刺痛，跌扑肿痛。',
    tags: ['止血化瘀', '消肿定痛', '补气养血', '提高免疫力']
  },
  plot: {
    location: '云南省文山州文山市东山彝族乡',
    latitude: 23.37,
    longitude: 104.23,
    altitude: 1680,
    soilType: '红壤土',
    soilPh: '6.5',
    area: 50,
    seedlingSource: '文山州三七研究院优质种苗繁育基地'
  },
  timeline: [
    { title: '种植', description: '优质种苗定植', date: '2021-03-15', completed: true },
    { title: '农事', description: '3年精细化田间管理', date: '2021-03-20', completed: true },
    { title: '采收', description: '最佳采收期采挖', date: '2024-01-10', completed: true },
    { title: '加工', description: '传统工艺加工炮制', date: '2024-02-20', completed: true },
    { title: '成品', description: '检验合格出厂', date: '2024-06-01', completed: true }
  ],
  farmingRecords: [
    {
      operationDate: '2021-03-15',
      operationType: '种苗定植',
      operator: '农技师 王建国',
      description: '采用优质三年生种苗，株行距15×15cm规范定植，每亩定植约2.8万株',
      details: ['种苗等级：一级', '定植密度：28000株/亩', '覆盖遮阴网']
    },
    {
      operationDate: '2021-05-20',
      operationType: '中耕除草',
      operator: '农户 张秀英',
      description: '人工除草结合浅耕，保持土壤疏松，避免伤根',
      details: ['除草方式：人工', '中耕深度：3-5cm']
    },
    {
      operationDate: '2022-04-10',
      operationType: '施肥',
      operator: '农技师 王建国',
      description: '施用腐熟农家肥和生物菌肥，培育健壮植株',
      details: ['肥料类型：有机肥', '施用量：500kg/亩']
    },
    {
      operationDate: '2023-07-15',
      operationType: '病虫害防治',
      operator: '技术员 李明',
      description: '采用生物防治和物理防治相结合的绿色防控技术',
      details: ['防治对象：根腐病、蚜虫', '防治方式：生物农药']
    },
    {
      operationDate: '2024-01-10',
      operationType: '采收',
      operator: '采收组 全体',
      description: '选择晴天采挖三年生三七，去除茎叶，洗净泥土',
      details: ['采收时间：晴天上午', '采收年限：3年生']
    }
  ],
  processingRecords: [
    {
      stepType: '清洗',
      temperature: 25,
      duration: 2,
      operator: '李师傅',
      qualityResult: '合格',
      processingDate: '2024-01-10'
    },
    {
      stepType: '修剪',
      temperature: 20,
      duration: 4,
      operator: '王师傅',
      qualityResult: '合格',
      processingDate: '2024-01-11'
    },
    {
      stepType: '晾晒',
      temperature: 35,
      duration: 72,
      operator: '张师傅',
      qualityResult: '合格',
      processingDate: '2024-01-12'
    },
    {
      stepType: '烘焙',
      temperature: 45,
      duration: 12,
      operator: '刘师傅',
      qualityResult: '合格',
      processingDate: '2024-01-15'
    },
    {
      stepType: '分级',
      temperature: 20,
      duration: 8,
      operator: '陈师傅',
      qualityResult: '合格',
      processingDate: '2024-01-20'
    },
    {
      stepType: '包装',
      temperature: 22,
      duration: 4,
      operator: '赵师傅',
      qualityResult: '合格',
      processingDate: '2024-06-01'
    }
  ],
  safetyCheck: {
    checkDate: '2024-05-28',
    institution: '云南省药品检验研究院',
    conclusion: '该批次三七按照《中国药典》2020年版标准检验，所有项目均符合规定，准予出厂。',
    items: [
      { name: '农药残留', passed: true },
      { name: '重金属(铅)', passed: true },
      { name: '重金属(镉)', passed: true },
      { name: '重金属(砷)', passed: true },
      { name: '重金属(汞)', passed: true },
      { name: '黄曲霉毒素', passed: true },
      { name: '二氧化硫', passed: true },
      { name: '微生物限度', passed: true },
      { name: '水分含量', passed: true },
      { name: '总灰分', passed: true }
    ]
  }
}

const fetchData = async () => {
  const code = route.params.code || 'TCM-20240601-A00001'
  
  try {
    const res = await traceabilityApi.getByCode(code)
    const data = res?.data || mockData
    Object.assign(traceabilityData, data)
  } catch (error) {
    console.error(error)
    Object.assign(traceabilityData, mockData)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.traceability-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f2eb 0%, #e8e6df 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.header-section {
  position: relative;
  padding: 60px 20px 40px;
  text-align: center;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 320px;
  background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 50%, #7cb342 100%);
  border-radius: 0 0 50% 50% / 0 0 40px 40px;
  overflow: hidden;
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.header-content {
  position: relative;
  z-index: 1;
  color: white;
}

.certification-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 50px;
  margin-bottom: 20px;
  
  .badge-inner {
    width: 28px;
    height: 28px;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  span {
    font-size: 14px;
    font-weight: 600;
  }
}

.product-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
  letter-spacing: 2px;
}

.product-subtitle {
  font-size: 14px;
  opacity: 0.9;
  font-style: italic;
  margin: 0 0 20px;
}

.product-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  
  .tag {
    background: rgba(255, 255, 255, 0.15);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}

.content-section {
  position: relative;
  z-index: 2;
  margin-top: -60px;
  padding: 0 16px 40px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(45, 90, 39, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e6dc;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 22px;
    height: 22px;
  }
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d5a27;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  &.full-width {
    grid-column: 1 / -1;
  }
  
  .label {
    font-size: 12px;
    color: #6b7c68;
  }
  
  .value {
    font-size: 14px;
    color: #2c3e2a;
    font-weight: 500;
    word-break: break-all;
  }
}

.timeline-card {
  .timeline {
    padding-left: 20px;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 14px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background: linear-gradient(180deg, #7cb342 0%, #c8e6c9 100%);
    }
  }
  
  .timeline-item {
    display: flex;
    gap: 16px;
    padding-bottom: 24px;
    position: relative;
    
    &.last {
      padding-bottom: 0;
    }
  }
  
  .timeline-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #e0e6dc;
    color: #6b7c68;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    
    svg {
      width: 16px;
      height: 16px;
    }
    
    &.active {
      background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%);
      color: white;
    }
  }
  
  .timeline-content {
    flex: 1;
    
    h4 {
      font-size: 15px;
      font-weight: 600;
      color: #2c3e2a;
      margin: 0 0 4px;
    }
    
    p {
      font-size: 13px;
      color: #6b7c68;
      margin: 0 0 4px;
    }
    
    .timeline-date {
      font-size: 12px;
      color: #7cb342;
    }
  }
}

.plot-card {
  .map-container {
    margin-bottom: 16px;
  }
  
  .map-placeholder {
    position: relative;
    height: 160px;
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .map-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.3;
    background-image: 
      linear-gradient(rgba(45, 90, 39, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(45, 90, 39, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }
  
  .map-marker {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    
    svg {
      width: 40px;
      height: 40px;
      filter: drop-shadow(0 4px 8px rgba(45, 90, 39, 0.3));
    }
  }
  
  .map-coords {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: rgba(255, 255, 255, 0.9);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    color: #2d5a27;
    display: flex;
    gap: 12px;
  }
}

.variety-card {
  .variety-header {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .variety-image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }
  
  .image-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f0f9eb 0%, #c8e6c9 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      width: 40px;
      height: 40px;
    }
  }
  
  .variety-info {
    flex: 1;
    
    h4 {
      font-size: 20px;
      font-weight: 700;
      color: #2d5a27;
      margin: 0 0 4px;
    }
    
    p {
      font-size: 12px;
      color: #6b7c68;
      font-style: italic;
      margin: 0 0 12px;
    }
  }
  
  .origin-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff9e6;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid #ffe58f;
    
    svg {
      width: 16px;
      height: 16px;
    }
    
    span {
      font-size: 12px;
      color: #c9a227;
      font-weight: 500;
    }
  }
  
  .efficacy-section {
    background: #f6ffed;
    border-left: 4px solid #52c41a;
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 16px;
    
    h5 {
      font-size: 14px;
      color: #2d5a27;
      margin: 0 0 8px;
    }
    
    p {
      font-size: 13px;
      color: #3f5d3b;
      line-height: 1.7;
      margin: 0;
    }
  }
  
  .variety-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    
    .variety-tag {
      background: #e8f5e9;
      color: #2d5a27;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
    }
  }
}

.farming-card {
  .record-list {
    .record-item {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px dashed #e0e6dc;
      
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }
  }
  
  .record-date {
    width: 60px;
    flex-shrink: 0;
    text-align: center;
    background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%);
    color: white;
    border-radius: 8px;
    padding: 8px 4px;
    height: fit-content;
    
    .date-day {
      display: block;
      font-size: 20px;
      font-weight: 700;
      line-height: 1;
    }
    
    .date-month {
      display: block;
      font-size: 10px;
      margin-top: 4px;
      opacity: 0.9;
    }
  }
  
  .record-content {
    flex: 1;
    
    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      h4 {
        font-size: 15px;
        font-weight: 600;
        color: #2c3e2a;
        margin: 0;
      }
      
      .record-operator {
        font-size: 12px;
        color: #7cb342;
      }
    }
    
    .record-desc {
      font-size: 13px;
      color: #6b7c68;
      line-height: 1.6;
      margin: 0 0 10px;
    }
    
    .record-details {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      
      .detail-tag {
        background: #f0f9eb;
        color: #2d5a27;
        padding: 3px 10px;
        border-radius: 4px;
        font-size: 11px;
      }
    }
  }
}

.processing-card {
  .processing-list {
    .processing-item {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px dashed #e0e6dc;
      
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }
  }
  
  .processing-step {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #c9a227 0%, #d4b443 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }
  
  .processing-content {
    flex: 1;
    
    h4 {
      font-size: 15px;
      font-weight: 600;
      color: #2c3e2a;
      margin: 0 0 12px;
    }
  }
  
  .processing-params {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 12px;
    
    .param-item {
      background: #f9f9f9;
      padding: 8px;
      border-radius: 8px;
      text-align: center;
      
      .param-label {
        display: block;
        font-size: 11px;
        color: #6b7c68;
        margin-bottom: 2px;
      }
      
      .param-value {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #2d5a27;
      }
    }
  }
  
  .quality-check {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .check-result {
      display: flex;
      align-items: center;
      gap: 6px;
      
      svg {
        width: 18px;
        height: 18px;
      }
      
      span {
        font-size: 13px;
        font-weight: 500;
      }
      
      &.pass {
        color: #52c41a;
      }
      
      &.fail {
        color: #f5222d;
      }
    }
    
    .check-date {
      font-size: 12px;
      color: #6b7c68;
    }
  }
}

.safety-card {
  .safety-content {
    .safety-badge {
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%);
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    
    .safety-icon {
      width: 56px;
      height: 56px;
      flex-shrink: 0;
      
      svg {
        width: 100%;
        height: 100%;
      }
    }
    
    .safety-info {
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #2d5a27;
        margin: 0 0 6px;
      }
      
      p {
        font-size: 12px;
        color: #6b7c68;
        margin: 2px 0;
      }
    }
  }
  
  .safety-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
    
    .safety-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: #f9f9f9;
      border-radius: 8px;
      
      .item-name {
        font-size: 13px;
        color: #2c3e2a;
      }
      
      .item-result {
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        
        &.pass {
          background: #f6ffed;
          color: #52c41a;
        }
        
        &.fail {
          background: #fff1f0;
          color: #f5222d;
        }
      }
    }
  }
  
  .safety-report {
    background: #fffbe6;
    border: 1px solid #ffe58f;
    padding: 12px;
    border-radius: 8px;
    
    p {
      font-size: 13px;
      color: #874d00;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.footer-section {
  text-align: center;
  padding: 30px 20px;
  
  .footer-logo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    svg {
      width: 24px;
      height: 24px;
    }
    
    span {
      font-size: 16px;
      font-weight: 600;
      color: #2d5a27;
    }
  }
  
  .footer-text {
    font-size: 13px;
    color: #6b7c68;
    margin: 0 0 8px;
  }
  
  .footer-copyright {
    font-size: 11px;
    color: #999;
    margin: 0;
  }
}

.loading-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f2eb;
  
  .loading-spinner {
    width: 60px;
    height: 60px;
    margin-bottom: 20px;
    
    svg {
      width: 100%;
      height: 100%;
      animation: rotate 1s linear infinite;
    }
    
    circle:nth-child(2) {
      animation: dash 1.5s ease-in-out infinite;
    }
  }
  
  p {
    font-size: 14px;
    color: #6b7c68;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1 125; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 62.5 125; stroke-dashoffset: -31.4; }
  100% { stroke-dasharray: 1 125; stroke-dashoffset: -125.6; }
}

@media (max-width: 360px) {
  .product-title {
    font-size: 26px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .processing-params {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .safety-items {
    grid-template-columns: 1fr;
  }
}
</style>
