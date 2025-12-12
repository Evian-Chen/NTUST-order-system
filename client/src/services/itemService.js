import api from './api'

export const itemService = {
  // 獲取特定餐點詳情
  getItemById(id) {
    return api.get(`/api/items/${id}`)
  },

  // 獲取餐廳特定分類的所有餐點
  getItemsByRestaurantAndType(restaurant, type) {
    return api.get(`/api/items/${restaurant}/${type}`)
  }
}
