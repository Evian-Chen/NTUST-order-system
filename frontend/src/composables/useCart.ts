import { ref, computed } from 'vue'

export interface CartItem {
  id: string  // 商品的真實 ID（來自後端）
  name: string
  price: number
  quantity: number
  type?: string
  restaurantId: string  // 加入餐廳 ID，支援跨餐廳點餐
  restaurantName?: string  // 餐廳名稱（顯示用）
}

// 全局購物車狀態
const cartItems = ref<CartItem[]>([])
const currentRestaurantId = ref<string>('')  // 儲存當前瀏覽的餐廳 ID
const currentRestaurantName = ref<string>('')  // 儲存當前瀏覽的餐廳名稱

export function useCart() {
  // 設定餐廳 ID（切換餐廳時呼叫，不清空購物車）
  const setRestaurantId = (restaurantId: string, restaurantName?: string) => {
    currentRestaurantId.value = restaurantId
    if (restaurantName) {
      currentRestaurantName.value = restaurantName
    }
    console.log('🏪 當前瀏覽餐廳:', restaurantName || restaurantId)
  }

  // 加入購物車（支援跨餐廳）
  const addToCart = (
    item: { id: string; name: string; price: number; type?: string }, 
    quantity: number
  ) => {
    // 檢查是否已存在相同商品（使用商品 ID 判斷）
    const existingItem = cartItems.value.find(ci => ci.id === item.id)
    
    if (existingItem) {
      // 如果已存在，增加數量
      existingItem.quantity += quantity
      console.log('✅ 增加購物車數量:', item.name, 'x', quantity, `(總計: ${existingItem.quantity})`)
    } else {
      // 否則新增項目，帶上餐廳資訊
      cartItems.value.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        type: item.type,
        restaurantId: currentRestaurantId.value,
        restaurantName: currentRestaurantName.value
      })
      console.log('✅ 已加入購物車:', item.name, 'x', quantity, `(來自: ${currentRestaurantName.value})`)
    }
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

  // 清空購物車（結帳後使用，不清空餐廳 ID）
  const clearCart = () => {
    cartItems.value = []
    // 不清空 currentRestaurantId，讓使用者可以繼續在同一餐廳購物
  }
  
  // 完全重置（切換餐廳時使用）
  const resetCart = () => {
    cartItems.value = []
    currentRestaurantId.value = ''
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
    currentRestaurantId,
    currentRestaurantName,
    setRestaurantId,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    resetCart,
    totalPrice,
    totalItems
  }
}
