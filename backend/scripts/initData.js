// scripts/initData.js
require("dotenv").config();
const models = require('../models');

async function initData() {
    console.log("initializing data...");
    await models.item.deleteMany({});
    await models.item.insertMany([
        // 麥當勞
        { name: "大麥克", price: 139, type: "food", restaurantId: "mcd", id: "mcd-001" },
        { name: "麥香雞", price: 99, type: "food", restaurantId: "mcd", id: "mcd-002" },
        { name: "薯條(大)", price: 65, type: "food", restaurantId: "mcd", id: "mcd-003" },
        { name: "可口可樂(中)", price: 35, type: "drink", restaurantId: "mcd", id: "mcd-004" },
        { name: "奶昔(香草)", price: 55, type: "drink", restaurantId: "mcd", id: "mcd-005" },
        
        // 肯德基
        { name: "香辣雞腿堡", price: 119, type: "food", restaurantId: "kfc", id: "kfc-001" },
        { name: "原味炸雞", price: 89, type: "food", restaurantId: "kfc", id: "kfc-002" },
        { name: "上校雞塊", price: 79, type: "food", restaurantId: "kfc", id: "kfc-003" },
        { name: "百事可樂", price: 30, type: "drink", restaurantId: "kfc", id: "kfc-004" },
        { name: "蛋撻", price: 25, type: "dessert", restaurantId: "kfc", id: "kfc-005" },
        
        // 85度C
        { name: "海鹽咖啡", price: 45, type: "drink", restaurantId: "85c", id: "85c-001" },
        { name: "珍珠奶茶", price: 55, type: "drink", restaurantId: "85c", id: "85c-002" },
        { name: "芋泥蛋糕", price: 85, type: "dessert", restaurantId: "85c", id: "85c-003" },
        { name: "火腿蛋吐司", price: 65, type: "food", restaurantId: "85c", id: "85c-004" },
        { name: "布朗尼", price: 70, type: "dessert", restaurantId: "85c", id: "85c-005" },
        
        // 便當店
        { name: "排骨便當", price: 100, type: "food", restaurantId: "lunch", id: "lunch-001" },
        { name: "雞腿便當", price: 110, type: "food", restaurantId: "lunch", id: "lunch-002" },
        { name: "控肉便當", price: 90, type: "food", restaurantId: "lunch", id: "lunch-003" },
        { name: "紅茶", price: 15, type: "drink", restaurantId: "lunch", id: "lunch-004" },
        { name: "味噌湯", price: 20, type: "drink", restaurantId: "lunch", id: "lunch-005" },
        
        // 手搖飲料店
        { name: "黑糖珍珠鮮奶", price: 70, type: "drink", restaurantId: "tea", id: "tea-001" },
        { name: "烏龍茶拿鐵", price: 65, type: "drink", restaurantId: "tea", id: "tea-002" },
        { name: "芒果綠茶", price: 60, type: "drink", restaurantId: "tea", id: "tea-003" },
        { name: "檸檬蜂蜜茶", price: 55, type: "drink", restaurantId: "tea", id: "tea-004" },
        { name: "芋頭西米露", price: 75, type: "drink", restaurantId: "tea", id: "tea-005" }
    ]);

    await models.orders.deleteMany({});
    await models.orders.insertMany([
        {
            items: [
                { itemId: "mcd-001", quantity: 1, itemTotalPrice: 139 }, // 大麥克 x1
                { itemId: "mcd-003", quantity: 1, itemTotalPrice: 65 },  // 薯條(大) x1
                { itemId: "mcd-004", quantity: 1, itemTotalPrice: 35 }   // 可口可樂(中) x1
            ],
            totalPrice: 239,
            orderDate: new Date('2024-11-01T12:30:00Z'),
            status: 'COMPLETED',
            pickupNumber: 'A001',
            paymentMethod: 'card',
            paidAt: new Date('2024-11-01T12:32:00Z')
        },
        {
            items: [
                { itemId: "85c-001", quantity: 2, itemTotalPrice: 90 },  // 海鹽咖啡 x2
                { itemId: "85c-003", quantity: 1, itemTotalPrice: 85 }   // 芋泥蛋糕 x1
            ],
            totalPrice: 175,
            orderDate: new Date('2024-11-02T09:15:00Z'),
            status: 'READY',
            pickupNumber: 'B023',
            paymentMethod: 'cash'
        },
        {
            items: [
                { itemId: "lunch-001", quantity: 1, itemTotalPrice: 100 }, // 排骨便當 x1
                { itemId: "lunch-004", quantity: 1, itemTotalPrice: 15 },   // 紅茶 x1
                { itemId: "lunch-005", quantity: 1, itemTotalPrice: 20 }    // 味噌湯 x1
            ],
            totalPrice: 135,
            orderDate: new Date('2024-11-02T13:45:00Z'),
            status: 'PREPARING',
            pickupNumber: 'C156',
            paymentMethod: 'cash',
            paidAt: new Date('2024-11-02T13:47:00Z')
        },
        {
            items: [
                { itemId: "kfc-001", quantity: 1, itemTotalPrice: 119 }, // 香辣雞腿堡 x1
                { itemId: "kfc-002", quantity: 2, itemTotalPrice: 178 }, // 原味炸雞 x2
                { itemId: "kfc-004", quantity: 2, itemTotalPrice: 60 },  // 百事可樂 x2
                { itemId: "kfc-005", quantity: 3, itemTotalPrice: 75 }   // 蛋撻 x3
            ],
            totalPrice: 432,
            orderDate: new Date('2024-11-03T18:20:00Z'),
            status: 'PAID',
            pickupNumber: 'D089',
            paymentMethod: 'card',
            paidAt: new Date('2024-11-03T18:22:00Z')
        },
        {
            items: [
                { itemId: "tea-001", quantity: 1, itemTotalPrice: 70 }, // 黑糖珍珠鮮奶 x1
                { itemId: "tea-003", quantity: 1, itemTotalPrice: 60 }  // 芒果綠茶 x1
            ],
            totalPrice: 130,
            orderDate: new Date('2024-11-04T14:30:00Z'),
            status: 'CREATED',
            pickupNumber: 'E234'
        },
        {
            items: [
                { itemId: "mcd-002", quantity: 2, itemTotalPrice: 198 }, // 麥香雞 x2
                { itemId: "mcd-005", quantity: 1, itemTotalPrice: 55 }   // 奶昔(香草) x1
            ],
            totalPrice: 253,
            orderDate: new Date('2024-11-04T16:45:00Z'),
            status: 'CANCELLED'
        },
        {
            items: [
                { itemId: "85c-002", quantity: 3, itemTotalPrice: 165 }, // 珍珠奶茶 x3
                { itemId: "85c-004", quantity: 1, itemTotalPrice: 65 },  // 火腿蛋吐司 x1
                { itemId: "85c-005", quantity: 2, itemTotalPrice: 140 }  // 布朗尼 x2
            ],
            totalPrice: 370,
            orderDate: new Date('2024-11-05T10:15:00Z'),
            status: 'COMPLETED',
            pickupNumber: 'F123',
            paymentMethod: 'card',
            paidAt: new Date('2024-11-05T10:17:00Z')
        },
        {
            items: [
                { itemId: "lunch-002", quantity: 1, itemTotalPrice: 110 }, // 雞腿便當 x1
                { itemId: "lunch-003", quantity: 1, itemTotalPrice: 90 }    // 控肉便當 x1
            ],
            totalPrice: 200,
            orderDate: new Date('2024-11-06T12:00:00Z'),
            status: 'READY',
            pickupNumber: 'G456',
            paymentMethod: 'cash',
            paidAt: new Date('2024-11-06T12:02:00Z')
        },
        {
            items: [
                { itemId: "tea-002", quantity: 1, itemTotalPrice: 65 }, // 烏龍茶拿鐵 x1
                { itemId: "tea-004", quantity: 2, itemTotalPrice: 110 }, // 檸檬蜂蜜茶 x2
                { itemId: "tea-005", quantity: 1, itemTotalPrice: 75 }   // 芋頭西米露 x1
            ],
            totalPrice: 250,
            orderDate: new Date('2024-11-07T15:30:00Z'),
            status: 'PREPARING',
            pickupNumber: 'H789',
            paymentMethod: 'card',
            paidAt: new Date('2024-11-07T15:32:00Z')
        },
        {
            items: [
                { itemId: "kfc-003", quantity: 4, itemTotalPrice: 316 }, // 上校雞塊 x4 (家庭聚餐)
                { itemId: "mcd-001", quantity: 2, itemTotalPrice: 278 }, // 大麥克 x2
                { itemId: "mcd-003", quantity: 2, itemTotalPrice: 130 }  // 薯條(大) x2
            ],
            totalPrice: 724,
            orderDate: new Date('2024-11-08T19:00:00Z'),
            status: 'DRAFT'
        }
    ]);

    await models.restaurant.deleteMany({});
    await models.restaurant.insertMany([
        {
            name: "麥當勞",
            cusines: [
                { name: "大麥克", price: 139 },
                { name: "麥香雞", price: 99 },
                { name: "薯條(大)", price: 65 },
                { name: "可口可樂(中)", price: 35 },
                { name: "奶昔(香草)", price: 55 }
            ],
            id: "mcd"
        },
        {
            name: "肯德基",
            cusines: [
                { name: "香辣雞腿堡", price: 119 },
                { name: "原味炸雞", price: 89 },
                { name: "上校雞塊", price: 79 },
                { name: "百事可樂", price: 30 },
                { name: "蛋撻", price: 25 }
            ],
            id: "kfc"
        },
        {
            name: "85度C",
            cusines: [
                { name: "海鹽咖啡", price: 45 },
                { name: "珍珠奶茶", price: 55 },
                { name: "芋泥蛋糕", price: 85 },
                { name: "火腿蛋吐司", price: 65 },
                { name: "布朗尼", price: 70 }
            ],
            id: "85c"
        },
        {
            name: "阿華便當",
            cusines: [
                { name: "排骨便當", price: 100 },
                { name: "雞腿便當", price: 110 },
                { name: "控肉便當", price: 90 },
                { name: "紅茶", price: 15 },
                { name: "味噌湯", price: 20 }
            ],
            id: "lunch"
        },
        {
            name: "茶湯會",
            cusines: [
                { name: "黑糖珍珠鮮奶", price: 70 },
                { name: "烏龍茶拿鐵", price: 65 },
                { name: "芒果綠茶", price: 60 },
                { name: "檸檬蜂蜜茶", price: 55 },
                { name: "芋頭西米露", price: 75 }
            ],
            id: "tea"
        }
    ]);
    console.log("data initialized.");
    process.exit(0);
}

initData();