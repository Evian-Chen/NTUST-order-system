<template>
  <div class="checkout-view">
    <header class="header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>結帳</h1>
    </header>

    <div class="container">
      <div v-if="loading" class="loading">處理中...</div>

      <div v-else-if="orderCompleted" class="success">
        <div class="success-icon">✓</div>
        <h2>訂單完成！</h2>
        <div class="order-info">
          <p>訂單編號：{{ completedOrder?.orderId }}</p>
          <p class="pickup-number">取餐號碼：{{ completedOrder?.pickupNumber }}</p>
          <p>總金額：NT$ {{ completedOrder?.totalPrice }}</p>
        </div>
        <div class="actions">
          <button @click="viewOrder" class="btn btn-primary">查看訂單</button>
          <button @click="goHome" class="btn btn-secondary">返回首頁</button>
        </div>
      </div>

      <div v-else class="checkout-content">
        <div class="order-summary">
          <h2>訂單摘要</h2>
          <div v-if="cartStore.cart" class="items-list">
            <div v-for="(item, itemId) in cartStore.cart" :key="itemId" class="item-row">
              <span>{{ itemId }}</span>
              <span>x{{ item.amount }}</span>
              <span>NT$ {{ item.price * item.amount }}</span>
            </div>
          </div>
          <div class="total-row">
            <span>總金額</span>
            <span>NT$ {{ cartStore.totalPrice }}</span>
          </div>
        </div>

        <div class="payment-section">
          <h2>付款方式</h2>
          <div class="payment-methods">
            <label class="payment-option" :class="{ active: paymentMethod === 'cash' }">
              <input type="radio" name="payment" value="cash" v-model="paymentMethod" />
              <div class="option-content">
                <span class="option-icon">💵</span>
                <span>現金支付</span>
              </div>
            </label>
            <label class="payment-option" :class="{ active: paymentMethod === 'card' }">
              <input type="radio" name="payment" value="card" v-model="paymentMethod" />
              <div class="option-content">
                <span class="option-icon">💳</span>
                <span>卡片支付</span>
              </div>
            </label>
          </div>

          <button @click="completeCheckout" :disabled="!paymentMethod || processing" class="pay-btn">
            {{ processing ? '處理中...' : '確認付款' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const loading = ref(false)
const processing = ref(false)
const orderCompleted = ref(false)
const completedOrder = ref(null)
const paymentMethod = ref('cash')
const currentOrderId = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    // 檢查購物車
    await cartStore.fetchCart()
    if (cartStore.isEmpty) {
      alert('購物車是空的')
      router.push('/cart')
      return
    }
  } catch (err) {
    console.error('Failed to fetch cart:', err)
    alert('載入購物車失敗')
  } finally {
    loading.value = false
  }
})

async function completeCheckout() {
  if (!paymentMethod.value) {
    alert('請選擇付款方式')
    return
  }

  processing.value = true
  try {
    // Step 1: 建立訂單
    const order = await orderStore.createOrder()
    currentOrderId.value = order.orderId

    // Step 2: 結算訂單
    await orderStore.checkoutOrder(order.orderId)

    // Step 3: 付款
    const payment = await orderStore.payOrder(order.orderId, paymentMethod.value)

    // 完成訂單
    completedOrder.value = payment
    orderCompleted.value = true

    // 清空購物車
    await cartStore.clearCart()
  } catch (err) {
    console.error('Checkout failed:', err)
    alert('結帳失敗，請稍後再試')
  } finally {
    processing.value = false
  }
}

function viewOrder() {
  if (completedOrder.value?.orderId) {
    router.push(`/order/${completedOrder.value.orderId}`)
  }
}

function goHome() {
  router.push('/')
}

function goBack() {
  router.push('/cart')
}
</script>

<style scoped>
.checkout-view {
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

.loading {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  font-size: 1.2rem;
}

.success {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #48c774;
  color: white;
  font-size: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.success h2 {
  color: #333;
  margin: 0 0 2rem 0;
}

.order-info {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.order-info p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.pickup-number {
  font-size: 1.8rem !important;
  font-weight: bold;
  color: #667eea;
  margin: 1rem 0 !important;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.8rem 1.5rem;
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

.checkout-content {
  display: grid;
  gap: 2rem;
}

.order-summary,
.payment-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
}

.order-summary h2,
.payment-section h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.items-list {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-row:last-child {
  border-bottom: none;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
  border-top: 2px solid #667eea;
}

.payment-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-option {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option:hover {
  border-color: #667eea;
}

.payment-option.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.payment-option input {
  display: none;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.option-icon {
  font-size: 2.5rem;
}

.pay-btn {
  width: 100%;
  background: #48c774;
  color: white;
  border: none;
  padding: 1.2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.pay-btn:hover:not(:disabled) {
  background: #3db764;
}

.pay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
