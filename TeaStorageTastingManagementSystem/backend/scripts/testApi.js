const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5173/api';

async function runTests() {
  console.log('========== API 完整测试 ==========\n');

  try {
    console.log('1. 测试健康检查接口...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ 健康检查通过:', health.data.message);

    console.log('\n2. 测试茶品列表接口...');
    const list = await axios.get(`${BASE_URL}/tea-products`, {
      params: { page: 1, pageSize: 10 }
    });
    console.log('   ✅ 茶品列表获取成功, 共', list.data.data.total, '条记录');

    console.log('\n3. 测试新增茶品接口...');
    const newTea = {
      product_name: '冰岛古树',
      origin: '临沧茶区',
      production_year: 2024,
      material_type: 'pure',
      pressing_date: '2024-03-20',
      shape: 'cake',
      specification: 357,
      mountain: '冰岛山',
      fragrance_type: '冰糖香',
      description: '冰岛古树纯料，冰糖甜韵'
    };
    const create = await axios.post(`${BASE_URL}/tea-products`, newTea);
    console.log('   ✅ 新增茶品成功, ID:', create.data.data.id);
    console.log('   茶品名称:', create.data.data.product_name);

    console.log('\n4. 测试获取单条茶品详情...');
    const detail = await axios.get(`${BASE_URL}/tea-products/${create.data.data.id}`);
    console.log('   ✅ 获取详情成功:', detail.data.data.product_name);

    console.log('\n5. 测试更新茶品...');
    const update = await axios.put(`${BASE_URL}/tea-products/${create.data.data.id}`, {
      ...newTea,
      description: '冰岛古树纯料，冰糖甜韵（已更新）'
    });
    console.log('   ✅ 更新成功:', update.data.data.description);

    console.log('\n6. 测试仓位列表接口...');
    const locations = await axios.get(`${BASE_URL}/storage-locations`, {
      params: { page: 1, pageSize: 10 }
    });
    console.log('   ✅ 仓位列表获取成功, 共', locations.data.data.total, '个仓位');

    console.log('\n7. 测试库存列表接口...');
    const inventory = await axios.get(`${BASE_URL}/inventory`, {
      params: { page: 1, pageSize: 10 }
    });
    console.log('   ✅ 库存列表获取成功, 共', inventory.data.data.total, '条记录');

    console.log('\n8. 测试环境记录接口...');
    const env = await axios.get(`${BASE_URL}/environment-records`, {
      params: { page: 1, pageSize: 10 }
    });
    console.log('   ✅ 环境记录获取成功, 共', env.data.data.total, '条记录');

    console.log('\n9. 测试环境统计接口...');
    const stats = await axios.get(`${BASE_URL}/environment-records/statistics`, {
      params: { days: 30 }
    });
    console.log('   ✅ 环境统计获取成功, 共', stats.data.data.length, '天数据');

    console.log('\n10. 测试品鉴笔记接口...');
    const notes = await axios.get(`${BASE_URL}/tasting-notes`, {
      params: { page: 1, pageSize: 10 }
    });
    console.log('   ✅ 品鉴笔记获取成功, 共', notes.data.data.total, '条记录');

    console.log('\n11. 测试转化曲线接口...');
    const curve = await axios.get(`${BASE_URL}/tasting-notes/conversion-curve/1`);
    console.log('   ✅ 转化曲线获取成功, 共', curve.data.data.length, '年数据');

    console.log('\n12. 测试删除茶品...');
    const del = await axios.delete(`${BASE_URL}/tea-products/${create.data.data.id}`);
    console.log('   ✅ 删除成功');

    console.log('\n========== 所有测试通过！✅ ==========');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runTests();
