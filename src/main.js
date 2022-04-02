import Vue from 'vue'
import store from './store/index'
import App from './App.vue'
import router from './router'
import mixinVue from 'common/js/vue/mixinVue'
import 'common/font/iconfont.css'
import propertyPanel from '@uino/thing-ui-property-panel'
import '@uino/thing-ui-property-panel/dist/style/dark-blue.css'

Vue.use(mixinVue)
Vue.use(propertyPanel, {
  imageUpload: {
    url: '/spray/common/resource/uploadFile', // 上传图片地址
    config: { successCode: 200, fieldName: 'file' } // 上传图片配置信息，axios配置项
    // handle: (value, done) => {} // 上传图片回调，优先级最高，value是当前图片地址值，done是个方法，里面需要传入新的图片地址值
  }
  // imagePreview: value => {
  //   console.log(value)
  // } // 图片预览回调，value是当前图片地址值，设置取消图片预览默认事件，图片预览默认事件是新页面打开
})
Vue.prototype.getConfig = propertyPanel.getConfig
Vue.prototype.updateOptsToPropertyPanel = propertyPanel.updateConfigToOptions

/* eslint-disable no-new */
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
