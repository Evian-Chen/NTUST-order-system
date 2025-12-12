<template>
  <div class="cart-view">
    <header class="header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>購物車</h1>
      <router-link to="/orders" class="orders-link">訂單查詢</router-link>
    </header>

    <div class="container">
      <div v-if="loading" class="loading">載入中...</div>

      <div v-else-if="cartStore.isEmpty" class="empty">
        <p>購物車是空的</p>
        <router-link to="/" class="continue-btn">繼續購物</router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="(item, itemId) in cartStore.cart" :key="itemId" class="cart-item">
            <div class="item-info">
              <h3>{{ itemId }}</h3>
              <p class="item-price">NT$ {{ item.price }}</p>
            </div>
            <div class="item-actions">
              <button @click="removeItem(itemId)" class="quantity-btn">-</button>
              <span class="quantity">{{ item.amount }}</span>
              <button @click="addItem(itemId, item.price)" class="quantity-btn">+</button>
            </div>
            <div class="item-total">
              <p>小計: NT$ {{ item.price * item.amount }}</p>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>總數量：</span>
            <span>{{ cartStore.totalItems }} 項</span>
          </div>
          <div class="summary-row total">
            <span>總金額：</span>
            <span>NT$ {{ cartStore.totalPrice }}</span>
          </div>
          <button @click="clearCart" class="clear-btn">清空購物車</button>
          <button @click="checkout" class="checkout-btn">結帳</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await cartStore.fetchCart()
  } catch (err) {
    console.error('Failed to fetch cart:', err)
  } finally {
    loading.value = false
  }
})

async function addItem(itemId, price) {
  try {
    await cartStore.addToCart(itemId, price, 1)
  } catch (err) {
    alert('操作失敗，請稍後再試')
    console.error(err)
  }
}

async function removeItem(itemId) {
  try {
    await cartStore.removeFromCart(itemId)
  } catch (err) {
    alert('操作失敗，請稍後再試')
    console.error(err)
  }
}

async function clearCart() {
  if (confirm('確定要清空購物車嗎？')) {
    try {
      await cartStore.clearCart()
    } catch (err) {
      alert('清空購物車失敗，請稍後再試')
      console.error(err)
    }
  }
}

function checkout() {
  router.push('/checkout')
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.cart-view {
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

.orders-link {
  background: #48c774;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.3s;
}

.orders-link:hover {
  background: #3db764;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.empty {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
}

.empty p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.continue-btn {
  background: #667eea;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  transition: background 0.3s;
}

.continue-btn:hover {
  background: #5568d3;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #333;
}

.item-price {
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-btn {
  background: #667eea;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s;
}

.quantity-btn:hover {
  background: #5568d3;
}

.quantity {
  font-size: 1.1rem;
  font-weight: 500;
  min-width: 30px;
  text-align: center;
}

.item-total {
  min-width: 120px;
  text-align: right;
}

.item-total p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  height: fit-content;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  font-size: 1.1rem;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row.total {
  border-bottom: none;
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #667eea;
}

.clear-btn,
.checkout-btn {
  width: 100%;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.clear-btn {
  background: #f0f0f0;
  color: #666;
}

.clear-btn:hover {
  background: #e0e0e0;
}

.checkout-btn {
  background: #48c774;
  color: white;
}

.checkout-btn:hover {
  background: #3db764;
}
</style>
