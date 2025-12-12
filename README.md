# NTUST 點餐系統

這是國立臺灣科技大學 114-1 學期的軟體工程期末專案。

## 系統架構

- **前端**: Vue 3 + Vite + Pinia + Vue Router
- **後端**: Express.js + MongoDB + Redis
- **資料庫**: MongoDB Atlas (雲端)
- **快取**: Redis (本地)


## 啟動


**簡要步驟：**

```bash
# 1. 啟動 Redis
cd backend 
node redis.js

# 2. 啟動後端（開新終端）
cd backend
nodemon index.js

# 3. 啟動前端（開新終端）
cd client
npm run dev
```


## 功能特色

1. **餐廳瀏覽** - 查看所有餐廳和菜單
2. **購物車** - 新增、修改、刪除餐點
3. **訂單管理** - 完整的下單、結帳、付款流程
4. **訂單查詢** - 依日期和狀態查詢歷史訂單
5. **取餐號碼** - 付款後顯示取餐號碼

## 環境設定

### 後端 (.env)

後端的 `.env` 文件已配置好：

```bash
PORT=3000
MONGO_URI=mongodb+srv://paramecium128_db_user:921208kk@item.ku9u5e7.mongodb.net/
```

### 前端 (.env)

前端的 `.env` 文件已配置好：

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## 初始化資料庫

如需重新初始化資料庫資料：

```bash
cd backend
node scripts/initData.js
```

## 專案結構

```
NTUST-order-system/
├── backend/              # 後端 API
│   ├── models/          # 資料模型
│   ├── routes/          # API 路由
│   ├── scripts/         # 工具腳本
│   └── .env            # 環境變數
├── client/              # 前端應用
│   ├── src/
│   │   ├── views/      # 頁面組件
│   │   ├── stores/     # Pinia 狀態管理
│   │   ├── services/   # API 服務層
│   │   └── router/     # 路由配置
│   └── .env            # 環境變數
├── START_GUIDE.md       # 詳細啟動指南
└── start.sh            # 快速啟動腳本
```
