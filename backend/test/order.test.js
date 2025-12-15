const request = require('supertest');
const app = require('../index');
const models = require('../models');

describe('Order API 測試', () => {
  
  // 測試 POST /api/orders - 建立訂單
  describe('POST /api/orders', () => {
    it('應該成功建立訂單', async () => {
      const orderData = {
        restaurantId: 'mcd',
        items: [
          { itemId: 'mcd001', quantity: 2 },
          { itemId: 'mcd003', quantity: 1 }
        ]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('orderId');
      expect(res.body.data).toHaveProperty('totalPrice');
      expect(res.body.data).toHaveProperty('status', 'CREATED');
      expect(res.body.data).toHaveProperty('orderDate');
      expect(res.body.data.totalPrice).toBeGreaterThan(0);
    });
    
    it('應該在缺少 restaurantId 時回傳 400 狀態碼', async () => {
      const orderData = {
        items: [
          { itemId: 'mcd001', quantity: 2 }
        ]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'restaurantId is required');
    });
    
    it('應該在 items 為空陣列時回傳 400 狀態碼', async () => {
      const orderData = {
        restaurantId: 'mcd',
        items: []
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Cannot create order with empty items');
    });
    
    it('應該在缺少 items 時回傳 400 狀態碼', async () => {
      const orderData = {
        restaurantId: 'mcd'
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Cannot create order with empty items');
    });
    
    it('應該在商品缺少 itemId 或 quantity 時回傳 400 狀態碼', async () => {
      const orderData = {
        restaurantId: 'mcd',
        items: [
          { itemId: 'mcd001' } // 缺少 quantity
        ]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Each item must have itemId and quantity');
    });
    
    it('應該在 quantity 小於等於 0 時回傳 400 狀態碼', async () => {
      const orderData = {
        restaurantId: 'mcd',
        items: [
          { itemId: 'mcd001', quantity: 0 }
        ]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Quantity must be greater than 0');
    });
    
    it('應該在商品不存在時回傳 400 狀態碼', async () => {
      const orderData = {
        restaurantId: 'mcd',
        items: [
          { itemId: 'nonexistent-item', quantity: 1 }
        ]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('not found');
    });
    
    it('應該在商品不屬於該餐廳時回傳 400 狀態碼', async () => {
      // 假設 kfc001 是肯德基的商品，不屬於麥當勞
      const orderData = {
        restaurantId: 'mcd',
        items: [
          { itemId: 'kfc001', quantity: 1 }
        ]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('not found');
    });
  });

  // 測試 POST /api/orders/:id/payments - 付款
  describe('POST /api/orders/:id/payments', () => {
    let testOrderId;
    
    beforeEach(async () => {
      // 建立一個測試訂單
      const orderData = {
        restaurantId: 'mcd',
        items: [
          { itemId: 'mcd001', quantity: 1 }
        ]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      testOrderId = res.body.data.orderId;
    });
    
    it('應該成功使用現金付款', async () => {
      const res = await request(app)
        .post(`/api/orders/${testOrderId}/payments`)
        .send({ method: 'cash' })
        .expect(200);
      
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('orderId', testOrderId);
      expect(res.body.data).toHaveProperty('status', 'PAID');
      expect(res.body.data).toHaveProperty('pickupNumber');
      expect(res.body.data).toHaveProperty('totalPrice');
      expect(res.body.data).toHaveProperty('paidAt');
      expect(res.body.data.pickupNumber).toMatch(/^\d{3}$/); // 取餐號碼應為 3 位數字
    });
    
    it('應該成功使用信用卡付款', async () => {
      const res = await request(app)
        .post(`/api/orders/${testOrderId}/payments`)
        .send({ method: 'card' })
        .expect(200);
      
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('status', 'PAID');
      expect(res.body.data).toHaveProperty('pickupNumber');
    });
    
    it('應該在缺少付款方式時回傳 400 狀態碼', async () => {
      const res = await request(app)
        .post(`/api/orders/${testOrderId}/payments`)
        .send({})
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid payment method. Must be "cash" or "card"');
    });
    
    it('應該在付款方式無效時回傳 400 狀態碼', async () => {
      const res = await request(app)
        .post(`/api/orders/${testOrderId}/payments`)
        .send({ method: 'bitcoin' })
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid payment method. Must be "cash" or "card"');
    });
    
    it('應該在訂單不存在時回傳 404 狀態碼', async () => {
      const fakeOrderId = '507f1f77bcf86cd799439011'; // 有效的 ObjectId 格式但不存在
      
      const res = await request(app)
        .post(`/api/orders/${fakeOrderId}/payments`)
        .send({ method: 'cash' })
        .expect(404);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Order not found');
    });
    
    it('應該在訂單 ID 格式無效時回傳 400 狀態碼', async () => {
      const res = await request(app)
        .post('/api/orders/invalid-id/payments')
        .send({ method: 'cash' })
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid order ID format');
    });
    
    it('應該在訂單已付款時回傳 400 狀態碼', async () => {
      // 先付款一次
      await request(app)
        .post(`/api/orders/${testOrderId}/payments`)
        .send({ method: 'cash' });
      
      // 再次嘗試付款
      const res = await request(app)
        .post(`/api/orders/${testOrderId}/payments`)
        .send({ method: 'cash' })
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('Cannot pay for order with status');
    });
    
    it('應該為不同餐廳產生獨立的取餐號碼', async () => {
      // 建立另一個餐廳的訂單
      const orderData2 = {
        restaurantId: 'kfc',
        items: [
          { itemId: 'kfc001', quantity: 1 }
        ]
      };
      
      const res2 = await request(app)
        .post('/api/orders')
        .send(orderData2);
      
      const testOrderId2 = res2.body.data.orderId;
      
      // 兩個訂單都付款
      const payment1 = await request(app)
        .post(`/api/orders/${testOrderId}/payments`)
        .send({ method: 'cash' });
      
      const payment2 = await request(app)
        .post(`/api/orders/${testOrderId2}/payments`)
        .send({ method: 'cash' });
      
      // 取餐號碼應該都是獨立計算的
      expect(payment1.body.data.pickupNumber).toMatch(/^\d{3}$/);
      expect(payment2.body.data.pickupNumber).toMatch(/^\d{3}$/);
    });
  });

  // 測試 GET /api/orders/:id - 查詢訂單明細
  describe('GET /api/orders/:id', () => {
    let testOrderId;
    
    beforeEach(async () => {
      // 建立一個測試訂單
      const orderData = {
        restaurantId: 'mcd',
        items: [
          { itemId: 'mcd001', quantity: 2 }
        ]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      testOrderId = res.body.data.orderId;
    });
    
    it('應該成功查詢訂單明細', async () => {
      const res = await request(app)
        .get(`/api/orders/${testOrderId}`)
        .expect(200);
      
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('_id', testOrderId);
      expect(res.body.data).toHaveProperty('restaurantId');
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('totalPrice');
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('orderDate');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });
    
    it('應該在訂單不存在時回傳 404 狀態碼', async () => {
      const fakeOrderId = '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .get(`/api/orders/${fakeOrderId}`)
        .expect(404);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Order not found');
    });
    
    it('應該在訂單 ID 格式無效時回傳 400 狀態碼', async () => {
      const res = await request(app)
        .get('/api/orders/invalid-id')
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid order ID format');
    });
    
    it('應該正確顯示已付款訂單的資訊', async () => {
      // 先付款
      await request(app)
        .post(`/api/orders/${testOrderId}/payments`)
        .send({ method: 'cash' });
      
      // 查詢訂單
      const res = await request(app)
        .get(`/api/orders/${testOrderId}`)
        .expect(200);
      
      expect(res.body.data).toHaveProperty('status', 'PAID');
      expect(res.body.data).toHaveProperty('paymentMethod', 'cash');
      expect(res.body.data).toHaveProperty('pickupNumber');
      expect(res.body.data).toHaveProperty('paidAt');
    });
  });

  // 測試 GET /api/orders - 產生營收報表
  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // 建立並付款幾個測試訂單
      const orderData1 = {
        restaurantId: 'mcd',
        items: [
          { itemId: 'mcd001', quantity: 2 },
          { itemId: 'mcd003', quantity: 1 }
        ]
      };
      
      const orderData2 = {
        restaurantId: 'mcd',
        items: [
          { itemId: 'mcd001', quantity: 1 }
        ]
      };
      
      const res1 = await request(app).post('/api/orders').send(orderData1);
      const res2 = await request(app).post('/api/orders').send(orderData2);
      
      await request(app)
        .post(`/api/orders/${res1.body.data.orderId}/payments`)
        .send({ method: 'cash' });
      
      await request(app)
        .post(`/api/orders/${res2.body.data.orderId}/payments`)
        .send({ method: 'cash' });
    });
    
    it('應該成功產生營收報表（Excel 格式）', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get('/api/orders')
        .query({ date: today, restaurantId: 'mcd' })
        .expect(200);
      
      // 驗證回應是 Excel 格式
      expect(res.headers['content-type']).toContain('spreadsheetml.sheet');
      expect(res.headers['content-disposition']).toContain(`orders_${today}.xlsx`);
    });
    
    it('應該在缺少 date 參數時回傳 400 狀態碼', async () => {
      const res = await request(app)
        .get('/api/orders')
        .query({ restaurantId: 'mcd' })
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Missing required parameter: date or restaurantId');
    });
    
    it('應該在缺少 restaurantId 參數時回傳 400 狀態碼', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get('/api/orders')
        .query({ date: today })
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Missing required parameter: date or restaurantId');
    });
    
    it('應該在日期格式無效時回傳 400 狀態碼', async () => {
      const res = await request(app)
        .get('/api/orders')
        .query({ date: '2024/12/16', restaurantId: 'mcd' })
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid date format. Use YYYY-MM-DD');
    });
    
    it('應該在日期格式無效（缺少零）時回傳 400 狀態碼', async () => {
      const res = await request(app)
        .get('/api/orders')
        .query({ date: '2024-1-1', restaurantId: 'mcd' })
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid date format. Use YYYY-MM-DD');
    });
    
    it('應該只回傳指定餐廳的報表', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // 建立其他餐廳的訂單
      const orderData = {
        restaurantId: 'kfc',
        items: [
          { itemId: 'kfc001', quantity: 1 }
        ]
      };
      
      const res = await request(app).post('/api/orders').send(orderData);
      await request(app)
        .post(`/api/orders/${res.body.data.orderId}/payments`)
        .send({ method: 'cash' });
      
      // 查詢麥當勞的報表
      const reportRes = await request(app)
        .get('/api/orders')
        .query({ date: today, restaurantId: 'mcd' })
        .expect(200);
      
      // 驗證回應是 Excel 格式
      expect(reportRes.headers['content-type']).toContain('spreadsheetml.sheet');
    });
  });
});
