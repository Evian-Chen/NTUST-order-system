#!/bin/bash

# 系統狀態檢查腳本

echo "========================================"
echo "   NTUST 點餐系統 - 狀態檢查"
echo "========================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 檢查 Redis
echo "1. 檢查 Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis 正常運行${NC}"
else
    echo -e "${RED}✗ Redis 未運行${NC}"
    echo "  請執行: brew services start redis"
fi
echo ""

# 檢查後端
echo "2. 檢查後端 API..."
if curl -s http://localhost:3000/api/restaurants/ > /dev/null; then
    echo -e "${GREEN}✓ 後端 API 正常 (http://localhost:3000)${NC}"
    RESTAURANT_COUNT=$(curl -s http://localhost:3000/api/restaurants/ | grep -o '"name"' | wc -l)
    echo "  找到 $RESTAURANT_COUNT 個餐廳"
else
    echo -e "${RED}✗ 後端 API 無法訪問${NC}"
    echo "  請檢查後端是否運行"
fi
echo ""

# 檢查 CORS
echo "3. 檢查 CORS 配置..."
CORS_HEADER=$(curl -s -H "Origin: http://localhost:5173" http://localhost:3000/api/restaurants/ -I | grep -i "Access-Control-Allow-Origin")
if [ ! -z "$CORS_HEADER" ]; then
    echo -e "${GREEN}✓ CORS 配置正確${NC}"
    echo "  $CORS_HEADER"
else
    echo -e "${RED}✗ CORS 配置有問題${NC}"
fi
echo ""

# 檢查前端
echo "4. 檢查前端服務..."
if curl -s http://localhost:5173/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 前端運行在 http://localhost:5173/${NC}"
elif curl -s http://localhost:5174/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 前端運行在 http://localhost:5174/${NC}"
else
    echo -e "${RED}✗ 前端服務未運行${NC}"
    echo "  請執行: cd client && npm run dev"
fi
echo ""

echo "========================================"
echo "測試完整的 API 調用流程..."
echo "========================================"
echo ""

# 測試餐廳 API
echo "測試: GET /api/restaurants/"
curl -s -H "Origin: http://localhost:5173" http://localhost:3000/api/restaurants/ | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✓ 成功取得 {len(data)} 個餐廳'); [print(f\"  - {r['name']}\") for r in data[:3]]" 2>/dev/null || echo "✗ 請求失敗"
echo ""

# 測試購物車 API
echo "測試: GET /api/cart/"
CART_RESPONSE=$(curl -s -H "Origin: http://localhost:5173" http://localhost:3000/api/cart/)
if echo "$CART_RESPONSE" | grep -q "data"; then
    echo "✓ 購物車 API 正常"
else
    echo "✗ 購物車 API 異常"
fi
echo ""

echo "========================================"
echo "檢查完成"
echo "========================================"
echo ""
echo "如果所有檢查都通過，請："
echo "1. 打開瀏覽器"
echo "2. 訪問 http://localhost:5173 或 http://localhost:5174"
echo "3. 按 Cmd+Shift+R 強制刷新頁面（清除快取）"
echo "4. 按 F12 打開開發者工具，查看 Console 和 Network 標籤"
echo ""
