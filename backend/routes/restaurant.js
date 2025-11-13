const express = require('express');
const router = express.Router();
const models = require('../models');

// 回傳所有餐廳的資料，包含餐點和餐廳名稱
router.get('/', async (req, res) => {
    try {
        const rawdata = await models.restaurant.find({});
        const data = rawdata.map((restaurant) => {
            return {
                name: restaurant.name,
                cusines: restaurant.cusines.map((cu) => {
                    return {
                        name: cu.name,
                        price: cu.price
                    }
                })
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: '資料庫抓取錯誤' });
    }
})


// 獲得特定餐廳的餐點資料
router.get('/:storeId', async (req, res) => {
    const storeId = req.params.storeId;
    console.log(storeId);
    try {
        const rawData = await models.restaurant.findOne({
            id: storeId
        });
        console.log(rawData);
        return res.status(200)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "資料庫抓取錯誤" });
    }
})

module.exports = router;