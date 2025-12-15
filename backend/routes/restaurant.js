const express = require('express');
const router = express.Router();
const models = require('../models');

// 回傳所有餐廳的資料，包含餐點和餐廳名稱
router.get('/', async (req, res) => {
    try {
        const rawdata = await models.restaurant.find({});
        const data = rawdata.map((restaurant) => {
            return {
                id: restaurant.id,
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
    console.log('🔍 查詢餐廳 ID:', storeId);
    try {
        const rawData = await models.restaurant.findOne({
            id: storeId
        });
        console.log('📦 找到的餐廳:', rawData);
        
        if (!rawData) {
            return res.status(404).json({ error: "找不到該餐廳" });
        }
        
        // 從 item collection 取得完整的商品資料（包含 id、type 等）
        const items = await models.item.find({ restaurantId: storeId });
        
        const data = {
            id: rawData.id,
            name: rawData.name,
            cusines: items.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    type: item.type
                }
            })
        };
        
        return res.status(200).json(data);
    } catch (error) {
        console.error('❌ 錯誤:', error);
        return res.status(500).json({ error: "資料庫抓取錯誤" });
    }
})

module.exports = router;