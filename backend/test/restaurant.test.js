const request = require('supertest');
const app = require('../index');
const models = require('../models');

describe('Restaurant API 測試', () => {
  
  // 測試 GET /api/restaurants - 回傳所有餐廳的資料
  describe('GET /api/restaurants', () => {
    it('應該成功取得所有餐廳的資料', async () => {
      const res = await request(app)
        .get('/api/restaurants')
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      
      // 如果有資料，驗證資料格式
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('cusines');
        expect(Array.isArray(res.body[0].cusines)).toBe(true);
        
        // 驗證 cusines 資料格式
        if (res.body[0].cusines.length > 0) {
          expect(res.body[0].cusines[0]).toHaveProperty('name');
          expect(res.body[0].cusines[0]).toHaveProperty('price');
        }
      }
    });
    
    it('應該在沒有餐廳資料時回傳空陣列', async () => {
      // 模擬沒有餐廳資料的情況
      jest.spyOn(models.restaurant, 'find').mockResolvedValueOnce([]);
      
      const res = await request(app)
        .get('/api/restaurants')
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
      
      // 恢復原始函數
      models.restaurant.find.mockRestore();
    });
    
    it('應該在資料庫錯誤時回傳 500 狀態碼', async () => {
      // 模擬資料庫錯誤
      jest.spyOn(models.restaurant, 'find').mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app)
        .get('/api/restaurants')
        .expect(500);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('資料庫抓取錯誤');
      
      // 恢復原始函數
      models.restaurant.find.mockRestore();
    });
  });

  // 測試 GET /api/restaurants/:storeId - 獲得特定餐廳的餐點資料
  describe('GET /api/restaurants/:storeId', () => {
    it('應該成功取得特定餐廳的餐點資料', async () => {
      // 假設資料庫中已有 mcd 這個餐廳
      const res = await request(app)
        .get('/api/restaurants/mcd')
        .expect(200);
      
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('cusines');
      expect(Array.isArray(res.body.cusines)).toBe(true);
      expect(res.body.id).toBe('mcd');
      
      // 驗證 cusines 包含完整的商品資料
      if (res.body.cusines.length > 0) {
        expect(res.body.cusines[0]).toHaveProperty('id');
        expect(res.body.cusines[0]).toHaveProperty('name');
        expect(res.body.cusines[0]).toHaveProperty('price');
        expect(res.body.cusines[0]).toHaveProperty('type');
      }
    });
    
    it('應該在查不到餐廳時回傳 404 狀態碼', async () => {
      const res = await request(app)
        .get('/api/restaurants/nonexistent-store')
        .expect(404);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('找不到該餐廳');
    });
    
    it('應該在餐廳沒有商品時回傳空的 cusines 陣列', async () => {
      // 模擬餐廳存在但沒有商品
      const mockRestaurant = {
        id: 'test-store',
        name: '測試餐廳',
        cusines: []
      };
      
      jest.spyOn(models.restaurant, 'findOne').mockResolvedValueOnce(mockRestaurant);
      jest.spyOn(models.item, 'find').mockResolvedValueOnce([]);
      
      const res = await request(app)
        .get('/api/restaurants/test-store')
        .expect(200);
      
      expect(res.body).toHaveProperty('cusines');
      expect(res.body.cusines.length).toBe(0);
      
      // 恢復原始函數
      models.restaurant.findOne.mockRestore();
      models.item.find.mockRestore();
    });
    
    it('應該在資料庫錯誤時回傳 500 狀態碼', async () => {
      // 模擬資料庫錯誤
      jest.spyOn(models.restaurant, 'findOne').mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app)
        .get('/api/restaurants/mcd')
        .expect(500);
      
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('資料庫抓取錯誤');
      
      // 恢復原始函數
      models.restaurant.findOne.mockRestore();
    });
  });
});
