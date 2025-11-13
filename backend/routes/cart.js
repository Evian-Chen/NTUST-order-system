const express = require("express");
const router = express.Router();

const redis = require("../redis");

/** Redis 資料結構：
 * cart: {
 *  itemId1: { price: int, amount: int }
 *  itemId2: { price: int, amount: int }
 * }
 * ...
 */

router.post("/new", async (req, res) => {
  try {
    await redis.set("cart", JSON.stringify({}), "EX", 86400);
    return res.status(200).json({ message: "購物車已初始化" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "快取抓取錯誤" });
  }
});

// 每次進入頁面先呼叫，並回傳購物車內容
router.get("/", async (req, res) => {
  try {
    const data = await redis.get("cart");
    if (data) {
      return res.status(200).json({ data: JSON.parse(data) });
    } else {
      return res.status(200).json({ data: {} });
    }
  } catch (error) {
    console.log("取得快取購物車內容錯誤: ", error);
    return res.status(500).json({ error: "redis 快取錯誤" });
  }
});

// 新增購物車項目
router.post("/", async (req, res) => {
  try {
    const { itemId, price, amount = 1 } = req.body; // amount 預設為 1
    
    // 驗證輸入
    if (!itemId || !price) {
      return res.status(400).json({ error: "itemId 和 price 是必填欄位" });
    }
    
    // 驗證 amount 是正整數
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: "amount 必須是正整數" });
    }
    
    console.log("新增商品: ", { itemId, price, amount });
    
    const data = await redis.get("cart");
    let cartData = {};
    
    if (data) {
      cartData = JSON.parse(data);
    }
    
    // 如果商品已存在，增加數量；否則新增商品
    if (cartData[itemId]) {
      cartData[itemId].amount += amount;
    } else {
      cartData[itemId] = {
        price: price,
        amount: amount,
      };
    }
    
    await redis.set("cart", JSON.stringify(cartData));
    return res.status(200).json({ data: cartData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "快取抓取錯誤" });
  }
});

// 刪除購物車項目(預設都是刪除一項 item)
router.delete("/item", async (req, res) => {
  try {
    const { itemId } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ error: "itemId 是必填欄位" });
    }
    
    const data = await redis.get("cart");
    if (!data) {
      return res.status(404).json({ error: "查不到購物車資料，無法刪除" });
    }
    
    const cartData = JSON.parse(data);
    if (!(itemId in cartData)) {
      return res.status(404).json({ error: "查不到商品，無法刪除" });
    }
    
    // 減少數量，如果數量為 1 則直接刪除該商品
    if (cartData[itemId].amount <= 1) {
      delete cartData[itemId];
    } else {
      cartData[itemId].amount--;
    }
    
    await redis.set("cart", JSON.stringify(cartData));
    return res.status(200).json({ data: cartData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "快取抓取錯誤" });
  }
});

// 刪除整個購物車
router.delete("/", async (req, res) => {
  try {
    await redis.set("cart", JSON.stringify({}));
    return res.status(200).json({ message: "購物車已清空" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "快取抓取錯誤" });
  }
});

module.exports = router;
