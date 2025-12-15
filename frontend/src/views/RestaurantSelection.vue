<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 取得環境變數中的 API 網址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface MenuItem {
  name: string
  price: number
}

interface Restaurant {
  id: string
  name: string
  cusines: MenuItem[]
  // description 還是留著，如果後端未來有給可以用
  description?: string 
}

const restaurants = ref<Restaurant[]>([])
const errorMsg = ref('')
const isLoading = ref(true)

const fetchRestaurants = async () => {
  try {
    // 使用環境變數組合成完整的 API 路徑
    // 這裡會變成: http://localhost:3000/api/restaurants
    const response = await axios.get<Restaurant[]>(`${API_BASE_URL}/api/restaurants`)
    
    restaurants.value = response.data
    console.log('✅ 餐廳資料載入成功:', restaurants.value)

  } catch (err) {
    console.error('❌ API 錯誤:', err)
    errorMsg.value = `無法連線到後端，請確認 ${API_BASE_URL} 是否開啟`
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRestaurants()
})

const selectRestaurant = (id: string) => {
  router.push(`/menu/${id}`)
}
</script>

<template>
  <div class="selection-container">
    <h1 class="title">🍽️ 請選擇餐廳</h1>

    <div v-if="isLoading" class="loading">資料載入中...</div>
    <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div v-else class="restaurant-grid">
      <div 
        v-for="rest in restaurants" 
        :key="rest.id" 
        class="restaurant-card"
        @click="selectRestaurant(rest.id)"
      >
        <div class="image-placeholder">
          <span>{{ rest.name }}</span>
        </div>
        
        <div class="info">
          <h2>{{ rest.name }}</h2>
          <p class="subtitle">共有 {{ rest.cusines.length }} 道餐點</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selection-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  min-height: 100vh;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

.title {
  margin-bottom: 2rem;
  color: hsl(var(--foreground));
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: -0.02em;
}

.loading, .error {
  font-size: 1rem;
  margin-top: 1.5rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.error {
  color: hsl(var(--destructive));
}

.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.restaurant-card {
  background: hsl(var(--card));
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  cursor: pointer;
  transition: all 0.2s ease;
}

.restaurant-card:hover {
  border-color: hsl(var(--ring));
  box-shadow: 0 4px 12px hsl(var(--foreground) / 0.1);
}

.image-placeholder {
  width: 100%;
  height: 160px;
  background: hsl(var(--muted));
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
  font-size: 1.25rem;
}

.info {
  padding: 1.25rem;
}

.info h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--card-foreground));
}

.subtitle {
  margin-top: 0.5rem;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}
</style>