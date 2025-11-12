const express = require('express');
const router = express.Router();
const models = require('../models');
const ExcelJS = require('exceljs');

// ========== Story 0：建立訂單 ==========
router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    // 驗證 items 不能為空
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create order with empty items'
      });
    }

    // 驗證商品並計算價格
    let totalPrice = 0;
    const orderItems = [];

    for (let orderItem of items) {
      // 驗證必要欄位
      if (!orderItem.itemId || !orderItem.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have itemId and quantity'
        });
      }

      // 驗證數量
      if (orderItem.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      // 查詢商品是否存在
      const item = await models.item.findOne({ id: orderItem.itemId });
      if (!item) {
        return res.status(400).json({
          success: false,
          message: `Item ${orderItem.itemId} not found`
        });
      }

      // 計算小計
      const itemTotalPrice = item.price * orderItem.quantity;
      totalPrice += itemTotalPrice;

      orderItems.push({
        itemId: orderItem.itemId,
        quantity: orderItem.quantity,
        itemTotalPrice: itemTotalPrice
      });
    }

    // 建立訂單
    const newOrder = await models.orders.create({
      items: orderItems,
      totalPrice: totalPrice,
      status: 'CREATED'
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: newOrder._id,
        totalPrice: newOrder.totalPrice,
        status: newOrder.status,
        orderDate: newOrder.orderDate
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// ========== Story 2：付款 ==========
router.post('/:id/payments', async (req, res) => {
  try {
    const { method } = req.body;

    // 驗證付款方式
    if (!method || !['cash', 'card'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be "cash" or "card"'
      });
    }

    // 查詢訂單
    const order = await models.orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 檢查訂單狀態
    if (order.status !== 'CREATED') {
      return res.status(400).json({
        success: false,
        message: `Cannot pay for order with status ${order.status}. Only orders with status CREATED can be paid.`
      });
    }

    // 產生取餐號碼（當日流水號）
    const pickupNumber = await generatePickupNumber();

    // 更新訂單
    order.status = 'PAID';
    order.paymentMethod = method;
    order.pickupNumber = pickupNumber;
    order.paidAt = new Date();
    await order.save();

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        pickupNumber: pickupNumber,
        totalPrice: order.totalPrice,
        paidAt: order.paidAt
      }
    });

  } catch (error) {
    console.error('Payment error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Payment failed'
    });
  }
});

// ========== 輔助函數：產生取餐號碼 ==========
async function generatePickupNumber() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // 查詢今天已經有多少已付款訂單
  const count = await models.orders.countDocuments({
    status: { $in: ['PAID', 'PREPARING', 'READY', 'COMPLETED'] },
    paidAt: { $gte: today, $lt: tomorrow }
  });
  
  // 流水號 = 今日已付款訂單數 + 1，補零到3位數
  const number = (count + 1).toString().padStart(3, '0');
  return number;
}

// ========== Story 3：查詢訂單明細 ==========
router.get('/:id', async (req, res) => {
  try {
    const order = await models.orders.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ========== Story 4：產生營收報表 ==========
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;

    // 驗證 date 參數
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: date (format: YYYY-MM-DD)'
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // 設定日期範圍
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // 查詢該日所有已付款訂單
    const orders = await models.orders.find({
      status: 'PAID',
      paidAt: { $gte: startDate, $lt: endDate }
    });

    // 統計每個商品的銷售數量
    const itemStats = {};

    for (let order of orders) {
      for (let item of order.items) {
        if (!itemStats[item.itemId]) {
          itemStats[item.itemId] = 0;
        }
        itemStats[item.itemId] += item.quantity;
      }
    }

    // 查詢商品名稱
    const reportData = [];
    for (let itemId in itemStats) {
      const item = await models.item.findOne({ id: itemId });
      reportData.push({
        date: date,
        item_name: item ? item.name : itemId,
        number: itemStats[itemId]
      });
    }

    // 生成 Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // 設定欄位
    worksheet.columns = [
      { header: 'date', key: 'date', width: 15 },
      { header: 'item_name', key: 'item_name', width: 20 },
      { header: 'number', key: 'number', width: 10 }
    ];

    // 加入資料
    reportData.forEach(row => {
      worksheet.addRow(row);
    });

    // 設定回應標頭
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=orders_${date}.xlsx`
    );

    // 輸出 Excel
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
});

module.exports = router;