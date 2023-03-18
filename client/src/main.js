import Vue from 'vue';
import App from './App3.vue';

/* 导入公共的样式 && ELEMENT */
import './assets/reset.min.css';
import './assets/common.less';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.config.productionTip = false;
new Vue({
  render: h => h(App),
}).$mount('#app');