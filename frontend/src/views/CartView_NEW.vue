<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import axios from 'axios'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const { cartItems, updateQuantity, removeFromCart, totalPrice, clearCart, currentRestaurantId } = useCart()

// Story 3.1: 支付方式選擇
const showPaymentModal = ref(false)
const isProcessing = ref(false)
const orderSuccess = ref(false)
const orderNumber = ref('')
const selectedPaymentMethod = ref<'cash' | 'card' | null>(null)

// Story 2.2: 返回菜單
const goBackToMenu = () => {
  // 從購物車取得餐廳 ID
  const restaurantId = currentRestaurantId.value
  if (restaurantId) {
    router.push(`/menu/${restaurantId}`)
  } else {
    router.push('/')
  }
}

// Story 2.3: 增加數量
const increaseQuantity = (itemId: string) => {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item) {
    updateQuantity(itemId, item.quantity + 1)
  }
}

// Story 2.3: 減少數量
const decreaseQuantity = (itemId: string) => {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item && item.quantity > 1) {
    updateQuantity(itemId, item.quantity - 1)
  } else if (item && item.quantity === 1) {
    // 數量為 1 時，再減就移除
    removeFromCart(itemId)
  }
}

// Story 3.1: 顯示支付選擇
const showPaymentOptions = () => {
  if (cartItems.value.length === 0) {
    alert('購物車是空的，請先加入商品')
    return
  }
  selectedPaymentMethod.value = null
  showPaymentModal.value = true
}

// 選擇付款方式
const selectPaymentMethod = (method: 'cash' | 'card') => {
  selectedPaymentMethod.value = method
}

// 確認結帳
const confirmPayment = () => {
  if (selectedPaymentMethod.value) {
    processPayment(selectedPaymentMethod.value)
  }
}

// Story 3.2: 處理付款並建立訂單（支援跨餐廳）
const processPayment = async (method: 'cash' | 'card') => {
  isProcessing.value = true
  
  try {
    if (cartItems.value.length === 0) {
      throw new Error('購物車是空的')
    }

    // 按餐廳分組商品
    const itemsByRestaurant = new Map<string, typeof cartItems.value>()
    cartItems.value.forEach(item => {
      const restaurantId = item.restaurantId
      if (!itemsByRestaurant.has(restaurantId)) {
        itemsByRestaurant.set(restaurantId, [])
      }
      itemsByRestaurant.get(restaurantId)!.push(item)
    })

    console.log(`🛒 購物車包含 ${itemsByRestaurant.size} 個餐廳的商品`)

    const allPickupNumbers: string[] = []

    // 為每個餐廳建立獨立訂單
    for (const [restaurantId, items] of itemsByRestaurant) {
      if (!items[0]) continue
      const restaurantName = items[0].restaurantName || restaurantId
      console.log(`\n📋 處理餐廳: ${restaurantName}`)

      // 1. 建立訂單
      const orderPayload = {
        restaurantId: restaurantId,
        items: items.map(item => ({
          itemId: item.id,
          quantity: item.quantity
        }))
      }
      console.log('訂單資料:', orderPayload)
      
      const orderResponse = await axios.post(`${API_BASE_URL}/api/orders`, orderPayload)
      console.log('✅ 建立訂單成功:', orderResponse.data)
      
      const orderId = orderResponse.data.data?.orderId || orderResponse.data.data?._id

      if (!orderId) {
        throw new Error(`建立 ${restaurantName} 的訂單失敗`)
      }

      // 2. 執行付款
      console.log('💳 執行付款...')
      const paymentData = { method }
      const paymentResponse = await axios.post(
        `${API_BASE_URL}/api/orders/${orderId}/payments`, 
        paymentData
      )
      console.log('✅ 付款成功:', paymentResponse.data)

      if (paymentResponse.data.success === false) {
        throw new Error(paymentResponse.data.message || '付款失敗')
      }

      // 3. 取得訂單資訊（包含取餐號碼）
      const orderDetails = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`)
      const pickupNumber = orderDetails.data.data?.pickupNumber || 
                          paymentResponse.data.data?.pickupNumber ||
                          orderId.slice(-6)
      
      allPickupNumbers.push(`${restaurantName}: ${pickupNumber}`)
      console.log(`✅ ${restaurantName} 取餐號碼: ${pickupNumber}`)
    }

    // 顯示所有取餐號碼
    orderNumber.value = allPickupNumbers.join(' | ')

    // 顯示成功訊息
    showPaymentModal.value = false
    orderSuccess.value = true

    // 清空購物車
    clearCart()

    // Story 3.2: 3秒後自動返回首頁
    setTimeout(() => {
      router.push('/')
    }, 3000)

  } catch (error) {
    console.error('❌ 付款流程失敗:', error)
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message
      alert(`付款失敗: ${errorMessage}`)
    } else if (error instanceof Error) {
      alert(`付款失敗: ${error.message}`)
    } else {
      alert('付款失敗，請稍後再試')
    }
  } finally {
    isProcessing.value = false
  }
}

// 關閉支付選擇框
const closePaymentModal = () => {
  if (!isProcessing.value) {
    showPaymentModal.value = false
  }
}
</script>

<template>
  <div class="cart-container">
    <header class="cart-header">
      <h1>🛒 購物車</h1>
    </header>

    <!-- Story 2.2: 返回和結帳按鈕 -->
    <div class="action-buttons">
      <button @click="goBackToMenu" class="btn-secondary">⬅️ 返回瀏覽菜單</button>
      <button 
        @click="showPaymentOptions" 
        class="btn-checkout"
        :disabled="cartItems.length === 0"
      >
        結帳
      </button>
    </div>

    <!-- 購物車內容 -->
    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>購物車是空的</p>
      <button @click="goBackToMenu" class="btn-primary">去選購商品</button>
    </div>

    <!-- Story 2.3: 購物車商品列表 -->
    <div v-else class="cart-items">
      <div 
        v-for="item in cartItems" 
        :key="item.id" 
        class="cart-item"
      >
        <div class="item-image-placeholder">
          <span>{{ item.name.charAt(0) }}</span>
        </div>

        <div class="item-details">
          <h3>{{ item.name }}</h3>
          <p v-if="item.restaurantName" class="restaurant-tag">📍 {{ item.restaurantName }}</p>
          <p class="item-price">單價：${{ item.price }}</p>
          
          <!-- Story 2.3: 數量控制 -->
          <div class="quantity-control">
            <button @click="decreaseQuantity(item.id)" class="qty-btn">-</button>
            <span class="quantity">{{ item.quantity }}</span>
            <button @click="increaseQuantity(item.id)" class="qty-btn">+</button>
          </div>

          <p class="item-total">小計：${{ item.price * item.quantity }}</p>
        </div>

        <button @click="removeFromCart(item.id)" class="btn-remove">✕</button>
      </div>

      <!-- 總價顯示 -->
      <div class="cart-summary">
        <div class="summary-row">
          <span>總計：</span>
          <span class="total-amount">${{ totalPrice }}</span>
        </div>
      </div>
    </div>

    <!-- Story 3.1: 支付方式選擇面板 -->
    <div v-if="showPaymentModal" class="payment-modal-overlay" @click.self="closePaymentModal">
      <div class="payment-modal">
        <h2>選擇支付方式</h2>
        <div class="payment-buttons">
          <button 
            @click="selectPaymentMethod('cash')" 
            class="payment-btn"
            :class="{ selected: selectedPaymentMethod === 'cash' }"
            :disabled="isProcessing"
          >
            💵 現金
          </button>
          <button 
            @click="selectPaymentMethod('card')" 
            class="payment-btn"
            :class="{ selected: selectedPaymentMethod === 'card' }"
            :disabled="isProcessing"
          >
            💳 信用卡
          </button>
        </div>
        <button 
          @click="confirmPayment" 
          class="btn-confirm" 
          :disabled="!selectedPaymentMethod || isProcessing"
        >
          確認結帳
        </button>
        <button @click="closePaymentModal" class="btn-cancel" :disabled="isProcessing">
          取消
        </button>
        <div v-if="isProcessing" class="processing">處理中...</div>
      </div>
    </div>

    <!-- Story 3.2: 訂單成功訊息 -->
    <div v-if="orderSuccess" class="success-modal-overlay">
      <div class="success-modal">
        <div class="success-icon">✅</div>
        <h2>訂購成功！</h2>
        <p class="order-number">{{ orderNumber }}</p>
        <p class="redirect-message">即將返回首頁...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* shadcn/ui 風格 */
.cart-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  padding-bottom: 6rem;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

.cart-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cart-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem 1rem;
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: hsl(var(--accent));
  border-color: hsl(var(--ring));
}

.btn-checkout {
  flex: 1;
  padding: 0.75rem 1rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-checkout:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-checkout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-cart {
  text-align: center;
  padding: 4rem 1.5rem;
}

.empty-cart p {
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.cart-items {
  background: hsl(var(--card));
  border-radius: var(--radius);
  padding: 1rem;
  border: 1px solid hsl(var(--border));
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
  position: relative;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image-placeholder {
  width: 4rem;
  height: 4rem;
  background: hsl(var(--muted));
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: hsl(var(--card-foreground));
}

.restaurant-tag {
  color: hsl(var(--muted-foreground));
  font-size: 0.75rem;
  margin: 0.25rem 0;
  font-weight: 500;
}

.item-price {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0;
}

.qty-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.qty-btn:hover {
  background: hsl(var(--accent));
  border-color: hsl(var(--ring));
}

.quantity {
  font-size: 0.95rem;
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
  color: hsl(var(--foreground));
}

.item-total {
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.btn-remove {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.75rem;
  height: 1.75rem;
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-remove:hover {
  opacity: 0.9;
}

.cart-summary {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid hsl(var(--border));
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.total-amount {
  color: hsl(var(--foreground));
}

/* 支付選擇面板 */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsl(var(--foreground) / 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.payment-modal {
  background: hsl(var(--card));
  border-radius: var(--radius);
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
  border: 1px solid hsl(var(--border));
}

.payment-modal h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--card-foreground));
}

.payment-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.payment-btn {
  padding: 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.payment-btn:hover:not(:disabled) {
  background: hsl(var(--accent));
  border-color: hsl(var(--ring));
}

.payment-btn.selected {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
}

.payment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm {
  width: 100%;
  padding: 0.75rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

.btn-confirm:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  width: 100%;
  padding: 0.75rem;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background: hsl(var(--accent));
}

.processing {
  margin-top: 1rem;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}

/* 訂單成功面板 */
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsl(var(--foreground) / 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.success-modal {
  background: hsl(var(--card));
  border-radius: var(--radius);
  padding: 2.5rem;
  text-align: center;
  max-width: 400px;
  border: 1px solid hsl(var(--border));
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-modal h2 {
  color: hsl(142 76% 36%);
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.order-number {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--card-foreground));
  margin: 1rem 0;
}

.redirect-message {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  margin-top: 1rem;
}
</style>
