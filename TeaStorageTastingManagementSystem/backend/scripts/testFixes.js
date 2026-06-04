const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:3000/api';

async function runTests() {
  console.log('========== 修复验证测试 ==========\n');

  try {
    console.log('1. 测试品鉴笔记详情接口（原500错误）...');
    const noteDetail = await axios.get(`${BASE_URL}/tasting-notes/1`);
    console.log('   ✅ 品鉴笔记详情获取成功');
    console.log('      - 笔记ID:', noteDetail.data.data.id);
    console.log('      - 茶品名称:', noteDetail.data.data.teaProduct.product_name);
    console.log('      - 品鉴详情数量:', noteDetail.data.data.infusions.length);

    console.log('\n2. 测试品鉴笔记新增接口...');
    const newNote = {
      tea_product_id: 1,
      tasting_date: '2026-06-03',
      tea_weight: 8,
      water_type: 'pure',
      brew_count: 3,
      notes: '测试新增品鉴笔记',
      infusions: [
        { infusion_number: 1, soup_color: '金黄', aroma: '蜜香', taste: '甘甜', score: 85 },
        { infusion_number: 2, soup_color: '深黄', aroma: '蜜香', taste: '回甘', score: 88 },
        { infusion_number: 3, soup_color: '黄亮', aroma: '糖香', taste: '持久', score: 86 }
      ]
    };
    const createNote = await axios.post(`${BASE_URL}/tasting-notes`, newNote);
    console.log('   ✅ 品鉴笔记新增成功, ID:', createNote.data.data.id);

    console.log('\n3. 测试品鉴笔记更新接口...');
    const updateNote = await axios.put(`${BASE_URL}/tasting-notes/${createNote.data.data.id}`, {
      ...newNote,
      notes: '测试更新品鉴笔记（已修改）',
      infusions: [
        ...newNote.infusions,
        { infusion_number: 4, soup_color: '浅黄', aroma: '余香', taste: '淡雅', score: 82 }
      ]
    });
    console.log('   ✅ 品鉴笔记更新成功');

    console.log('\n4. 测试库存编辑-只修改备注...');
    const updateInventory1 = await axios.put(`${BASE_URL}/inventory/1`, {
      notes: '测试修改备注'
    });
    console.log('   ✅ 库存编辑-修改备注成功');

    console.log('\n5. 测试库存编辑-修改数量...');
    const updateInventory2 = await axios.put(`${BASE_URL}/inventory/1`, {
      quantity: 55
    });
    console.log('   ✅ 库存编辑-修改数量成功, 新数量:', updateInventory2.data.data.quantity);

    console.log('\n6. 测试库存编辑-修改仓位（防串味校验）...');
    try {
      await axios.put(`${BASE_URL}/inventory/1`, {
        location_id: 6
      });
      console.log('   ✅ 库存编辑-修改仓位成功');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ✅ 库存编辑-防串味校验正常工作:', error.response.data.message);
      } else {
        throw error;
      }
    }

    console.log('\n7. 测试库存编辑-修改到不存在的仓位...');
    try {
      await axios.put(`${BASE_URL}/inventory/1`, {
        location_id: 999
      });
      console.log('   ❌ 应该返回400错误');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ✅ 库存编辑-不存在仓位返回400错误:', error.response.data.message);
      } else {
        throw error;
      }
    }

    console.log('\n8. 清理测试数据...');
    await axios.delete(`${BASE_URL}/tasting-notes/${createNote.data.data.id}`);
    console.log('   ✅ 测试品鉴笔记已删除');

    console.log('\n========== 所有测试通过！✅ ==========');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data) {
      console.error('   错误详情:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

runTests();
