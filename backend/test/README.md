# 後端 API 測試套件說明

本專案已為所有後端 API 端點建立完整的測試套件。測試檔案位於 `backend/test/` 目錄下。

## 測試檔案結構

```
backend/test/
├── cart.test.js        # 購物車 API 測試
├── item.test.js        # 商品 API 測試
├── restaurant.test.js  # 餐廳 API 測試
├── order.test.js       # 訂單 API 測試
└── setup.js           # 測試環境設定
```

## 測試涵蓋的端點

### 重要提醒
在執行測試前，請確保：
1. **MongoDB 資料庫已啟動並有測試資料**
2. **Redis 服務已啟動**
3. **執行 `npm run init` 初始化測試資料**（如果專案有此腳本）

### 1. Cart API (`cart.test.js`)
- **POST /api/cart/new** - 初始化購物車
  - ✓ 成功初始化空購物車
  - ✓ Redis 錯誤處理

- **GET /api/cart** - 取得購物車內容
  - ✓ 取得空購物車
  - ✓ 取得有商品的購物車
  - ✓ 購物車不存在時的處理
  - ✓ Redis 錯誤處理

- **POST /api/cart** - 新增購物車項目
  - ✓ 新增商品到空購物車
  - ✓ 增加已存在商品的數量
  - ✓ 缺少必填欄位驗證 (itemId, price)
  - ✓ amount 預設值測試
  - ✓ amount 正整數驗證
  - ✓ Redis 錯誤處理

- **DELETE /api/cart/item** - 刪除購物車項目
  - ✓ 減少商品數量（數量 > 1）
  - ✓ 刪除整個商品（數量 = 1）
  - ✓ 缺少 itemId 驗證
  - ✓ 購物車不存在處理
  - ✓ 商品不存在處理
  - ✓ Redis 錯誤處理

- **DELETE /api/cart** - 清空購物車
  - ✓ 成功清空購物車
  - ✓ 清空已經是空的購物車
  - ✓ Redis 錯誤處理

**總計：22 個測試案例**

### 2. Item API (`item.test.js`)
- **GET /api/items/:id** - 取得特定餐點
  - ✓ 成功取得餐點資訊
  - ✓ 餐點不存在處理 (404)
  - ✓ 資料庫錯誤處理 (500)

- **GET /api/items/:restaurant/:type** - 取得餐廳特定分類餐點
  - ✓ 成功取得特定分類餐點
  - ✓ 該分類沒有餐點時回傳空陣列
  - ✓ 資料庫錯誤處理 (500)

**總計：6 個測試案例**

### 3. Restaurant API (`restaurant.test.js`)
- **GET /api/restaurants** - 取得所有餐廳
  - ✓ 成功取得所有餐廳資料
  - ✓ 沒有餐廳時回傳空陣列
  - ✓ 資料庫錯誤處理 (500)

- **GET /api/restaurants/:storeId** - 取得特定餐廳
  - ✓ 成功取得餐廳資訊
  - ✓ 餐廳不存在處理 (404)
  - ✓ 餐廳沒有商品時的處理
  - ✓ 資料庫錯誤處理 (500)

**總計：7 個測試案例**

### 4. Order API (`order.test.js`)
- **POST /api/orders** - 建立訂單
  - ✓ 成功建立訂單
  - ✓ 缺少 restaurantId 驗證
  - ✓ items 為空陣列驗證
  - ✓ 缺少 items 驗證
  - ✓ 商品缺少 itemId 或 quantity 驗證
  - ✓ quantity 小於等於 0 驗證
  - ✓ 商品不存在處理
  - ✓ 商品不屬於該餐廳處理

- **POST /api/orders/:id/payments** - 訂單付款
  - ✓ 使用現金付款
  - ✓ 使用信用卡付款
  - ✓ 缺少付款方式驗證
  - ✓ 付款方式無效驗證
  - ✓ 訂單不存在處理 (404)
  - ✓ 訂單 ID 格式無效處理 (400)
  - ✓ 訂單已付款處理
  - ✓ 不同餐廳獨立取餐號碼

- **GET /api/orders/:id** - 查詢訂單明細
  - ✓ 成功查詢訂單
  - ✓ 訂單不存在處理 (404)
  - ✓ 訂單 ID 格式無效處理 (400)
  - ✓ 查詢已付款訂單資訊

- **GET /api/orders** - 產生營收報表
  - ✓ 成功產生 Excel 報表
  - ✓ 缺少 date 參數驗證
  - ✓ 缺少 restaurantId 參數驗證
  - ✓ 日期格式無效驗證（斜線格式）
  - ✓ 日期格式無效驗證（缺少零）
  - ✓ 只回傳指定餐廳的報表

**總計：28 個測試案例**

## 執行測試

### 執行所有測試
```bash
npm test
```

### 執行特定測試檔案
```bash
# 只測試購物車 API
npm test -- cart.test.js

# 只測試商品 API
npm test -- item.test.js

# 只測試餐廳 API
npm test -- restaurant.test.js

# 只測試訂單 API
npm test -- order.test.js
```

### 執行測試並顯示覆蓋率
```bash
npm test -- --coverage
```

## 測試重點功能

### 1. 輸入驗證測試
- 必填欄位驗證
- 資料格式驗證
- 數值範圍驗證

### 2. 業務邏輯測試
- 正常流程測試
- 邊界條件測試
- 錯誤處理測試

### 3. 錯誤處理測試
- 404 錯誤（資源不存在）
- 400 錯誤（請求參數錯誤）
- 500 錯誤（伺服器錯誤）

### 4. 資料一致性測試
- Redis 資料驗證
- 資料庫資料驗證
- 多步驟操作驗證

## 測試資料準備

測試使用真實的資料庫連接，**務必**按以下步驟準備：

### 1. 啟動必要服務
```bash
# 啟動 MongoDB
brew services start mongodb-community

# 啟動 Redis
brew services start redis
```

### 2. 初始化測試資料
```bash
# 在 backend 目錄下執行
cd backend
node scripts/initData.js
```

這將會在資料庫中建立：
- 餐廳資料（mcd, kfc 等）
- 商品資料（mcd001, mcd003, kfc001 等）

### 3. 確認服務運行
```bash
# 檢查 MongoDB
mongosh

# 檢查 Redis
redis-cli ping
```

## 注意事項

1. **Redis 連接**：測試需要 Redis 服務運行，每個測試前會清理購物車資料
2. **資料庫資料**：部分測試假設資料庫中已有特定資料（如 mcd001 商品）
3. **Mock 測試**：某些錯誤處理測試使用 Jest mock 模擬錯誤情況
4. **非同步測試**：所有測試都是非同步的，使用 async/await 語法

## 測試統計

- **總測試檔案**：4 個
- **總測試案例**：63 個
- **涵蓋端點**：13 個 API 端點
- **測試類型**：正向測試 + 負向測試 + 邊界測試

## 未來改進建議

1. 增加整合測試（跨 API 的完整流程測試）
2. 增加效能測試（併發請求、大量資料）
3. 增加安全性測試（SQL 注入、XSS 等）
4. 使用測試資料庫隔離環境
5. 增加 CI/CD 自動化測試
