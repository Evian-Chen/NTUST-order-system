<template>
  <div class="restaurants-view">
    <header class="header">
      <h1>NTUST 點餐系統</h1>
      <router-link to="/cart" class="cart-link">
        購物車 <span class="cart-badge" v-if="cartStore.totalItems > 0">{{
          cartStore.totalItems
        }}</span>
      </router-link>
    </header>

    <div class="container">
      <h2>選擇餐廳</h2>

      <div v-if="loading" class="loading">載入中...</div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="restaurants-grid">
        <div
          v-for="restaurant in restaurants"
          :key="restaurant.id"
          class="restaurant-card"
          @click="goToRestaurant(restaurant.id)"
        >
          <h3>{{ restaurant.name }}</h3>
          <div class="cuisines">
            <span v-for="(cuisine, index) in restaurant.cusines" :key="index" class="cuisine-tag">
              {{ cuisine.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { useCartStore } from '@/stores/cartStore'

const router = useRouter()
const restaurantStore = useRestaurantStore()
const cartStore = useCartStore()

const restaurants = ref([])
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    // 初始化購物車（不影響主流程）
    cartStore.fetchCart().catch(() => {
      // 購物車為空或錯誤，忽略
      console.log('Cart is empty or not initialized')
    })
    // 獲取餐廳列表
    const data = await restaurantStore.fetchRestaurants()
    console.log('Fetched restaurants:', data)
    restaurants.value = data

    // 調試：打印第一個餐廳的資訊
    if (data && data.length > 0) {
      console.log('First restaurant:', data[0])
      console.log('First restaurant ID:', data[0].id)
      console.log('First restaurant name:', data[0].name)
    }
  } catch (err) {
    error.value = '載入餐廳失敗，請稍後再試'
    console.error('Error fetching restaurants:', err)
  } finally {
    loading.value = false
  }
})

function goToRestaurant(restaurantId) {
  console.log('Going to restaurant with ID:', restaurantId)
  if (!restaurantId) {
    console.error('Restaurant ID is undefined!')
    return
  }
  router.push(`/restaurant/${restaurantId}`)
}
</script>

<style scoped>
.restaurants-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: white;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
}

.cart-link {
  background: #667eea;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  transition: background 0.3s;
}

.cart-link:hover {
  background: #5568d3;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.container h2 {
  color: white;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  color: white;
  font-size: 1.2rem;
}

.error {
  color: #ff4757;
  background: white;
  border-radius: 8px;
}

.restaurants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.restaurant-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.restaurant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.restaurant-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #333;
}

.cuisines {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cuisine-tag {
  background: #f0f0f0;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.85rem;
  color: #666;
}
</style>
