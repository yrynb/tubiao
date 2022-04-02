import getDefaultCode from './getDefaultCode'
import getDefaultMD from './getDefaultMD'
import getDefaultConfig from './getDefaultConfig'
import { OPEN_PAGE } from '../event-types'
import bus from 'common/js/eventBus'
import Vue from 'vue'
import configHandle from '../configHandle'
const pageList = [
  {
    icon: 'jsicon',
    name: 'comp.js',
    key: 'code',
    default: getDefaultCode,
    mode: 'javascript'
  },
  {
    icon: 'cssicon',
    name: 'style.scss',
    key: 's',
    default: '',
    mode: 'scss'
  },
  {
    icon: 'jsicon',
    name: 'config.json',
    key: 'options',
    default: getDefaultConfig,
    mode: 'json'
  },
  {
    icon: 'mdicon',
    name: 'document.md',
    key: 'doc',
    default: getDefaultMD,
    mode: 'markdown'
  },
  {
    icon: 'jsicon',
    name: 'case.js',
    key: 'cases',
    mode: 'javascript'
  }
]
pageList.forEach(item => {
  item.position = [0, 0]
  item.slots = { icon: item.icon }
  item.isLeaf = item.isPage = item.isClose = true
  item.isEdit = false
  item.isHover = false
})
export default {
  /**
   * 上一个页面名称
   */
  oldPageName: null,
  /**
   * 组件缓存内容
   * name: 组件在编辑面板上方的内容
   * key： 组件对应的 id (必填)
   * default： 组件的默认值
   * mode： 编辑器类型
   * icon: 左侧文件的icon
   */
  pageList,
  // 选中的文件
  sp: pageList[0],
  /**
   * 展示所有 page
   */
  openAllPage() {
    this.pageList.forEach(item => (item.isClose = false))
  },
  /**
   * 打开某一个 page
   * @param {*} page
   */
  openPage(page, bool) {
    if (page.name !== 'config.json' && this.oldPageName === 'config.json') {
      configHandle.examineConfigKey()
    }

    this.oldPageName = page.name

    page.isClose = false
    if (this.editor) {
      this.sp.position = bool
        ? [0, 0]
        : [this.editor.getScrollLeft(), this.editor.getScrollTop()]
    }
    if (page.position) {
      const [left, top] = page.position
      Vue.nextTick(() => {
        this.editor.setScrollLeft(left)
        this.editor.setScrollTop(top)
      })
    }
    bus.$emit(OPEN_PAGE, (this.sp = page))
  },
  /**
   * 关闭某一个 page
   * @param {*} page
   */
  async closePage(page) {
    page.isClose = true
    page.isHover = false
    const list = this.pageList.filter(p => !p.isClose)
    if (list.length > 0) {
      // 如果还有没有关闭的就打开第一个
      this.openPage(list[0], true)
    } else {
      // 如果都关闭 则要保存一次相应的组件
      await this.saveComp()
      this.clear()
    }
  }
}
