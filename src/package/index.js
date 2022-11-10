/*
 * @Descripttion: 
 * @Author: jibl
 * @Date: 2022-11-03 14:36:00
 * @LastEditors: jibl
 * @LastEditTime: 2022-11-08 14:40:17
 */
import EsriMap from "../package/esri-map/index.vue"; // 引入封装好的组件
import EsriMapPopup from "./esri-map/components/esri-map-popup/EsriMapPopup.vue";
const coms = [EsriMap,EsriMapPopup]; // 将来如果有其它组件,都可以写到这个数组里

// 批量组件注册
const install = function (Vue) {
  coms.forEach((com) => {
    Vue.component(com.name, com);
  });
};

export default install; // 这个方法以后再使用的时候可以被use调用