<template>
  <div class="restaurant-detail-view">
    <header class="header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>餐廳菜單</h1>
      <router-link to="/cart" class="cart-link">
        購物車 <span class="cart-badge" v-if="cartStore.totalItems > 0">{{
          cartStore.totalItems
        }}</span>
      </router-link>
    </header>

    <div class="container">
      <div v-if="loading" class="loading">載入中...</div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else>
        <h2 v-if="currentRestaurant">{{ currentRestaurant.name }}</h2>

        <div class="items-grid">
          <div v-for="item in items" :key="item.id" class="item-card">
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-type" v-if="item.type">{{ item.type }}</p>
              <p class="item-price">NT$ {{ item.price }}</p>
            </div>
            <button @click="addToCart(item)" class="add-btn" :disabled="adding">加入購物車</button>
          </div>
        </div>

        <div v-if="items.length === 0" class="empty">此餐廳目前沒有餐點</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { useCartStore } from '@/stores/cartStore'

const route = useRoute()
const router = useRouter()
const restaurantStore = useRestaurantStore()
const cartStore = useCartStore()

const items = ref([])
const loading = ref(false)
const adding = ref(false)
const error = ref(null)

const currentRestaurant = computed(() => restaurantStore.currentRestaurant)

onMounted(async () => {
  loading.value = true
  try {
    const restaurantId = route.params.id
    console.log('RestaurantDetailView - Restaurant ID from route:', restaurantId)

    if (!restaurantId || restaurantId === 'undefined') {
      error.value = '餐廳 ID 錯誤'
      console.error('Invalid restaurant ID:', restaurantId)
      return
    }

    // 從已經載入的餐廳列表中找到當前餐廳
    // 不要調用 fetchRestaurantById，因為後端那個 API 有 bug
    const allRestaurants = restaurantStore.restaurants
    if (!allRestaurants || allRestaurants.length === 0) {
      // 如果還沒有餐廳列表，先獲取
      await restaurantStore.fetchRestaurants()
    }

    // 從餐廳列表中找到當前餐廳
    restaurantStore.currentRestaurant = restaurantStore.restaurants.find(
      r => r.id === restaurantId
    )

    console.log('Current restaurant:', restaurantStore.currentRestaurant)

    // 獲取所有類型的餐點
    const types = ['food', 'drink', 'dessert']
    const allItems = []

    for (const type of types) {
      try {
        console.log(`Fetching items for ${restaurantId}/${type}`)
        const typeItems = await restaurantStore.fetchItemsByRestaurantAndType(
          restaurantId,
          type
        )
        console.log(`Got ${typeItems?.length || 0} items for ${type}`)
        if (typeItems && typeItems.length > 0) {
          allItems.push(...typeItems)
        }
      } catch (err) {
        console.error(`Failed to fetch items for type ${type}:`, err)
      }
    }

    console.log('Total items fetched:', allItems.length)
    items.value = allItems
  } catch (err) {
    error.value = '載入餐點失敗，請稍後再試'
    console.error('Error in RestaurantDetailView:', err)
  } finally {
    loading.value = false
  }
})

async function addToCart(item) {
  adding.value = true
  try {
    await cartStore.addToCart(item.id, item.price, 1)
    alert(`已將 ${item.name} 加入購物車`)
  } catch (err) {
    alert('加入購物車失敗，請稍後再試')
    console.error(err)
  } finally {
    adding.value = false
  }
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.restaurant-detail-view {
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

.back-btn {
  background: #f0f0f0;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #e0e0e0;
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
.error,
.empty {
  text-align: center;
  padding: 3rem;
  color: white;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.error {
  color: #ff4757;
  background: white;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.item-card:hover {
  transform: translateY(-3px);
}

.item-info h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.item-type {
  color: #999;
  font-size: 0.9rem;
  margin: 0.3rem 0;
}

.item-price {
  color: #667eea;
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0.5rem 0 0 0;
}

.add-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: 500;
}

.add-btn:hover:not(:disabled) {
  background: #5568d3;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
