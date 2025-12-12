import { createRouter, createWebHistory } from 'vue-router'
import RestaurantsView from '../views/RestaurantsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'restaurants',
      component: RestaurantsView
    },
    {
      path: '/restaurant/:id',
      name: 'restaurant-detail',
      component: () => import('../views/RestaurantDetailView.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutView.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue')
    },
    {
      path: '/order/:id',
      name: 'order-detail',
      component: () => import('../views/OrderDetailView.vue')
    }
  ]
})

export default router
