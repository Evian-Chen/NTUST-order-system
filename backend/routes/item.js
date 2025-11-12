const express = require("express");
const router = express.Router();
const models = require('../models');

// 取得特定餐點的完整內容
router.get('/:id', async (req, res) => {
    const itemId = req.params.id;
    try {
        const item = await models.item.findOne({ id: itemId });
        if (!item) {
            return res.status(404).json({ error: "找不到該餐點" });
        }
        res.status(200).json(item);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "資料庫抓取錯誤" });
    }
})

// 取得某餐廳的特定分類下的所有餐點
router.get('/:restaurant/:type', async (req, res) => {
    try {
        const restaurant = req.params.restaurant;
        const type = req.params.type;
        console.log(restaurant, type);
        const rawData = await models.item.find({
            type: type, 
            restaurantId: restaurant
        });
        console.log(rawData);
        res.status(200).json(rawData);
    } catch (error) {
        console.log("/:restaurant/:type", error);
        res.status(500).json({ error: "資料庫抓取錯誤" });
    }
})

module.exports = router;