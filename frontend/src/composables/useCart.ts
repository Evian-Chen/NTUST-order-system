import { ref, computed } from 'vue'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type?: string
}

// 全局購物車狀態
const cartItems = ref<CartItem[]>([])

export function useCart() {
  // 加入購物車
  const addToCart = (item: { name: string; price: number; type?: string }, quantity: number) => {
    // 生成簡單的 ID（實際應用中可能從後端獲取）
    const itemId = `${item.name}-${Date.now()}`
    
    // 檢查是否已存在相同商品
    const existingItem = cartItems.value.find(
      ci => ci.name === item.name && ci.price === item.price
    )
    
    if (existingItem) {
      // 如果已存在，增加數量
      existingItem.quantity += quantity
    } else {
      // 否則新增項目
      cartItems.value.push({
        id: itemId,
        name: item.name,
        price: item.price,
        quantity,
        type: item.type
      })
    }
    
    console.log('✅ 已加入購物車:', item.name, 'x', quantity)
  }

  // 更新購物車項目數量
  const updateQuantity = (itemId: string, newQuantity: number) => {
    const item = cartItems.value.find(ci => ci.id === itemId)
    if (item) {
      if (newQuantity <= 0) {
        removeFromCart(itemId)
      } else {
        item.quantity = newQuantity
      }
    }
  }

  // 從購物車移除
  const removeFromCart = (itemId: string) => {
    const index = cartItems.value.findIndex(ci => ci.id === itemId)
    if (index !== -1) {
      cartItems.value.splice(index, 1)
    }
  }

  // 清空購物車
  const clearCart = () => {
    cartItems.value = []
  }

  // 計算總價
  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  // 計算總數量
  const totalItems = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
    totalItems
  }
}
