const request = require('supertest');
const app = require('../index');
const models = require('../models');

describe('Item API 測試', () => {
  
  // 測試 GET /api/items/:id - 取得特定餐點的完整內容
  describe('GET /api/items/:id', () => {
    it('應該成功取得特定餐點的完整內容', async () => {
      // 假設資料庫中已有 mcd001 這個商品
      const res = await request(app)
        .get('/api/items/mcd001')
        .expect(200);
      
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('price');
      expect(res.body).toHaveProperty('restaurantId');
      expect(res.body.id).toBe('mcd001');
    });
    
    it('應該在查不到餐點時回傳 404 狀態碼', async () => {
      const res = await request(app)
        .get('/api/items/nonexistent-item')
        .expect(404);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('找不到該餐點');
    });
    
    it('應該在資料庫錯誤時回傳 500 狀態碼', async () => {
      // 模擬資料庫錯誤
      jest.spyOn(models.item, 'findOne').mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app)
        .get('/api/items/mcd001')
        .expect(500);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('資料庫抓取錯誤');
      
      // 恢復原始函數
      models.item.findOne.mockRestore();
    });
  });

  // 測試 GET /api/items/:restaurant/:type - 取得某餐廳的特定分類下的所有餐點
  describe('GET /api/items/:restaurant/:type', () => {
    it('應該成功取得特定餐廳的特定分類餐點', async () => {
      const res = await request(app)
        .get('/api/items/mcd/main')
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      
      // 如果有資料，驗證資料格式
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('price');
        expect(res.body[0]).toHaveProperty('type');
        expect(res.body[0]).toHaveProperty('restaurantId');
        expect(res.body[0].restaurantId).toBe('mcd');
        expect(res.body[0].type).toBe('main');
      }
    });
    
    it('應該在該分類沒有餐點時回傳空陣列', async () => {
      const res = await request(app)
        .get('/api/items/mcd/nonexistent-type')
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
    
    it('應該在資料庫錯誤時回傳 500 狀態碼', async () => {
      // 模擬資料庫錯誤
      jest.spyOn(models.item, 'find').mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app)
        .get('/api/items/mcd/main')
        .expect(500);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('資料庫抓取錯誤');
      
      // 恢復原始函數
      models.item.find.mockRestore();
    });
  });
});
