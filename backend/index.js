require('dotenv').config();  // 載入環境變數
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const portNum = process.env.PORT || 3000;
const cors = require("cors");  // 處理vite的跨網域問題
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const app = express();

// 嘗試載入 swagger 文檔，如果不存在就使用空的配置
let swaggerDocument;
try {
  swaggerDocument = require('./swagger-output.json');
} catch (error) {
  console.log('Swagger document not found. Run "npm run swagger" to generate it.');
  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'NTUST Order System API',
      version: '1.0.0',
      description: 'API documentation for NTUST Order System'
    },
    paths: {}
  };
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const allowed = [
  'http://localhost:5173',  // Vite 開發伺服器
  'http://localhost:3000'   // 本地後端（以防萬一）
]

// 跨域設定
app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser tools (no Origin) like curl/cron
    if (!origin) return cb(null, true);
    cb(null, allowed.includes(origin));
  },
  methods: ["GET", "POST"],  // 修正：method → methods
  credentials: false // 目前沒用 cookie，可設 false
}));

// 解析urlencoded的資料型態 (前端傳來的資料)
app.use(
  bodyParser.urlencoded({
    extend: false,
    limit: "1mb",
    parameterLimit: "10000",
  })
);

// router
const indexRouter = require('./routes/index');
const orderRouter = require('./routes/order');
const restaurantRouter = require('./routes/restaurant');
const itemRouter = require('./routes/item');
const cartRouter = require('./routes/cart');

// Swagger UI 設置
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "NTUST Order System API Documentation"
}));

app.use('/', indexRouter);
app.use('/api/orders', orderRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/items', itemRouter);
app.use('/api/cart', cartRouter);

// 連接靜態檔案
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.listen(portNum, () => {
  console.log(`running on port: ${portNum}`);
});

module.exports = app;
