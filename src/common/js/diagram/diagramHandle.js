import store from '@/store'
import { SET_DIAGRAM_STATE } from '@/store/mutation-types'
import { notification } from 'ant-design-vue'
import Vue from 'vue'

let myWindow
let resize

const diagramHandle = {
  // 组件实例
  instance: null,
  // 当前组件 dom
  dom: null,
  // iframe 的 window 对象
  iframeWindow: null,
  // 父级组件 dom
  parent: null,
  /**
   * 初始化
   * @param {*} dom 父级组件
   */
  async init(parent, bool) {
    this.parent = parent
    await this.reloadIframe(bool)
    // 点击关闭或重载按钮
    window.onbeforeunload = e => {
      this.destoryBigDiagram()
      if (this.updatePropsList && this.updatePropsList.length !== 0) {
        return () => '您确定要离开系统么？chrome刷新'
      }
    }
    if (!resize) resize = this.resize.bind(this)
  },
  async use() {
    if (this.dom) {
      try {
        // 更新的组件模板
        window.instance = this.iframeWindow.instance = this.instance = new this.iframeWindow.conch.Comp(
          this.dom,
          {
            prefix: window.location.origin + '/s-static',
            Vue
          }
        )
        // 生成新的组件
        await this.instance.render()
        ;['script', 'img', 'fonts', 'css'].forEach(k => {
          let obj = {}
          Object.entries(this.instance[k] || {}).forEach(([k, v]) => {
            obj[k] = v.replace(/^(.*)s-static/, '')
          })
          if (JSON.stringify(obj) !== JSON.stringify(this.comp.config[k])) {
            this.comp.config[k] = obj
            this.setUpdatePropsKey('config')
          }
        })
        if (this.comp.cases) {
          this.addScriptToWindow(this.comp.cases)
        }
      } catch (error) {
        console.error(error + '')
        notification.error({
          message: '运行错误' + error
        })
      }
    }
  },
  /**
   * 刷新 iframe
   */
  reloadIframe(bool) {
    if (this.instance) {
      this.instance.destroy()
      this.instance = null
    }
    // 获取画布的 iframe 如果没有则创建后插入
    let diagramDom = this.parent.querySelector('#diagram')
    if (!diagramDom) {
      diagramDom = document.createElement('iframe')
      diagramDom.id = 'diagram'
      diagramDom.scrolling = 'no'
      this.parent.appendChild(diagramDom)
      this.iframeWindow = diagramDom.contentWindow
    }
    if (bool) {
      diagramDom.style.width = '100%'
      diagramDom.style.height = '100%'
    } else {
      diagramDom.style.width = (this.comp.config.width || 1020) + 'px'
      diagramDom.style.height = (this.comp.config.height || 600) + 'px'
    }
    if (this.iframeWindow) {
      diagramDom.contentWindow.location.reload()
      diagramDom = this.parent.querySelector('#diagram')
    }
    return new Promise(resolve => {
      diagramDom.onload = () => {
        this.iframeWindow = diagramDom.contentWindow
        const style = document.createElement('style')
        style.appendChild(
          this.iframeWindow.document.createTextNode(`html, body{
          width: 100%;height: 100%;margin: 0;}
        * {outline: none;box-sizing: border-box;}
        p,dl,ol,ul{margin: 0;padding: 0;}
        li {list-style: none;}
        .comp-perview-scroll-yry{
          overflow:auto
          }
          .comp-perview-scroll-yry::-webkit-scrollbar{
              display: none;
          }
          .comp-perview-scroll-yry:hover::-webkit-scrollbar{
              display:block;
              width: 8px;
              height:8px;
          }
          .comp-perview-scroll-yry:hover::-webkit-scrollbar-thumb{
              background: gray;
              border-radius: 8px;
          }
          .comp-perview-scroll-yry::-webkit-scrollbar-corner{
              background-color:${this.comp.config.bgColor};
          }`)
        )
        this.iframeWindow.document.head.appendChild(style)
        this.iframeWindow.document.body.innerHTML = `<div class="comp-perview-scroll-yry" style='width: 100%;height: 100%;background-color: ${this.comp.config.bgColor}'>
        <div style='width: 100%;height: 100%;'></div></div>`
        this.reloadDom()
        resolve(1)
      }
    })
  },
  /**
   * 重置组件 dom 节点
   */
  reloadDom() {
    return (this.dom = this.iframeWindow.document.body.children[0].children[0])
  },
  /**
   * 更改画布的背景颜色
   * @param {*} color
   */
  changeColor(color) {
    Vue.set(this.comp.config, 'bgColor', color)
    this.iframeWindow.document.body.children[0].style.backgroundColor = color
    this.setUpdatePropsKey('config')
  },
  resize() {
    if (this.instance && this.instance.resize) this.instance.resize()
  },
  addScriptToWindow(s) {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.appendChild(this.iframeWindow.document.createTextNode(s))
    this.iframeWindow.document.head.appendChild(script)
  }
}

const bigDiagram = {
  async initBigDiagram() {
    myWindow = window.open('', '', 'width=1020,height=600')
    let diagramBody = myWindow.document.createElement('div')
    diagramBody.style.width = '100%'
    diagramBody.style.height = '100%'
    myWindow.document.body.appendChild(diagramBody)
    this.init(diagramBody)
    myWindow.addEventListener('resize', resize)
    await this.renderToDiagram()
    store.commit(SET_DIAGRAM_STATE, false)
    this.bigDiagram = true
    myWindow.focus()
    myWindow.onbeforeunload = e => {
      this.bigDiagram = false
    }
  },
  destoryBigDiagram() {
    if (myWindow) {
      this.bigDiagram = false
      myWindow.removeEventListener('resize', resize)
      myWindow.close()
      myWindow = null
    }
  }
}

export default Object.assign(diagramHandle, bigDiagram)
