// scripts/initData.js
require("dotenv").config();
const models = require('../models');

async function initData() {
    console.log("initializing data...");
    await models.item.deleteMany({});
    await models.item.insertMany([
        { name: "雞排", price: 100, type: "food", id: "item-001" },
        { name: "薯條", price: 50, type: "food", id: "item-002" },
        { name: "珍珠奶茶", price: 60, type: "drink", id: "item-003" },
        { name: "炸雞", price: 120, type: "food", id: "item-004" },
        { name: "可樂", price: 30, type: "drink", id: "item-005" },
        { name: "漢堡", price: 80, type: "food", id: "item-006" },
    ]);

    await models.orders.deleteMany({});
    await models.orders.insertMany([
        {
            items: [
                { itemId: "item-001", quantity: 1, itemTotalPrice: 100 }
            ],
            totalPrice: 100,
            orderDate: new Date('2024-10-30T10:00:00Z'),
            status: 'PAID',  // ← 加這個
            paymentMethod: 'cash',  // ← 加這個
            paidAt: new Date('2024-10-30T10:05:00Z'),  // ← 加這個
            pickupNumber: '001'  // ← 加這個
        },
        {
            items: [
                { itemId: "item-002", quantity: 1, itemTotalPrice: 50 },
                { itemId: "item-005", quantity: 1, itemTotalPrice: 30 }
            ],
            totalPrice: 80,
            orderDate: new Date('2024-10-30T11:30:00Z'),
            status: 'PAID',
            paymentMethod: 'card',
            paidAt: new Date('2024-10-30T11:35:00Z'),
            pickupNumber: '002'
        },
        {
            items: [
                { itemId: "item-004", quantity: 1, itemTotalPrice: 120 },
                { itemId: "item-003", quantity: 2, itemTotalPrice: 120 }
            ],
            totalPrice: 240,
            orderDate: new Date('2024-10-30T14:15:00Z'),
            status: 'PAID',
            paymentMethod: 'cash',
            paidAt: new Date('2024-10-30T14:20:00Z'),
            pickupNumber: '003'
        },
        {
            items: [
                { itemId: "item-006", quantity: 1, itemTotalPrice: 80 },
                { itemId: "item-002", quantity: 2, itemTotalPrice: 100 },
                { itemId: "item-005", quantity: 2, itemTotalPrice: 60 }
            ],
            totalPrice: 240,
            orderDate: new Date('2024-10-30T18:45:00Z'),
            status: 'PAID',
            paymentMethod: 'cash',
            paidAt: new Date('2024-10-30T18:50:00Z'),
            pickupNumber: '004'
        },
        {
            items: [
                { itemId: "item-001", quantity: 2, itemTotalPrice: 200 },
                { itemId: "item-004", quantity: 1, itemTotalPrice: 120 },
                { itemId: "item-003", quantity: 1, itemTotalPrice: 60 }
            ],
            totalPrice: 380,
            orderDate: new Date('2024-10-31T12:00:00Z'),
            status: 'PAID',
            paymentMethod: 'card',
            paidAt: new Date('2024-10-31T12:05:00Z'),
            pickupNumber: '001'
        }
    ]);

    console.log("data initialized.");
    process.exit(0);
}

initData();