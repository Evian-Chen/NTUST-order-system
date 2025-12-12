<template>
  <div class="order-detail-view">
    <header class="header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>訂單明細</h1>
    </header>

    <div class="container">
      <div v-if="loading" class="loading">載入中...</div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else-if="order" class="order-detail">
        <div class="order-header">
          <h2>訂單 #{{ order._id.slice(-6) }}</h2>
          <span class="status-badge" :class="order.status.toLowerCase()">{{
            getStatusText(order.status)
          }}</span>
        </div>

        <div class="pickup-section" v-if="order.pickupNumber">
          <div class="pickup-number-display">
            <p class="pickup-label">取餐號碼</p>
            <p class="pickup-number">{{ order.pickupNumber }}</p>
          </div>
        </div>

        <div class="info-section">
          <h3>訂單資訊</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">訂單編號：</span>
              <span class="value">{{ order._id }}</span>
            </div>
            <div class="info-item">
              <span class="label">訂單狀態：</span>
              <span class="value">{{ getStatusText(order.status) }}</span>
            </div>
            <div class="info-item">
              <span class="label">訂單時間：</span>
              <span class="value">{{ formatDate(order.orderDate) }}</span>
            </div>
            <div class="info-item" v-if="order.paymentMethod">
              <span class="label">付款方式：</span>
              <span class="value">{{ getPaymentMethodText(order.paymentMethod) }}</span>
            </div>
            <div class="info-item" v-if="order.paidAt">
              <span class="label">付款時間：</span>
              <span class="value">{{ formatDate(order.paidAt) }}</span>
            </div>
          </div>
        </div>

        <div class="items-section">
          <h3>訂單餐點</h3>
          <div class="items-list">
            <div v-for="(item, index) in order.items" :key="index" class="item-row">
              <div class="item-info">
                <span class="item-name">{{ item.itemId }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
              <span class="item-price">NT$ {{ item.itemTotalPrice }}</span>
            </div>
          </div>
          <div class="total-row">
            <span>總金額</span>
            <span>NT$ {{ order.totalPrice }}</span>
          </div>
        </div>

        <div class="actions">
          <button @click="goToOrders" class="btn btn-secondary">查看所有訂單</button>
          <button @click="goHome" class="btn btn-primary">返回首頁</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const order = ref(null)
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    const orderId = route.params.id
    const data = await orderStore.fetchOrderById(orderId)
    order.value = data
  } catch (err) {
    error.value = '載入訂單失敗，請稍後再試'
    console.error(err)
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.back()
}

function goToOrders() {
  router.push('/orders')
}

function goHome() {
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
    minute: '2-digit',
    second: '2-digit'
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
.order-detail-view {
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
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.error {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  font-size: 1.2rem;
}

.error {
  color: #ff4757;
}

.order-detail {
  background: white;
  border-radius: 12px;
  padding: 2rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid #f0f0f0;
}

.order-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 1rem;
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

.pickup-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.pickup-number-display {
  color: white;
}

.pickup-label {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.pickup-number {
  margin: 0;
  font-size: 4rem;
  font-weight: bold;
  letter-spacing: 0.1em;
}

.info-section,
.items-section {
  margin-bottom: 2rem;
}

.info-section h3,
.items-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  padding: 0.8rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.info-item .label {
  font-weight: 500;
  color: #666;
  min-width: 120px;
}

.info-item .value {
  color: #333;
}

.items-list {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-quantity {
  color: #666;
  background: #f0f0f0;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.item-price {
  font-weight: 500;
  color: #667eea;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  background: #f9f9f9;
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
  border-radius: 8px;
  margin-top: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
