const request = require('supertest');
const app = require('../index'); // 引入完整的 Express 應用程式
const redis = require('../redis'); // 引入 Redis 連接

// 測試前後清理 Redis
beforeEach(async () => {
  await redis.del('cart');
});

afterAll(async () => {
  await redis.disconnect();
});

describe('Cart API 測試', () => {
  
  // 測試 POST /api/cart/new - 初始化購物車
  describe('POST /api/cart/new', () => {
    it('應該成功初始化空的購物車', async () => {
      const res = await request(app)
        .post('/api/cart/new')
        .expect(200);
      
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('購物車已初始化');
      
      // 驗證 Redis 中確實有空的購物車資料
      const cartData = await redis.get('cart');
      expect(JSON.parse(cartData)).toEqual({});
    });
    
    it('應該在 Redis 錯誤時回傳 500 狀態碼', async () => {
      // 模擬 Redis 錯誤 - 先斷開連接
      await redis.disconnect();
      
      const res = await request(app)
        .post('/api/cart/new')
        .expect(500);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('快取抓取錯誤');
      
      // 重新連接 Redis 供後續測試使用
      await redis.connect();
    });
  });

  // 測試 POST /api/cart - 新增購物車項目
  describe('POST /api/cart', () => {
    
    beforeEach(async () => {
      // 每個測試前都初始化空的購物車
      await redis.set('cart', JSON.stringify({}));
    });
    
    it('應該成功新增商品到空購物車', async () => {
      const newItem = {
        itemId: 'mcd001',
        price: 278,
        amount: 2
      };
      
      const res = await request(app)
        .post('/api/cart')
        .send(newItem)
        .expect(200);
      
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('mcd001');
      expect(res.body.data.mcd001.price).toBe(278);
      expect(res.body.data.mcd001.amount).toBe(2);
      
      // 驗證 Redis 中的資料
      const cartData = await redis.get('cart');
      const parsedCart = JSON.parse(cartData);
      expect(parsedCart).toHaveProperty('mcd001');
      expect(parsedCart.mcd001.price).toBe(278);
      expect(parsedCart.mcd001.amount).toBe(2);
    });
    
    it('應該成功增加已存在商品的數量', async () => {
      // 先在購物車中放入一個商品
      const existingCart = {
        'mcd003': { price: 65, amount: 1 }
      };
      await redis.set('cart', JSON.stringify(existingCart));
      
      const addItem = {
        itemId: 'mcd003',
        price: 65,
        amount: 3
      };
      
      const res = await request(app)
        .post('/api/cart')
        .send(addItem)
        .expect(200);
      
      expect(res.body.data.mcd003.amount).toBe(4); // 1 + 3 = 4
      expect(res.body.data.mcd003.price).toBe(65);
    });
    
    it('應該在缺少 itemId 時回傳 400 狀態碼', async () => {
      const invalidItem = {
        price: 120,
        amount: 2
        // 缺少 itemId
      };
      
      const res = await request(app)
        .post('/api/cart')
        .send(invalidItem)
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('itemId 和 price 是必填欄位');
    });
    
    it('應該在缺少 price 時回傳 400 狀態碼', async () => {
      const invalidItem = {
        itemId: 'mcd001',
        amount: 2
        // 缺少 price
      };
      
      const res = await request(app)
        .post('/api/cart')
        .send(invalidItem)
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('itemId 和 price 是必填欄位');
    });
    
    it('應該在沒有提供 amount 時使用預設值 1', async () => {
      const itemWithoutAmount = {
        itemId: 'mcd003',
        price: 65
        // 沒有 amount，應該使用預設值 1
      };
      
      const res = await request(app)
        .post('/api/cart')
        .send(itemWithoutAmount)
        .expect(200);
      
      expect(res.body.data.mcd003.price).toBe(65);
      expect(res.body.data.mcd003.amount).toBe(1); // 預設值
    });
    
    it('應該在 amount 不是正整數時回傳 400 狀態碼', async () => {
      const invalidItem = {
        itemId: 'item003',
        price: 100,
        amount: -1 // 負數
      };
      
      const res = await request(app)
        .post('/api/cart')
        .send(invalidItem)
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('amount 必須是正整數');
    });
    
    it('應該在 amount 為 0 時回傳 400 狀態碼', async () => {
      const invalidItem = {
        itemId: 'mcd001',
        price: 139,
        amount: 0 // 零
      };
      
      const res = await request(app)
        .post('/api/cart')
        .send(invalidItem)
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('amount 必須是正整數');
    });
  });

  // 測試 GET /api/cart - 取得購物車內容
  describe('GET /api/cart', () => {
    it('應該成功取得空的購物車', async () => {
      // 初始化空購物車
      await redis.set('cart', JSON.stringify({}));
      
      const res = await request(app)
        .get('/api/cart')
        .expect(200);
      
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toEqual({});
    });
    
    it('應該成功取得有商品的購物車', async () => {
      const cartData = {
        'mcd001': { price: 278, amount: 2 },
        'mcd003': { price: 65, amount: 1 }
      };
      await redis.set('cart', JSON.stringify(cartData));
      
      const res = await request(app)
        .get('/api/cart')
        .expect(200);
      
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('mcd001');
      expect(res.body.data).toHaveProperty('mcd003');
      expect(res.body.data.mcd001.price).toBe(278);
      expect(res.body.data.mcd001.amount).toBe(2);
      expect(res.body.data.mcd003.price).toBe(65);
      expect(res.body.data.mcd003.amount).toBe(1);
    });
    
    it('應該在購物車不存在時回傳空物件', async () => {
      // 確保 Redis 中沒有購物車資料
      await redis.del('cart');
      
      const res = await request(app)
        .get('/api/cart')
        .expect(200);
      
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toEqual({});
    });
    
    it('應該在 Redis 錯誤時回傳 500 狀態碼', async () => {
      // 模擬 Redis 錯誤
      await redis.disconnect();
      
      const res = await request(app)
        .get('/api/cart')
        .expect(500);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('redis 快取錯誤');
      
      // 重新連接 Redis
      await redis.connect();
    });
  });

  // 測試 DELETE /api/cart/item - 刪除購物車項目
  describe('DELETE /api/cart/item', () => {
    beforeEach(async () => {
      // 每個測試前都設定購物車資料
      const cartData = {
        'mcd001': { price: 278, amount: 3 },
        'mcd003': { price: 65, amount: 1 }
      };
      await redis.set('cart', JSON.stringify(cartData));
    });
    
    it('應該成功減少商品數量（數量 > 1）', async () => {
      const res = await request(app)
        .delete('/api/cart/item')
        .send({ itemId: 'mcd001' })
        .expect(200);
      
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.mcd001.amount).toBe(2); // 3 - 1 = 2
      expect(res.body.data.mcd001.price).toBe(278);
      expect(res.body.data).toHaveProperty('mcd003');
    });
    
    it('應該在數量為 1 時刪除整個商品', async () => {
      const res = await request(app)
        .delete('/api/cart/item')
        .send({ itemId: 'mcd003' })
        .expect(200);
      
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).not.toHaveProperty('mcd003'); // 應該被刪除
      expect(res.body.data).toHaveProperty('mcd001'); // 其他商品應該還在
    });
    
    it('應該在缺少 itemId 時回傳 400 狀態碼', async () => {
      const res = await request(app)
        .delete('/api/cart/item')
        .send({})
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('itemId 是必填欄位');
    });
    
    it('應該在購物車不存在時回傳 404 狀態碼', async () => {
      // 刪除購物車
      await redis.del('cart');
      
      const res = await request(app)
        .delete('/api/cart/item')
        .send({ itemId: 'mcd001' })
        .expect(404);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('查不到購物車資料，無法刪除');
    });
    
    it('應該在商品不存在時回傳 404 狀態碼', async () => {
      const res = await request(app)
        .delete('/api/cart/item')
        .send({ itemId: 'nonexistent-item' })
        .expect(404);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('查不到商品，無法刪除');
    });
    
    it('應該在 Redis 錯誤時回傳 500 狀態碼', async () => {
      // 模擬 Redis 錯誤
      await redis.disconnect();
      
      const res = await request(app)
        .delete('/api/cart/item')
        .send({ itemId: 'mcd001' })
        .expect(500);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('快取抓取錯誤');
      
      // 重新連接 Redis
      await redis.connect();
    });
  });

  // 測試 DELETE /api/cart - 刪除整個購物車
  describe('DELETE /api/cart', () => {
    beforeEach(async () => {
      // 每個測試前都設定購物車資料
      const cartData = {
        'mcd001': { price: 278, amount: 2 },
        'mcd003': { price: 65, amount: 1 }
      };
      await redis.set('cart', JSON.stringify(cartData));
    });
    
    it('應該成功清空購物車', async () => {
      const res = await request(app)
        .delete('/api/cart')
        .expect(200);
      
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('購物車已清空');
      
      // 驗證 Redis 中購物車已被清空
      const cartData = await redis.get('cart');
      expect(JSON.parse(cartData)).toEqual({});
    });
    
    it('應該在購物車已經是空的時候也能正常執行', async () => {
      // 先清空購物車
      await redis.set('cart', JSON.stringify({}));
      
      const res = await request(app)
        .delete('/api/cart')
        .expect(200);
      
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('購物車已清空');
      
      // 驗證 Redis 中購物車仍是空的
      const cartData = await redis.get('cart');
      expect(JSON.parse(cartData)).toEqual({});
    });
    
    it('應該在 Redis 錯誤時回傳 500 狀態碼', async () => {
      // 模擬 Redis 錯誤
      await redis.disconnect();
      
      const res = await request(app)
        .delete('/api/cart')
        .expect(500);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('快取抓取錯誤');
      
      // 重新連接 Redis
      await redis.connect();
    });
  });
});