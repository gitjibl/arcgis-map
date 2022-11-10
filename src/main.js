/*
 * @Descripttion: 
 * @Author: jibl
 * @Date: 2022-11-03 15:14:19
 * @LastEditors: jibl
 * @LastEditTime: 2022-11-04 13:19:25
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI, {
});


// import EsriMap from 'esri-map'
// import 'esri-map/esri-map.css'
// Vue.use(EsriMap)

import './assets/main.css'


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
