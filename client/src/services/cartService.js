import api from './api'

export const cartService = {
  // 初始化購物車
  initCart() {
    return api.post('/api/cart/new')
  },

  // 取得購物車內容
  getCart() {
    return api.get('/api/cart/')
  },

  // 新增購物車項目
  addToCart(itemId, price, amount = 1) {
    return api.post('/api/cart/', {
      itemId,
      price,
      amount
    })
  },

  // 刪除購物車項目（減少一項）
  removeFromCart(itemId) {
    return api.delete('/api/cart/item', {
      data: { itemId }
    })
  },

  // 清空購物車
  clearCart() {
    return api.delete('/api/cart/')
  }
}
