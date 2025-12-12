# NTUST 點餐系統 - 前端

這是 NTUST 點餐系統的前端應用，使用 Vue 3 + Vite 建構。

## 技術棧

- **框架**: Vue 3 (Composition API)
- **構建工具**: Vite 7
- **路由**: Vue Router 4
- **狀態管理**: Pinia 3
- **HTTP 客戶端**: Axios
- **樣式**: CSS3

## 功能特色

### 已實現的功能

1. **餐廳列表** - 瀏覽所有可用的餐廳
2. **餐廳詳情** - 查看餐廳的所有餐點
3. **購物車管理** - 新增、刪除、修改購物車內容
4. **結帳流程** - 完整的結帳和付款流程
5. **訂單查詢** - 依日期和狀態查詢訂單
6. **訂單詳情** - 查看訂單明細和取餐號碼

### 頁面結構

```
/ - 餐廳列表頁
/restaurant/:id - 餐廳詳情頁（餐點列表）
/cart - 購物車頁面
/checkout - 結帳頁面
/orders - 訂單查詢頁面
/order/:id - 訂單詳情頁面
```

## 專案結構

```
client/
├── src/
│   ├── assets/           # 靜態資源
│   ├── components/       # 共用組件
│   ├── services/         # API 服務層
│   │   ├── api.js              # Axios 配置
│   │   ├── restaurantService.js # 餐廳 API
│   │   ├── itemService.js       # 餐點 API
│   │   ├── cartService.js       # 購物車 API
│   │   └── orderService.js      # 訂單 API
│   ├── stores/           # Pinia 狀態管理
│   │   ├── restaurantStore.js   # 餐廳狀態
│   │   ├── cartStore.js         # 購物車狀態
│   │   └── orderStore.js        # 訂單狀態
│   ├── views/            # 頁面組件
│   │   ├── RestaurantsView.vue       # 餐廳列表
│   │   ├── RestaurantDetailView.vue  # 餐廳詳情
│   │   ├── CartView.vue              # 購物車
│   │   ├── CheckoutView.vue          # 結帳
│   │   ├── OrdersView.vue            # 訂單查詢
│   │   └── OrderDetailView.vue       # 訂單詳情
│   ├── router/           # 路由配置
│   ├── App.vue           # 主組件
│   └── main.js           # 應用入口
├── .env                  # 環境變數
├── package.json          # 專案配置
└── vite.config.js        # Vite 配置
```

## 環境配置

在 `.env` 文件中設定後端 API 地址：

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 安裝與啟動

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

應用將運行在 http://localhost:5173 或 http://localhost:5174

### 生產構建

```bash
npm run build
```

### 預覽生產構建

```bash
npm run preview
```

### 程式碼格式化

```bash
npm run format
```

## API 整合

所有 API 調用都通過 `src/services/` 目錄下的服務層進行。每個服務對應後端的一組相關 API：

- **restaurantService** - 餐廳相關操作
- **itemService** - 餐點相關操作
- **cartService** - 購物車相關操作
- **orderService** - 訂單相關操作

## 狀態管理

使用 Pinia 進行狀態管理，主要 stores：

- **restaurantStore** - 管理餐廳和餐點資料
- **cartStore** - 管理購物車狀態，包含計算屬性如總金額、總數量
- **orderStore** - 管理訂單狀態和歷史記錄

## 使用流程

1. **瀏覽餐廳** - 在首頁選擇想要點餐的餐廳
2. **選擇餐點** - 進入餐廳後，瀏覽並選擇餐點加入購物車
3. **查看購物車** - 點擊右上角的購物車按鈕，查看已選餐點
4. **調整數量** - 在購物車中可以增加或減少餐點數量
5. **結帳** - 點擊結帳按鈕，選擇付款方式（現金或卡片）
6. **完成訂單** - 付款後會顯示取餐號碼
7. **查詢訂單** - 可以在訂單查詢頁面查看歷史訂單

## 注意事項

1. **後端依賴** - 前端需要後端 API 運行在 http://localhost:3000
2. **Redis 依賴** - 購物車功能依賴 Redis，確保後端 Redis 服務正常運行
3. **MongoDB 依賴** - 所有資料儲存依賴 MongoDB
4. **無登入功能** - 目前系統沒有用戶登入功能
5. **無金流整合** - 付款功能僅為模擬，未接入真實金流

## 開發建議

- 使用 Vue DevTools 進行除錯
- 確保後端 API 正常運行
- 檢查瀏覽器控制台的錯誤訊息
- 使用 Prettier 保持程式碼格式一致

## 瀏覽器支援

- Chrome (推薦)
- Firefox
- Safari
- Edge

## 相關連結

- [Vue 3 文檔](https://vuejs.org/)
- [Vite 文檔](https://vitejs.dev/)
- [Vue Router 文檔](https://router.vuejs.org/)
- [Pinia 文檔](https://pinia.vuejs.org/)
- [Axios 文檔](https://axios-http.com/)
