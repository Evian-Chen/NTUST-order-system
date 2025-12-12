import api from './api'

export const restaurantService = {
  // 獲取所有餐廳
  getAllRestaurants() {
    return api.get('/api/restaurants/')
  },

  // 獲取特定餐廳詳情
  getRestaurantById(storeId) {
    return api.get(`/api/restaurants/${storeId}`)
  }
}
