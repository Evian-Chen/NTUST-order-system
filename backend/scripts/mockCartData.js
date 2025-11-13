const redis = require("../redis");

/**
 * 初始化 Redis 購物車 Mock Data
 */
async function initMockCartData() {
  console.log("開始初始化 Redis 購物車 Mock Data...");

  try {
    // Mock 購物車資料
    const mockCartData = {
      "mcd-001": {
        price: 139,
        amount: 2
      },
      "mcd-002": {
        price: 99,
        amount: 1
      },
      "mcd-003": {
        price: 65,
        amount: 3
      }
    };

    // 將 Mock 資料存入 Redis
    await redis.set("cart", JSON.stringify(mockCartData), "EX", 86400);
    console.log("Mock 購物車資料已成功存入 Redis:");
    console.log(JSON.stringify(mockCartData, null, 2));

    // 驗證資料是否正確存入
    const storedData = await redis.get("cart");
    if (storedData) {
      console.log("\n驗證 - 從 Redis 取出的資料:");
      console.log(JSON.stringify(JSON.parse(storedData), null, 2));
    }

    console.log("\n✅ Redis 購物車 Mock Data 初始化完成!");
  } catch (error) {
    console.error("❌ 初始化 Mock Data 失敗:", error);
  } finally {
    process.exit(0);
  }
}

// 執行初始化
initMockCartData();
