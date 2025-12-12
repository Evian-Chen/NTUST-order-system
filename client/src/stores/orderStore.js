import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderService } from '@/services/orderService'

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref(null)
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 建立訂單
  async function createOrder() {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.createOrder()
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 結算訂單
  async function checkoutOrder(orderId) {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.checkoutOrder(orderId)
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 付款
  async function payOrder(orderId, method) {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.payOrder(orderId, method)
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 查詢訂單明細
  async function fetchOrderById(orderId) {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.getOrderById(orderId)
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 查詢特定日期訂單
  async function fetchOrdersByDate(date, status) {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.getOrdersByDate(date, status)
      orders.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 清除當前訂單
  function clearCurrentOrder() {
    currentOrder.value = null
  }

  return {
    currentOrder,
    orders,
    loading,
    error,
    createOrder,
    checkoutOrder,
    payOrder,
    fetchOrderById,
    fetchOrdersByDate,
    clearCurrentOrder
  }
})
