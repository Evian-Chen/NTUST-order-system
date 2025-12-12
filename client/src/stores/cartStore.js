import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartService } from '@/services/cartService'

export const useCartStore = defineStore('cart', () => {
  const cart = ref({})
  const loading = ref(false)
  const error = ref(null)

  // 計算購物車總數量
  const totalItems = computed(() => {
    return Object.values(cart.value).reduce((sum, item) => sum + item.amount, 0)
  })

  // 計算購物車總金額
  const totalPrice = computed(() => {
    return Object.values(cart.value).reduce((sum, item) => sum + item.price * item.amount, 0)
  })

  // 購物車是否為空
  const isEmpty = computed(() => {
    return Object.keys(cart.value).length === 0
  })

  // 初始化購物車
  async function initCart() {
    loading.value = true
    error.value = null
    try {
      await cartService.initCart()
      cart.value = {}
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 獲取購物車
  async function fetchCart() {
    loading.value = true
    error.value = null
    try {
      const response = await cartService.getCart()
      cart.value = response.data || {}
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 新增到購物車
  async function addToCart(itemId, price, amount = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await cartService.addToCart(itemId, price, amount)
      cart.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 從購物車移除（減少一項）
  async function removeFromCart(itemId) {
    loading.value = true
    error.value = null
    try {
      const response = await cartService.removeFromCart(itemId)
      cart.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 清空購物車
  async function clearCart() {
    loading.value = true
    error.value = null
    try {
      await cartService.clearCart()
      cart.value = {}
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    cart,
    loading,
    error,
    totalItems,
    totalPrice,
    isEmpty,
    initCart,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart
  }
})
