import api from './api'

export const orderService = {
  // 建立訂單（購物車）
  createOrder() {
    return api.post('/api/orders/')
  },

  // 結算訂單（確認購物車內容）
  checkoutOrder(orderId) {
    return api.post(`/api/orders/${orderId}/checkout`)
  },

  // 付款
  payOrder(orderId, method) {
    return api.post(`/api/orders/${orderId}/payments`, {
      method
    })
  },

  // 查詢訂單明細
  getOrderById(orderId) {
    return api.get(`/api/orders/${orderId}`)
  },

  // 查詢特定日期訂單
  getOrdersByDate(date, status) {
    const params = {}
    if (date) params.date = date
    if (status) params.status = status
    return api.get('/api/orders/', { params })
  }
}
