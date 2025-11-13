const express = require('express');
const router = express.Router();
const models = require('../models');

// ========== Story 0：建立購物車 ==========
router.post('/', async (req, res) => {
  try {
    const newOrder = await models.orders.create({
      items: [],
      totalPrice: 0,
      status: 'DRAFT'
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: newOrder._id,
        status: newOrder.status,
        totalPrice: newOrder.totalPrice,
        createdAt: newOrder.createdAt
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

// ========== Story 1：結算訂單 ==========
router.post('/:id/checkout', async (req, res) => {
  try {
    // 查詢訂單
    const order = await models.orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 檢查訂單狀態
    if (order.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Order already checked out'
      });
    }

    // 檢查購物車是否為空
    if (order.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot checkout empty cart'
      });
    }

    // 重新驗證商品並計算價格
    let totalPrice = 0;
    const updatedItems = [];

    for (let orderItem of order.items) {
      const item = await models.item.findOne({ id: orderItem.itemId });
      
      if (!item) {
        return res.status(400).json({
          success: false,
          message: `Item ${orderItem.itemId} not found`
        });
      }

      // 重新計算價格（以資料庫的價格為準）
      const itemTotalPrice = item.price * orderItem.quantity;
      totalPrice += itemTotalPrice;

      updatedItems.push({
        itemId: orderItem.itemId,
        quantity: orderItem.quantity,
        itemTotalPrice: itemTotalPrice
      });
    }

    // 更新訂單
    order.items = updatedItems;
    order.totalPrice = totalPrice;
    order.status = 'CREATED';
    order.orderDate = new Date();
    await order.save();

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Checkout failed'
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
        message: `Cannot pay for order with status ${order.status}`
      });
    }

    // 產生取餐號碼（當日流水號）
    const pickupNumber = await generatePickupNumber();

    // 更新訂單（付款一定成功）
    order.status = 'PAID';
    order.paymentMethod = method;
    order.pickupNumber = pickupNumber;
    order.paidAt = new Date();
    await order.save();

    // TODO: 刪除 redis 暫存的這筆購物車的資料

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        pickupNumber: pickupNumber,
        totalPrice: order.totalPrice,
        paidAt: order.paidAt
      },
      message: `Payment successful. Your pickup number is ${pickupNumber}`
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

// ========== Story 4：查詢特定日期訂單 ==========
router.get('/', async (req, res) => {
  try {
    const { date, status } = req.query;
    const query = {};

    // 日期篩選
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.orderDate = {
        $gte: startDate,
        $lt: endDate
      };
    } else {
      // 不傳 date 時查詢今日
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      query.orderDate = {
        $gte: today,
        $lt: tomorrow
      };
    }

    // 狀態篩選
    if (status) {
      const validStatuses = ['DRAFT', 'CREATED', 'PAID', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      query.status = status;
    }

    const orders = await models.orders.find(query).sort({ orderDate: -1 });

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;