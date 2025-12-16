import { createRouter, createWebHistory } from 'vue-router'
import RestaurantSelection from './views/RestaurantSelection.vue'
import MenuView from './views/MenuView.vue'
import CartView from './views/CartView.vue'
import OrderListView from './views/OrderListView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: RestaurantSelection
  },
  {
    path: '/menu/:id', // :id 代表這是一個動態參數
    name: 'Menu',
    component: MenuView
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartView
  },
  {
    path: '/orders',
    name: 'Orders',
    component: OrderListView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router