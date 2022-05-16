import Vue from 'vue'
import './element'
import "@/assets/styles/index.less";
import "@/assets/font/iconfont.css";
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
