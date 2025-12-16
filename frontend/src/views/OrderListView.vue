<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface Restaurant {
  id: string
  name: string
}

const restaurants = ref<Restaurant[]>([])
const selectedRestaurantId = ref('')
const selectedDate = ref('')
const errorMsg = ref('')
const isLoading = ref(true)
const isDownloading = ref(false)

// 設定預設日期為今天
const today = new Date()
const formattedToday = today.toISOString().split('T')[0] ?? ''
selectedDate.value = formattedToday

// 取得餐廳列表
const fetchRestaurants = async () => {
  try {
    const response = await axios.get<Restaurant[]>(`${API_BASE_URL}/api/restaurants`)
    restaurants.value = response.data
    if (restaurants.value.length > 0 && restaurants.value[0]) {
      selectedRestaurantId.value = restaurants.value[0].id
    }
    console.log('✅ 餐廳資料載入成功:', restaurants.value)
  } catch (err) {
    console.error('❌ API 錯誤:', err)
    errorMsg.value = '無法載入餐廳資料'
  } finally {
    isLoading.value = false
  }
}

// 下載營收報表
const downloadReport = async () => {
  if (!selectedRestaurantId.value || !selectedDate.value) {
    errorMsg.value = '請選擇餐廳和日期'
    return
  }

  isDownloading.value = true
  errorMsg.value = ''

  try {
    const response = await axios.get(`${API_BASE_URL}/api/orders`, {
      params: {
        date: selectedDate.value,
        restaurantId: selectedRestaurantId.value
      },
      responseType: 'blob'
    })

    // 建立下載連結
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `orders_${selectedDate.value}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    console.log('✅ 報表下載成功')
  } catch (err: any) {
    console.error('❌ 下載失敗:', err)
    if (err.response?.status === 400) {
      errorMsg.value = '查詢參數錯誤，請確認日期格式'
    } else {
      errorMsg.value = '下載報表失敗'
    }
  } finally {
    isDownloading.value = false
  }
}

onMounted(() => {
  fetchRestaurants()
})

const goBack = () => {
  router.push('/')
}

const getRestaurantName = (id: string) => {
  const restaurant = restaurants.value.find(r => r.id === id)
  return restaurant?.name || id
}
</script>

<template>
  <div class="order-list-container">
    <header class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1 class="title">📊 營收報表</h1>
    </header>

    <div v-if="isLoading" class="loading">資料載入中...</div>
    
    <div v-else class="report-form">
      <div class="form-group">
        <label for="restaurant">選擇餐廳</label>
        <select id="restaurant" v-model="selectedRestaurantId" class="select-input">
          <option v-for="rest in restaurants" :key="rest.id" :value="rest.id">
            {{ rest.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="date">選擇日期</label>
        <input 
          type="date" 
          id="date" 
          v-model="selectedDate" 
          class="date-input"
          :max="formattedToday"
        />
      </div>

      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

      <button 
        class="download-btn" 
        @click="downloadReport"
        :disabled="isDownloading || !selectedRestaurantId || !selectedDate"
      >
        {{ isDownloading ? '下載中...' : '📥 下載 Excel 報表' }}
      </button>

      <p class="hint">
        報表將包含 {{ selectedDate }} 當日 {{ getRestaurantName(selectedRestaurantId) }} 的銷售統計
      </p>
    </div>
  </div>
</template>

<style scoped>
.order-list-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.back-btn:hover {
  background: hsl(var(--secondary) / 0.8);
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: hsl(var(--muted-foreground));
}

.error {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 0.1);
  border-radius: var(--radius);
  margin-bottom: 1rem;
}

.report-form {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: hsl(var(--card-foreground));
}

.select-input,
.date-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.select-input:focus,
.date-input:focus {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
}

.download-btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 500;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
}

.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
}
</style>
