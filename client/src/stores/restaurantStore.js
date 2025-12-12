import { defineStore } from 'pinia'
import { ref } from 'vue'
import { restaurantService } from '@/services/restaurantService'
import { itemService } from '@/services/itemService'

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurants = ref([])
  const currentRestaurant = ref(null)
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 獲取所有餐廳
  async function fetchRestaurants() {
    loading.value = true
    error.value = null
    try {
      const data = await restaurantService.getAllRestaurants()
      restaurants.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 獲取特定餐廳詳情
  async function fetchRestaurantById(storeId) {
    loading.value = true
    error.value = null
    try {
      const data = await restaurantService.getRestaurantById(storeId)
      currentRestaurant.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 獲取餐點列表（依餐廳和類別）
  async function fetchItemsByRestaurantAndType(restaurant, type) {
    loading.value = true
    error.value = null
    try {
      const data = await itemService.getItemsByRestaurantAndType(restaurant, type)
      items.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 獲取餐點詳情
  async function fetchItemById(id) {
    loading.value = true
    error.value = null
    try {
      const data = await itemService.getItemById(id)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    restaurants,
    currentRestaurant,
    items,
    loading,
    error,
    fetchRestaurants,
    fetchRestaurantById,
    fetchItemsByRestaurantAndType,
    fetchItemById
  }
})
