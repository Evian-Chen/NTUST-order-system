const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const portNum = process.env.PORT || 3000;
const cors = require("cors");  // 處理vite的跨網域問題
const bodyParser = require("body-parser");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const allowed = []

// 跨域設定
app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser tools (no Origin) like curl/cron
    if (!origin) return cb(null, true);
    cb(null, allowed.includes(origin));
  },
  method: ["GET", "POST"],
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

app.use('/', indexRouter);
app.use('/api/orders', orderRouter);

// 連接靜態檔案
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.listen(portNum, () => {
  console.log(`running on port: ${portNum}`);
});

module.exports = app;
