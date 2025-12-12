<template>
  <div class="orders-view">
    <header class="header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>訂單查詢</h1>
    </header>

    <div class="container">
      <div class="filter-section">
        <div class="filter-group">
          <label>日期：</label>
          <input type="date" v-model="selectedDate" @change="fetchOrders" />
        </div>
        <div class="filter-group">
          <label>狀態：</label>
          <select v-model="selectedStatus" @change="fetchOrders">
            <option value="">全部</option>
            <option value="DRAFT">草稿</option>
            <option value="CREATED">已建立</option>
            <option value="PAID">已付款</option>
            <option value="PREPARING">準備中</option>
            <option value="READY">已就緒</option>
            <option value="COMPLETED">已完成</option>
            <option value="CANCELLED">已取消</option>
          </select>
        </div>
        <button @click="fetchOrders" class="search-btn">查詢</button>
      </div>

      <div v-if="loading" class="loading">載入中...</div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else-if="orders.length === 0" class="empty">沒有找到訂單</div>

      <div v-else class="orders-list">
        <div
          v-for="order in orders"
          :key="order._id"
          class="order-card"
          @click="viewOrder(order._id)"
        >
          <div class="order-header">
            <h3>訂單 #{{ order._id.slice(-6) }}</h3>
            <span class="status-badge" :class="order.status.toLowerCase()">{{
              getStatusText(order.status)
            }}</span>
          </div>
          <div class="order-info">
            <p>
              <strong>取餐號碼：</strong
              ><span class="pickup-number">{{ order.pickupNumber || '未分配' }}</span>
            </p>
            <p><strong>總金額：</strong>NT$ {{ order.totalPrice }}</p>
            <p><strong>訂單時間：</strong>{{ formatDate(order.orderDate) }}</p>
            <p v-if="order.paidAt"><strong>付款時間：</strong>{{ formatDate(order.paidAt) }}</p>
            <p v-if="order.paymentMethod">
              <strong>付款方式：</strong>{{ getPaymentMethodText(order.paymentMethod) }}
            </p>
          </div>
          <div class="order-items">
            <p><strong>餐點：</strong>{{ order.items.length }} 項</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'

const router = useRouter()
const orderStore = useOrderStore()

const selectedDate = ref(getTodayDate())
const selectedStatus = ref('')
const orders = ref([])
const loading = ref(false)
const error = ref(null)

function getTodayDate() {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

onMounted(() => {
  fetchOrders()
})

async function fetchOrders() {
  loading.value = true
  error.value = null
  try {
    const data = await orderStore.fetchOrdersByDate(selectedDate.value, selectedStatus.value)
    orders.value = data
  } catch (err) {
    error.value = '載入訂單失敗，請稍後再試'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function viewOrder(orderId) {
  router.push(`/order/${orderId}`)
}

function goBack() {
  router.push('/')
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusText(status) {
  const statusMap = {
    DRAFT: '草稿',
    CREATED: '已建立',
    PAID: '已付款',
    PREPARING: '準備中',
    READY: '已就緒',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return statusMap[status] || status
}

function getPaymentMethodText(method) {
  const methodMap = {
    cash: '現金',
    card: '卡片'
  }
  return methodMap[method] || method
}
</script>

<style scoped>
.orders-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: white;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 2rem;
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-group input,
.filter-group select {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.search-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #5568d3;
}

.loading,
.error,
.empty {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  font-size: 1.2rem;
}

.error {
  color: #ff4757;
}

.orders-list {
  display: grid;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.order-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.draft {
  background: #f0f0f0;
  color: #666;
}

.status-badge.created {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.paid {
  background: #e8f5e9;
  color: #388e3c;
}

.status-badge.preparing {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.ready {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-badge.completed {
  background: #e0f2f1;
  color: #00796b;
}

.status-badge.cancelled {
  background: #ffebee;
  color: #c62828;
}

.order-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.order-info p {
  margin: 0;
  color: #666;
}

.pickup-number {
  color: #667eea;
  font-weight: bold;
  font-size: 1.2rem;
}

.order-items {
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.order-items p {
  margin: 0;
  color: #666;
}
</style>
