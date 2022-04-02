import router from '@/router'
import store from '@/store'
import { notification } from 'ant-design-vue'
import {
  compileComp,
  cooperationComp,
  deleteCompById,
  getCompById,
  getCompList,
  publishComp,
  saveComp
} from 'api/comp'
import { getByIdVersion } from 'api/version'
import {
  CLOSE_EDITOR_LOADING,
  OPEN_COMP,
  OPEN_EDITOR_LOADING,
  OPEN_PROPS
} from 'common/js/event-types'
import bus from 'common/js/eventBus'
import {
  debounce,
  getSnapshot,
  requestHandle,
  prettierCode
} from 'common/js/util'
import { RESOURCE_ARR } from 'store/mutation-types'
import Vue from 'vue'
import diagramHandle from './diagramHandle'
import externalHandle from './externalHandle'
import groupHandle from './groupHandle'
import pageHandle from './pageHandle'
import configHandle from '../configHandle'

const getItem = k => localStorage.getItem(k) || ''
const setItem = (k, code) => localStorage.setItem(k, code)
const removeItem = k => localStorage.removeItem(k)
const getKey = k => 'comp' + k
const clearStorage = () => {
  pageHandle.pageList.forEach(item => removeItem(getKey(item.key)))
  removeItem('compId')
  removeItem('modifyTime')
}

const update = debounce((k, v) => setItem(getKey(k), v), 500)

const isDev = window.location.href.includes('conch/editor')
const compHandle = {
  compList: null,
  comp: null,
  updatePropsList: [],
  editId: null,
  needUpdate: [
    'id',
    'name',
    'code',
    'snapshot',
    'category',
    'type',
    'tag',
    'doc',
    'config',
    's',
    'options',
    'example',
    'snapshotType',
    'desc'
  ],
  getItem,
  // 获取用户列表
  async getCompList(opts) {
    const d = await requestHandle(
      getCompList({
        query: Object.assign(
          { owner: store.getters.userInfo.userName },
          opts || {}
        )
      }),
      '自身列表获取错误'
    )
    if (opts) return d
    if (d) {
      this.compList = d
      await this.getComp(
        window.queryId || router.currentRoute.query.queryId || getItem('compId')
      )
      window.queryId = undefined
      return true
    }
  },
  async addNewComp(name, category, opt) {
    this.comp = this.getDefaultComp(name, category, opt)
    this.updatePropsList.push('name', 'category')
    this.compList.push(this.comp)
    this.groupList.splice(
      this.groupList.findIndex(item => !item.isGroup),
      0,
      this.comp
    )
    this.updateCompByLocal(this.comp)
    Vue.nextTick(() => {
      bus.$emit(OPEN_PROPS)
    })
    // notification.info({
    //   message: '请填写二级分类'
    // })
    // await this.saveComp(false, true)
    this.openAllPage()
    bus.$emit(OPEN_COMP)
  },
  async getCompByCooperation(code) {
    if (!code) {
      notification.error({
        message: '携带参数错误'
      })
      return
    }
    const d = await requestHandle(cooperationComp({ code }), '组件获取错误')
    if (d) {
      this.compList = [d]
      Object.assign(d, {
        style: '',
        s: d.style
      })
      d.isLoading = true
      this.openComp(d)
    }
  },
  async editorByID(ID) {
    if (!ID) {
      notification.error({
        message: '携带参数错误'
      })
      return
    }
    const d = await requestHandle(getCompById(ID), '组件获取错误')
    if (this.verifyPermissions(d)) {
      if (d) {
        this.compList = [d]
        Object.assign(d, {
          style: '',
          s: d.style
        })
        d.isLoading = true
        this.openComp(d)
      }
    } else {
      notification.warn({
        message: '当前登录账号与组件拥有者账号不匹配，不能查看组件'
      })
    }
  },
  async getComp(id) {
    const comp = this.compList.find(item => item.id === id)
    if (id && comp) {
      if (comp === this.comp) return
      bus.$emit(OPEN_EDITOR_LOADING)
      await this.openComp(comp)
      bus.$emit(CLOSE_EDITOR_LOADING)
    } else {
      // 证明之前没有打开组件 或者之前打开的组件不在列表中
      this.clear()
    }
  },
  async openComp(d) {
    if (!d.isLoading) {
      const item = await this.getCompData(d.id)
      Object.assign(d, item, {
        style: '',
        s: item.style
      })
      d.isLoading = true
    }
    this.comp = this.updateCompByLocal(d)
    // 将最初获取到的组件数据存起来，方便在回退时还原
    setItem('this.comp', JSON.stringify(this.comp))

    this.openAllPage()
    bus.$emit(OPEN_COMP)
  },
  async updateCompData(id) {
    this.comp = await this.getCompData(id)
    this.comp.s = this.comp.style || ''
    this.updateCompByLocal(this.comp)
  },
  // 回退comp到最初的值
  fallbackComp() {
    let oldComp = JSON.parse(getItem('this.comp'))
    if (this.comp && oldComp && oldComp.id === this.comp.id) {
      this.updatePropsList.forEach(key => {
        this.comp[key] = oldComp[key]
      })
      this.updatePropsList = []
      this.sp.isEdit = false
      this.pageList.forEach(item => (item.isEdit = false))
    }
  },

  getCompData(id) {
    const isCompType = router.currentRoute.query.type
    const requestPromise =
      isDev || isCompType === 'myComponent' ? getCompById : getByIdVersion
    return requestHandle(requestPromise(id), '组件获取错误')
  },
  async updateSnapshot(isAsync) {
    if (!this.comp) return
    const fn = async () => {
      if (!this.comp.snapshotType) {
        this.updateCompProps('snapshot', await this.uiHandle.getSnapshot())
      }
    }
    if (isAsync) {
      return new Promise(async resolve => {
        setTimeout(async () => {
          await fn()
          resolve(1)
        }, 1000)
      })
    }
    await fn()
  },
  async setSnapshot(img) {
    this.updateCompProps('snapshot', img)
    this.updateCompProps('snapshotType', 1)
    notification.success({
      message: '缩略图应用成功'
    })
  },
  async manualUpdateSnapshot() {
    let img = await getSnapshot(this.dom.parentNode)
    return img
  },

  formatJson() {
    this.comp.options = prettierCode(this.comp.options, 'json')
    update('options', this.comp.options)
    bus.$emit('formatJsonCode', this.comp.options)
  },

  async renderToDiagram() {
    if (!this.comp) return

    this.formatJson()

    // 请求后台并渲染
    const { code, s, config, options } = this.comp

    let opts = configHandle.drawOpts(code)
    configHandle.checkDataAndOpts(code)

    // 在检查成功之前，不然运行框弹出来
    bus.$emit(OPEN_EDITOR_LOADING)

    await this.reloadIframe()

    const d = await requestHandle(
      compileComp({
        comps: [
          {
            id: 'omp',
            code,
            style: s,
            config,
            options,
            opts
          }
        ]
      }),
      '组件编译错误'
    )
    if (d) {
      // 开启diagram
      try {
        this.addScriptToWindow(d)
        await this.use()
      } catch (error) {
        console.error(error)
      }
    }

    bus.$emit(CLOSE_EDITOR_LOADING)
  },

  async requestCompile() {
    if (!this.comp) return

    this.formatJson()

    // 请求后台并渲染
    const { code, s, config, options } = this.comp

    let opts = configHandle.drawOpts(code)

    const d = await requestHandle(
      compileComp({
        comps: [
          {
            id: 'omp',
            code,
            style: s,
            config,
            options,
            opts
          }
        ]
      }),
      '组件编译错误'
    )
    return d
  },

  refashAll() {
    this.needUpdate.forEach(this.setUpdatePropsKey.bind(this))
    return {}
  },
  /**
   * 保存组件
   * @param {*} bool 是否更新组件截图
   * @param {*} rehash 是否全量更新
   */
  async saveComp(refash) {
    if (!this.comp) return

    this.formatJson()

    if (!refash && this.updatePropsList.length === 0) return
    let obj = refash ? this.refashAll() : { id: this.comp.id }
    this.updatePropsList.forEach(k => (obj[k] = this.comp[k]))
    if (typeof obj.config !== 'string') obj.config = JSON.stringify(obj.config)
    obj.style = obj.s
    const d = await requestHandle(saveComp(obj), '组件保存失败')
    if (d) {
      const { id, modifyTime } = d
      if (!this.comp.id) {
        this.comp.id = this.comp.key = id
        this.updateCompByLocal(this.comp)
      }
      this.updatePropsList = []
      this.pageList.forEach(item => (item.isEdit = false))
      setItem('modifyTime', modifyTime)
    }
    return d
  },
  updateCompProps(k, v) {
    if (this.comp.id !== getItem('compId')) {
      clearStorage()
      setItem('compId', this.comp.id)
    }
    if (this.comp[k] !== v) {
      if (this.pageList.find(item => item.key === k)) update(k, v)
      Vue.set(this.comp, k, v)
      this.setUpdatePropsKey(k)
    }
  },
  setUpdatePropsKey(k) {
    if (!this.updatePropsList.includes(k) && this.needUpdate.includes(k)) {
      this.updatePropsList.push(k)
    }
  },
  // 删除组件
  async deleteComp() {
    if (!this.comp) return
    const key = `open${Date.now()}`
    notification.open({
      message: '是否删除组件',
      duration: null,
      key,
      btn: h => {
        return (
          <a-button
            type="primary"
            onClick={async () => {
              notification.close(key)
              bus.$emit(OPEN_EDITOR_LOADING)

              const id = this.comp.id
              let d = await requestHandle(deleteCompById(id), '组件删除错误')
              if (d) {
                notification.success({
                  message: '删除成功'
                })
                if (this.comp.group) {
                  const group = this.groupList.find(
                    g => g.isGroup && g.group === this.comp.group
                  )
                  if (group) {
                    group.children.splice(group.children.indexOf(this.comp), 1)
                  }
                } else {
                  this.groupList.splice(this.groupList.indexOf(this.comp), 1)
                }
                // this.compList.splice(this.compList.indexOf(this.comp), 1)
                this.clear()

                if ((getItem('resourceArr') || '').includes(id)) {
                  try {
                    const resourceArrData = JSON.parse(getItem('resourceArr'))
                    resourceArrData.splice(
                      resourceArrData.findIndex(item => item.sid === id),
                      1
                    )
                    store.commit(RESOURCE_ARR, resourceArrData)
                    setItem('resourceArr', JSON.stringify(resourceArrData))
                  } catch (err) {
                    console.error(err)
                  }
                }
              }
              bus.$emit(CLOSE_EDITOR_LOADING)
            }}
          >
            确认
          </a-button>
        )
      }
    })
  },
  // 根据本地缓存更新组件
  updateCompByLocal(comp) {
    const id = comp.id || ''
    // 如果 id 不同 证明为新组件，清除本地缓存
    if (id !== getItem('compId')) {
      clearStorage()
      setItem('compId', id)
    }
    // 更新组件的数据 (缓存 >  组件自身 > 组件默认值)
    let _cache = []
    const modifyTime = getItem('modifyTime')
    if (!modifyTime) {
      setItem('modifyTime', comp.modifyTime)
    }
    let readCache = !!(modifyTime && modifyTime === comp.modifyTime + '')
    this.pageList.forEach(item => {
      const k = item.key
      const v = comp[item.key]
      _cache.push({ k, v })
      comp[k] =
        (readCache ? getItem(getKey(k)) : null) ||
        v ||
        (typeof item.default === 'function'
          ? item.default(comp.category)
          : item.default)
    })
    _cache = _cache.filter(({ k, v }) => comp[k] !== v)
    if (_cache.length) {
      _cache.forEach(({ k }) => this.setUpdatePropsKey(k))
    }
    comp.doc = this.changeDoc(comp.doc, id)
    this.parseConfig(comp)
    this.expandedKeys = []
    setItem('group', comp.group || '')
    if (comp.group) {
      this.expandedKeys.push(comp.group)
    }
    this.expandedKeys.push(id)
    return comp
  },
  changeDoc(doc, id) {
    if (id && doc && doc.includes('/****/compId/****/')) {
      return doc.replace(/\/\*\*\*\*\/compId\/\*\*\*\*\//g, id)
    }
    return doc
  },
  clear() {
    this.comp = null
    this.sp = this.pageList[0]
    clearStorage()
    this.openAllPage()
  },
  parseConfig(comp) {
    if (typeof comp.config === 'string') comp.config = JSON.parse(comp.config)
    if (!comp.config) comp.config = this.getDefaultConfig()
  },
  getDefaultConfig() {
    return {
      bgColor: '#212226',
      width: 480,
      height: 270
    }
  },
  getDefaultComp(name, category, opt) {
    this.refashAll()
    return Object.assign(
      {
        category,
        code: '',
        desc: '',
        name: name || '未命名',
        snapshot: '',
        tag: '',
        type: '',
        publish: 0,
        config: this.getDefaultConfig(),
        key: 'name',
        slots: {
          icon: category
        },
        // _subscriptionData: false,
        children: this.pageList
      },
      opt || {}
    )
  },
  async publishComp() {
    try {
      // await this.reloadUI()
      // set zoom for snapshot
      // await this.uiHandle.setCanvasZoom(1)
      // await this.updateSnapshot(true)
      await this.saveComp(true)
      let d = await requestHandle(publishComp(this.comp.id), '发布失败')
      if (d) {
        this.comp.publish = 1
        notification.success({
          message: '发布成功'
        })
      }
    } catch (error) {
      notification.error({
        message: '发布失败'
      })
      console.error(error)
    }
  },
  async publishExample() {
    if (this.comp.publish === 1) {
      this.updateCompProps('example', this.comp.example ? 0 : 1)
      const d = await this.saveComp()
      if (d) {
        notification.success({
          message: this.comp.example ? '发布成功' : '取消发布成功'
        })
      }
    } else {
      notification.info({
        message: '该组件未发布，请先发布后再设置为官方图表'
      })
    }
  },

  verifyPermissions(d) {
    if (d.from === 1) {
      return true
    } else {
      if (d.owner === store.getters.userInfo.userName) {
        return true
      }
    }
    return false
  }
}
// compHandle.updateSnapshot = debounce(compHandle.updateSnapshot, 1000)
export default Object.assign(
  compHandle,
  diagramHandle,
  pageHandle,
  externalHandle,
  groupHandle
)
