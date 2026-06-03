const { traceForwardFromMaterial } = require('./src/utils/bfs');

async function test() {
  try {
    console.log('开始测试正向BFS溯源...');
    const result = await traceForwardFromMaterial(1);
    console.log('原料批次:', result.materialBatches.length);
    console.log('工单:', result.workOrders.length);
    console.log('成品批次:', result.productBatches.length);
    console.log('经销商:', result.distributors.length);
    console.log('结果:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
}

test();
