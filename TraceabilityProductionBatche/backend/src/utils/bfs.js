const pool = require('../config/db');

async function traceForwardFromMaterial(materialBatchId) {
  const visited = new Set();
  const result = {
    materialBatches: [],
    workOrders: [],
    productBatches: [],
    distributors: [],
    graph: []
  };

  const queue = [{ type: 'material', id: materialBatchId, level: 0 }];
  visited.add(`material-${materialBatchId}`);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.type === 'material') {
      const [materialRows] = await pool.execute(`
        SELECT mb.*, m.name as material_name, s.name as supplier_name
        FROM material_batches mb
        LEFT JOIN materials m ON mb.material_id = m.id
        LEFT JOIN suppliers s ON mb.supplier_id = s.id
        WHERE mb.id = ?
      `, [current.id]);

      if (materialRows.length > 0) {
        const material = materialRows[0];
        result.materialBatches.push({ ...material, level: current.level });
        result.graph.push({
          from: `material-${material.id}`,
          fromName: `${material.material_name}(${material.batch_no})`,
          type: 'material'
        });
      }

      const [linkRows] = await pool.execute(`
        SELECT DISTINCT work_order_id
        FROM work_order_materials
        WHERE material_batch_id = ?
      `, [current.id]);

      for (const link of linkRows) {
        const key = `workorder-${link.work_order_id}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ type: 'workorder', id: link.work_order_id, level: current.level + 1 });
        }
      }
    } else if (current.type === 'workorder') {
      const [workOrderRows] = await pool.execute(`
        SELECT wo.*, p.name as product_name
        FROM work_orders wo
        LEFT JOIN products p ON wo.product_id = p.id
        WHERE wo.id = ?
      `, [current.id]);

      if (workOrderRows.length > 0) {
        const workOrder = workOrderRows[0];
        result.workOrders.push({ ...workOrder, level: current.level });
      }

      const [productBatchRows] = await pool.execute(`
        SELECT id
        FROM product_batches
        WHERE work_order_id = ?
      `, [current.id]);

      for (const pb of productBatchRows) {
        const key = `product-${pb.id}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ type: 'product', id: pb.id, level: current.level + 1 });
        }
      }
    } else if (current.type === 'product') {
      const [productBatchRows] = await pool.execute(`
        SELECT pb.*, p.name as product_name, p.price as product_price, wo.order_no as work_order_no
        FROM product_batches pb
        LEFT JOIN products p ON pb.product_id = p.id
        LEFT JOIN work_orders wo ON pb.work_order_id = wo.id
        WHERE pb.id = ?
      `, [current.id]);

      if (productBatchRows.length > 0) {
        const productBatch = productBatchRows[0];
        result.productBatches.push({ ...productBatch, level: current.level });
      }

      const [shipmentRows] = await pool.execute(`
        SELECT DISTINCT distributor_id, quantity
        FROM shipments
        WHERE product_batch_id = ?
      `, [current.id]);

      for (const shipment of shipmentRows) {
        const key = `distributor-${shipment.distributor_id}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ type: 'distributor', id: shipment.distributor_id, level: current.level + 1, quantity: shipment.quantity });
        }
      }
    } else if (current.type === 'distributor') {
      const [distributorRows] = await pool.execute(`
        SELECT * FROM distributors WHERE id = ?
      `, [current.id]);

      if (distributorRows.length > 0) {
        const distributor = distributorRows[0];
        result.distributors.push({ ...distributor, level: current.level, shipped_quantity: current.quantity || 0 });
      }
    }
  }

  return result;
}

async function traceBackwardFromProduct(productBatchId) {
  const visited = new Set();
  const result = {
    productBatches: [],
    workOrders: [],
    materialBatches: [],
    graph: []
  };

  const queue = [{ type: 'product', id: productBatchId, level: 0 }];
  visited.add(`product-${productBatchId}`);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.type === 'product') {
      const [productBatchRows] = await pool.execute(`
        SELECT pb.*, p.name as product_name, p.price as product_price
        FROM product_batches pb
        LEFT JOIN products p ON pb.product_id = p.id
        WHERE pb.id = ?
      `, [current.id]);

      if (productBatchRows.length > 0) {
        const productBatch = productBatchRows[0];
        result.productBatches.push({ ...productBatch, level: current.level });
      }

      const [workOrderRows] = await pool.execute(`
        SELECT DISTINCT work_order_id
        FROM product_batches
        WHERE id = ?
      `, [current.id]);

      for (const wo of workOrderRows) {
        const key = `workorder-${wo.work_order_id}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ type: 'workorder', id: wo.work_order_id, level: current.level + 1 });
        }
      }
    } else if (current.type === 'workorder') {
      const [workOrderRows] = await pool.execute(`
        SELECT wo.*, p.name as product_name
        FROM work_orders wo
        LEFT JOIN products p ON wo.product_id = p.id
        WHERE wo.id = ?
      `, [current.id]);

      if (workOrderRows.length > 0) {
        const workOrder = workOrderRows[0];
        result.workOrders.push({ ...workOrder, level: current.level });
      }

      const [materialRows] = await pool.execute(`
        SELECT DISTINCT material_batch_id
        FROM work_order_materials
        WHERE work_order_id = ?
      `, [current.id]);

      for (const m of materialRows) {
        const key = `material-${m.material_batch_id}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ type: 'material', id: m.material_batch_id, level: current.level + 1 });
        }
      }
    } else if (current.type === 'material') {
      const [materialRows] = await pool.execute(`
        SELECT mb.*, m.name as material_name, s.name as supplier_name
        FROM material_batches mb
        LEFT JOIN materials m ON mb.material_id = m.id
        LEFT JOIN suppliers s ON mb.supplier_id = s.id
        WHERE mb.id = ?
      `, [current.id]);

      if (materialRows.length > 0) {
        const material = materialRows[0];
        result.materialBatches.push({ ...material, level: current.level });
      }
    }
  }

  return result;
}

module.exports = {
  traceForwardFromMaterial,
  traceBackwardFromProduct
};
