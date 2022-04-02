import EventBus from '../eventBus'
import { getApiHandler } from '../axios'
// import 'ant-design-vue/dist/antd.min.css'
import Loading from '@/components/base/Loading'
import ContentItem from '@/components/base/ContentItem'
import NoData from '@/components/base/NoData'
import { throttle } from 'common/js/util'
// eslint-disable-next-line import/no-named-default
import { default as moveHandle, EVENT_TYPE } from 'common/js/moveHandle'
import {
  Button,
  Checkbox,
  notification,
  Modal,
  Dropdown,
  Menu,
  Avatar,
  Badge,
  Select,
  Tag,
  Input,
  Icon,
  FormModel,
  Spin,
  Drawer,
  Upload,
  Empty,
  Timeline,
  Anchor,
  Tree,
  Switch
} from 'ant-design-vue'
/**
 * 混入到 vue 中，例如自定义指令等
 */
export default {
  install(Vue) {
    // ant
    const list = [
      Button,
      Checkbox,
      Modal,
      Dropdown,
      Menu,
      Avatar,
      Badge,
      Select,
      Tag,
      Input,
      Icon,
      FormModel,
      Spin,
      Drawer,
      Upload,
      Empty,
      Timeline,
      Anchor,
      Tree,
      Switch
    ]
    list.forEach(m => Vue.use(m))
    Vue.prototype.$notification = notification
    Vue.prototype.$info = Modal.info
    Vue.prototype.$success = Modal.success
    Vue.prototype.$error = Modal.error
    Vue.prototype.$warning = Modal.warning
    Vue.prototype.$confirm = Modal.confirm
    Vue.prototype.$destroyAll = Modal.destroyAll
    Vue.openConfirmOk = Vue.prototype.openConfirmOk = []
    Vue.confirmOk = Vue.prototype.confirmOk = function(
      message,
      duration,
      ok,
      cancel
    ) {
      const key = `open${Date.now()}`
      Vue.openConfirmOk.push(key)
      notification.open({
        message,
        duration,
        key,
        btn: h => {
          return (
            <span>
              <a-button
                type="primary"
                style="margin-right: 10px;"
                onClick={() => {
                  notification.close(key)
                  if (typeof ok === 'function') ok()
                }}
              >
                是
              </a-button>
              <a-button
                type="primary"
                onClick={() => {
                  notification.close(key)
                  if (typeof cancel === 'function') cancel()
                }}
              >
                否
              </a-button>
            </span>
          )
        }
      })
    }

    // 项目

    const ownerList = [Loading, ContentItem, NoData]
    ownerList.forEach(item => Vue.component(item.name, item))
    Vue.config.productionTip = false
    Vue.prototype.$bus = EventBus
    Vue.prototype.$axios = getApiHandler
    Vue.directive('scroll', {
      inserted: function(el, binding, vnode, oldVnode) {
        const bingValue = binding.value
        const { load, interval } = bingValue
        let loading = false

        function getStyle(el) {
          const style = window.getComputedStyle(el, null)
          if (style.opacity === '0' || style.visibility === 'hidden') {
            return 0
          }
          return style.height
        }
        const loadThrottle = throttle(async () => {
          const height = parseInt(getStyle(el))
          if (!loading && height + el.scrollTop + interval > el.scrollHeight) {
            try {
              loading = true
              await load()
              loading = false
            } catch (error) {
              console.error(error)
            }
          }
        }, 500)
        el.addEventListener('scroll', loadThrottle)
      }
    })
    Vue.directive('move', {
      bind: function(el, binding, vnode) {
        const fn = function(type, e) {
          vnode.context[binding.expression](type, e)
        }

        moveHandle.add(el, {
          [EVENT_TYPE.START]: fn,
          [EVENT_TYPE.MOVE]: fn,
          [EVENT_TYPE.END]: fn
        })
      },
      unbind: function(el) {
        moveHandle.remove(el)
      }
    })
  }
}
