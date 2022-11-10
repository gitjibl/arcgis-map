/*
 * @Descripttion: 
 * @Author: jibl
 * @Date: 2022-11-03 15:14:19
 * @LastEditors: jibl
 * @LastEditTime: 2022-11-03 15:15:48
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
