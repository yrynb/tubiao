import UI, { keyMap } from '@uino/thing-ui-canvas'
import Vue from 'vue'
import { getSnapshot } from 'common/js/util'

class UIHandle {
  constructor() {
    this.ui = null
    this.container = null
  }

  init(dom, options = {}) {
    if (!dom) {
      console.error('初始化画布需要提供根节点dom对象或者其ID值')
    }

    let ui = this.ui

    if (!ui) {
      UI.use(keyMap)
      ui = new UI(dom, options)
      this.ui = ui
      this.createContainer()
    } else {
      dom.appendChild(ui.el)
    }
    return ui
  }

  createContainer() {
    const canvas = this.ui.canvas
    const layer = new UI.Layer(canvas, {
      style: { width: 0, height: 0 }
    })

    return (this.container = new UI.Container(layer, {
      id: 'comp',
      style: {
        top: 0,
        left: 0,
        width: canvas.width,
        height: canvas.height
      }
    }))
  }
  clearComp() {
    try {
      if (this.container.adapter) {
        this.container.adapter.destroy()
      }
    } catch (e) {
      console.error(e)
    }
  }
  updateComp(id = 'Comp') {
    return new Promise(resolve => {
      if (!this.container) {
        resolve(false)
      }

      this.ui.once('componentComplete', () => {
        resolve(this.container)
      })

      try {
        if (this.container.adapter) {
          this.container.adapter.destroy()
        }

        // eslint-disable-next-line no-new
        new UI.Adapter(this.container, {
          type: 'ConchAdapter',
          name: id,
          opts: {
            prefix: `${window.location.origin}/s-static`,
            Vue
          }
        })
        resolve(true)
      } catch (e) {
        console.error(e)
      } finally {
        resolve(false)
      }
    })
  }

  select() {
    this.container && this.container.select()
  }

  unselect() {
    this.container && this.container.unselect()
  }

  getPreviewState() {
    return this.ui.canvasMode === this.ui.CANVASMODE.PLAY
  }

  enterPreview() {
    this.container.top = 0
    this.container.left = 0

    this.ui.setScaleMode(0)
    this.ui.play()
    // this.container && this.ui.enterInsidePreview(this.container)
  }

  exitPreview() {
    this.ui.edit()
    // this.ui.exitInsidePreview()
  }

  async getSnapshot() {
    const snapshot = await getSnapshot(
      this.container.app.dom,
      this.ui.canvasMode === this.ui.CANVASMODE.PLAY
        ? 1
        : this.ui.canvas.getZoom()
    )
    return snapshot
  }

  setCanvasZoom(zoom) {
    return new Promise(resolve => {
      this.ui.on('canvasZoom', zoom => {
        resolve(zoom)
      })

      this.ui.canvas.setZoom(zoom)
    })
  }

  destroy() {
    if (!this.ui) {
      return
    }

    this.ui.destroy()
    this.ui = null
    this.container = null
  }
}
const uiHandle = new UIHandle()
window.uiHandle = uiHandle
export default uiHandle
