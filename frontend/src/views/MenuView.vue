<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useCart } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const { addToCart: addItemToCart, totalItems } = useCart()

// 1. 定義資料介面
interface MenuItem {
  name: string
  price: number
  type?: string
}

interface Restaurant {
  id: string
  name: string
  cusines: MenuItem[] // 記得拼字是 cusines
}

// 2. 定義變數
const currentRestaurant = ref<Restaurant | null>(null)
const displayedItems = ref<MenuItem[]>([]) // 顯示的菜單項目
const isLoading = ref(true)
const filterType = ref('all')
const errorMsg = ref('')

// Story 1.4: 品項詳情面板相關狀態
const selectedItem = ref<MenuItem | null>(null)
const itemQuantity = ref(1)
const showDetailPanel = ref(false)

// 從網址取得 ID (例如 mcd)
const restaurantId = route.params.id as string

// 3. 抓取資料 (改用單一餐廳 API)
const fetchMenu = async () => {
  try {
    // 🔥 修改這裡：直接呼叫 /api/restaurants/ID
    const url = `${API_BASE_URL}/api/restaurants/${restaurantId}`
    console.log('正在呼叫 API:', url)

    const response = await axios.get<Restaurant>(url)
    
    // 後端直接回傳該餐廳的物件，不需要再 .find() 了
    currentRestaurant.value = response.data
    displayedItems.value = response.data.cusines || []
    console.log('✅ 成功載入菜單:', currentRestaurant.value)
    
    // 📊 檢查實際的 type 值
    if (currentRestaurant.value?.cusines && currentRestaurant.value.cusines.length > 0) {
      const types = new Set(currentRestaurant.value.cusines.map(item => item.type).filter(Boolean))
      console.log('📌 菜單中的 type 值:', Array.from(types))
    }

  } catch (err) {
    console.error('API 錯誤:', err)
    // 判斷如果是 404 代表 ID 錯誤
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      errorMsg.value = '找不到這間餐廳 (404)'
    } else {
      errorMsg.value = '讀取菜單失敗，請稍後再試'
    }
  } finally {
    isLoading.value = false
  }
}

// 根據分類篩選菜單
const fetchItemsByType = async (type: string) => {
  if (type === 'all') {
    // 全部顯示，使用原本的菜單
    displayedItems.value = currentRestaurant.value?.cusines || []
    return
  }

  try {
    isLoading.value = true
    const url = `${API_BASE_URL}/api/items/${restaurantId}/${type}`
    console.log('正在呼叫分類 API:', url)

    const response = await axios.get<MenuItem[]>(url)
    displayedItems.value = response.data
    console.log(`✅ 成功載入 ${type} 分類:`, displayedItems.value)

  } catch (err) {
    console.error('分類 API 錯誤:', err)
    // 如果分類 API 失敗，顯示空列表
    displayedItems.value = []
  } finally {
    isLoading.value = false
  }
}

// 監聽分類變化
watch(filterType, (newType) => {
  fetchItemsByType(newType)
})

onMounted(() => {
  fetchMenu()
})

const goBack = () => {
  router.push('/')
}

// Story 1.4: 點擊品項顯示詳情面板
const showItemDetail = (item: MenuItem) => {
  selectedItem.value = item
  itemQuantity.value = 1
  showDetailPanel.value = true
}

// Story 1.5: 關閉詳情面板返回瀏覽菜單
const closeDetailPanel = () => {
  showDetailPanel.value = false
  selectedItem.value = null
  itemQuantity.value = 1
}

// 數量加減
const increaseQuantity = () => {
  itemQuantity.value++
}

const decreaseQuantity = () => {
  if (itemQuantity.value > 1) {
    itemQuantity.value--
  }
}

// 計算總價
const totalPrice = computed(() => {
  if (!selectedItem.value) return 0
  return selectedItem.value.price * itemQuantity.value
})

// Story 1.4: 加入購物車（暫時只是關閉面板，後續會實作購物車功能）
const addToCart = () => {
  if (selectedItem.value) {
    addItemToCart(selectedItem.value, itemQuantity.value)
    closeDetailPanel()
  }
}

// Story 2.1: 前往購物車頁面
const goToCart = () => {
  router.push('/cart')
}
</script>

<template>
  <div class="menu-container">
    
    <div v-if="isLoading" class="loading">菜單載入中...</div>

    <div v-else-if="errorMsg" class="error">
      <p>{{ errorMsg }}</p>
      <button class="back-btn" @click="goBack">返回餐廳列表</button>
    </div>

    <div v-else-if="currentRestaurant">
      <header class="menu-header">
        <div class="header-left">
          <button class="back-btn" @click="goBack">⬅️ 返回</button>
          <h1>{{ currentRestaurant.name }} 的菜單</h1>
        </div>
        
        <div class="filter-control">
          <select v-model="filterType">
            <option value="all">全部顯示</option>
            <option value="food">🍱 食物</option>
            <option value="drink">🥤 飲料</option>
          </select>
        </div>
      </header>

      <div class="menu-grid">
        <div 
          v-for="(item, index) in displayedItems" 
          :key="index" 
          class="menu-item-card"
          @click="showItemDetail(item)"
        >
          <div class="item-image-placeholder">
            <span>{{ item.name }}</span>
          </div>

          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="price">${{ item.price }}</p>
          </div>
        </div>
      </div>

      <div v-if="displayedItems.length === 0 && !isLoading" class="empty-state">
        此分類暫無餐點
      </div>

      <!-- Story 2.1: 購物車按鈕 -->
      <div class="cart-button-container">
        <button @click="goToCart" class="cart-button">
          🛒 購物車 
          <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
        </button>
      </div>
    </div>

    <!-- Story 1.4: 品項詳情面板 -->
    <div v-if="showDetailPanel && selectedItem" class="detail-panel-overlay" @click.self="closeDetailPanel">
      <div class="detail-panel">
        <div class="detail-image">
          <span>{{ selectedItem.name }}</span>
        </div>
        
        <div class="detail-content">
          <h2>{{ selectedItem.name }}</h2>
          <p class="detail-price">單價：${{ selectedItem.price }}</p>
          
          <div class="quantity-control">
            <button @click="decreaseQuantity" class="qty-btn">-</button>
            <span class="quantity">{{ itemQuantity }}</span>
            <button @click="increaseQuantity" class="qty-btn">+</button>
          </div>
          
          <p class="total-price">總價：${{ totalPrice }}</p>
          
          <div class="detail-actions">
            <button @click="addToCart" class="btn-add-cart">加入購物車</button>
            <button @click="closeDetailPanel" class="btn-back">返回瀏覽菜單</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* shadcn/ui 風格 */
.menu-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-header h1 {
  margin: 0;
  color: hsl(var(--foreground));
  font-size: 1.5rem;
  font-weight: 600;
}

.filter-control select {
  height: 2.5rem;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  cursor: pointer;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  transition: border-color 0.2s;
}

.filter-control select:hover {
  border-color: hsl(var(--ring));
}

.back-btn {
  background: hsl(var(--secondary));
  border: 1px solid hsl(var(--border));
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--secondary-foreground));
  transition: all 0.2s;
}

.back-btn:hover {
  background-color: hsl(var(--accent));
  border-color: hsl(var(--ring));
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.menu-item-card {
  background: hsl(var(--card));
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  transition: all 0.2s;
  cursor: pointer;
}

.menu-item-card:hover {
  border-color: hsl(var(--ring));
  box-shadow: 0 4px 12px hsl(var(--foreground) / 0.1);
}

.item-image-placeholder {
  width: 100%;
  height: 160px;
  background: hsl(var(--muted));
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
  font-size: 1rem;
}

.item-info {
  padding: 1rem;
  text-align: center;
}

.item-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: hsl(var(--card-foreground));
}

.price {
  font-size: 1rem;
  color: hsl(var(--foreground));
  font-weight: 600;
  margin: 0;
}

.loading, .error {
  text-align: center;
  font-size: 1rem;
  margin-top: 3rem;
  color: hsl(var(--muted-foreground));
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: hsl(var(--muted-foreground));
  font-size: 1rem;
}

/* 詳情面板 */
.detail-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsl(var(--foreground) / 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.detail-panel {
  background: hsl(var(--card));
  border-radius: var(--radius);
  width: 90%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid hsl(var(--border));
}

.detail-image {
  width: 100%;
  height: 200px;
  background: hsl(var(--muted));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

.detail-content {
  padding: 1.5rem;
}

.detail-content h2 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--card-foreground));
}

.detail-price {
  font-size: 0.95rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.5rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.qty-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 1.25rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background: hsl(var(--accent));
  border-color: hsl(var(--ring));
}

.quantity {
  font-size: 1.25rem;
  font-weight: 600;
  min-width: 2.5rem;
  text-align: center;
  color: hsl(var(--foreground));
}

.total-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-align: center;
  margin: 1.5rem 0;
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-add-cart {
  width: 100%;
  padding: 0.75rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-add-cart:hover {
  opacity: 0.9;
}

.btn-back {
  width: 100%;
  padding: 0.75rem;
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: hsl(var(--accent));
}

/* 購物車按鈕 */
.cart-button-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 999;
}

.cart-button {
  padding: 0.75rem 1.5rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px hsl(var(--foreground) / 0.15);
  transition: all 0.2s;
  position: relative;
}

.cart-button:hover {
  opacity: 0.9;
  box-shadow: 0 6px 16px hsl(var(--foreground) / 0.2);
}

.cart-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>