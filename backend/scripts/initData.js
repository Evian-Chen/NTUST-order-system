require("dotenv").config();
const models = require('../models');

async function initData() {
    console.log("initializing data...");
    await models.item.deleteMany({}); // 清空資料表
    await models.item.insertMany([
        { name: "雞排", price: 100, type: "food", id: "item-001" },
        { name: "薯條", price: 50, type: "drink", id: "item-002" },
        { name: "珍珠奶茶", price: 60, type: "drink", id: "item-003" },
        { name: "炸雞", price: 120, type: "food", id: "item-004" },
        { name: "可樂", price: 30, type: "drink", id: "item-005" },
        { name: "漢堡", price: 80, type: "food", id: "item-006" },
    ]);

    await models.orders.deleteMany({}); // 清空資料表
    await models.orders.insertMany([
        {
            items: [
                { itemId: "item-001", quantity: 1, itemTotalPrice: 100 } // 雞排 x1
            ],
            totalPrice: 100,
            orderDate: new Date('2024-10-30T10:00:00Z')
        },
        {
            items: [
                { itemId: "item-002", quantity: 1, itemTotalPrice: 50 }, // 薯條 x1
                { itemId: "item-005", quantity: 1, itemTotalPrice: 30 }  // 可樂 x1
            ],
            totalPrice: 80,
            orderDate: new Date('2024-10-30T11:30:00Z')
        },
        {
            items: [
                { itemId: "item-004", quantity: 1, itemTotalPrice: 120 }, // 炸雞 x1
                { itemId: "item-003", quantity: 2, itemTotalPrice: 120 }  // 珍珠奶茶 x2
            ],
            totalPrice: 240,
            orderDate: new Date('2024-10-30T14:15:00Z')
        },
        {
            items: [
                { itemId: "item-006", quantity: 1, itemTotalPrice: 80 }, // 漢堡 x1
                { itemId: "item-002", quantity: 2, itemTotalPrice: 100 }, // 薯條 x2
                { itemId: "item-005", quantity: 2, itemTotalPrice: 60 }   // 可樂 x2
            ],
            totalPrice: 240,
            orderDate: new Date('2024-10-30T18:45:00Z')
        },
        {
            items: [
                { itemId: "item-001", quantity: 2, itemTotalPrice: 200 }, // 雞排 x2
                { itemId: "item-004", quantity: 1, itemTotalPrice: 120 }, // 炸雞 x1
                { itemId: "item-003", quantity: 1, itemTotalPrice: 60 }   // 珍珠奶茶 x1
            ],
            totalPrice: 380,
            orderDate: new Date('2024-10-31T12:00:00Z')
        }
    ]);

    console.log("data initialized.");
    process.exit(0);
}

initData();