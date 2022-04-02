<template>
  <div class="preview-ui">
    <div class="el-code-header">
      <span class="title">调试</span>
      <div class="config">
        <a-button
          @click="getScreenshots"
          class="screenshots"
          size="small"
          type="dashed"
          :ghost="true"
          >截取缩略图</a-button
        >
        W:
        <a-input
          class="dark-input"
          :value="width"
          @blur="saveConfig"
          @change="changeSize($event, 'width')"
        >
        </a-input>
        H:
        <a-input
          class="dark-input"
          :value="height"
          @blur="saveConfig"
          @change="changeSize($event, 'height')"
        >
        </a-input>
      </div>
      <ul class="nav-menu">
        <li
          class="nav-item"
          v-if="!!Object.keys(options).length"
          :class="showPropertyPanel ? 'current' : ''"
        >
          <i
            class="iconfont conch-attr"
            title="属性面板"
            v-if="!!Object.keys(options).length"
            @click="switchPropertyPanel"
          ></i>
        </li>
        <li
          class="nav-item"
          :class="previewBluePrintVisible ? 'current' : ''"
          @click="switchBluePrint"
        >
          <i class="iconfont conch-blue-print" title="蓝图"></i>
        </li>
        <!-- <li
          class="nav-item"
          :class="compPreviewState ? 'current' : ''"
          @click="compPreview"
        >
          <i class="iconfont conch-play" title="预览"></i>
        </li> -->
        <li
          class="nav-item"
          :class="previewFull ? 'current' : ''"
          @click="fullScreen"
        >
          <i class="iconfont conch-full-screen" title="全屏"></i>
        </li>
        <li class="nav-item" @click.stop="closePreview">
          <i class="iconfont conch-icon-homepage-closeitem"></i>
        </li>
      </ul>
    </div>
    <div class="component-canvas my-scroll">
      <Loading v-if="loading" class="loading" size="large" />
      <div class="canvas-run" ref="canvas"></div>
      <div class="mask" ref="mask" v-show="maskShow"></div>
      <div
        class="prop-panel-wrapper"
        :style="{ width: propertyPanelWidth + 'px' }"
        v-show="!!Object.keys(options).length && showPropertyPanel"
      >
        <div class="line" v-move="moveHandle">
          <div class="line-content"></div>
        </div>
        <div class="prop-panel">
          <t-ui-panel
            :options="options"
            :config="panelConfig"
            @change="changeProperty"
          ></t-ui-panel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import uiHandle from '@/common/js/ui'
import { mapGetters, mapMutations } from 'vuex'
import {
  SET_CODE_STATE,
  SET_LEFT_FOLD,
  SET_PREVIEW_BLUE_PRINT_STATE,
  SET_PREVIEW_STATE,
  OPEN_PROPS,
  PREVIEW_FULL
} from 'store/mutation-types'
import UI from '@uino/thing-ui-canvas'
import { debounce, requestHandle, loadFonts } from 'common/js/util'
import { getFonts } from 'api/resource'
let fontLists = []
export default {
  name: 'DiagramUI',
  inject: ['diagram', 'preview'],

  data() {
    return {
      panelConfig: {
        handlers: null,
        font: {
          fontList: [],
          async handler(font) {
            let fonts = fontLists.filter(item => item.psName === font)
            if (fonts.length === 0) return
            await loadFonts(fonts, `${window.location.origin}/s-static`)
          }
        }
      },
      uiHandle,
      loading: false,
      options: {},
      previewFull: false,
      showPropertyPanel: false,
      // compPreviewState: false,
      propertyPanelWidth: 321,
      canvasTransform: '',
      appRender: null,
      maskShow: false,
      compCanvasDom: null
    }
  },
  watch: {
    width(val) {
      uiHandle.container && (uiHandle.container.width = val)
    },
    height(val) {
      uiHandle.container && (uiHandle.container.height = val)
    }
  },
  computed: {
    height() {
      if (
        this.diagram.comp.config.height !== 0 &&
        !this.diagram.comp.config.height
      ) {
        return 270
      }
      return this.diagram.comp.config.height
    },
    width() {
      if (
        this.diagram.comp.config.width !== 0 &&
        !this.diagram.comp.config.width
      ) {
        return 480
      }
      return this.diagram.comp.config.width
    },
    ...mapGetters({
      previewBluePrintVisible: 'showPreviewBluePrint',
      openProps: 'openProps',
      leftFold: 'leftFold'
    })
  },
  methods: {
    ...mapMutations({
      setPreviewBluePrintState: SET_PREVIEW_BLUE_PRINT_STATE,
      setPreviewState: SET_PREVIEW_STATE,
      setCodeState: SET_CODE_STATE,
      setLeftFold: SET_LEFT_FOLD,
      setOpenProps: OPEN_PROPS,
      setPreviewFull: PREVIEW_FULL
    }),
    async getFontList() {
      let d = await requestHandle(getFonts(), '获取列表错误')
      if (d) {
        fontLists = d
        if (d.length > 0) {
          d.forEach(font => {
            this.panelConfig.font.fontList.push({
              label: font.name,
              value: font.psName
            })
          })
        }
      }
    },
    initZoomObserver() {
      let flag = true
      uiHandle.ui.canvas.on('wheel', (e, g) => {
        flag = false
      })
      uiHandle.ui.on('canvasZoom', data => {
        if (data > 1 && flag) {
          this.calcCanvasScale()
        }
        flag = true
      })
    },
    setDomBorder(dom, style) {
      dom.style.border = style
      dom.style.boxSizing = 'content-box'
    },
    async init() {
      if (this.loading) {
        return
      }
      this.loading = true

      const UI = uiHandle.init(this.compCanvasDom, {
        style: {
          width: this.width,
          height: this.height,
          backgroundColor: 'transparent'
        }
      })
      this.setDomBorder(UI.canvas.el, '1px dashed #d9d9d9')
      // this.compPreviewState = this.updateCompPreviewState()

      uiHandle.ui.on('graphResizing', this.updateSize)
      uiHandle.ui.on('graphResizeEnd', this.updateSize)

      uiHandle.ui.on('enterInsidePreview', this.updateCompPreviewState)
      uiHandle.ui.on('exitInsidePreview', this.updateCompPreviewState)

      // 加载字体列表
      await this.getFontList()

      this.loading = false
    },
    clickOpenProps() {
      this.setOpenProps(true)
    },
    async updateComp() {
      try {
        if (this.loading) {
          return
        }
        this.loading = true

        this.addScriptToUIWindow(
          'resource',
          await this.diagram.requestCompile()
        )

        await uiHandle.updateComp()
        this.setCanvasSize('height', this.height)
        this.setCanvasSize('width', this.width)
        // uiHandle.ui.canvas.hidden()
        const app = (window.instance = uiHandle.container.app)

        // 将组件实例传入属性面板config
        this.panelConfig.handlers = app

        this.getAttachmentResource(app)
        // app.changeOptsToPropertyPanel()
        this.updateOptsToPropertyPanel(
          app._options.propertyPanel,
          app.type === 'echarts' ? app.config : app.opts
        )
        this.options = app._options.propertyPanel || {}
        this.$emit('compInstance', app)

        this.addScriptToUIWindow('cases', this.diagram.comp.cases)

        this.loading = false

        this.appRender = debounce(() => {
          uiHandle.container.app.render()
        }, 1000)

        uiHandle.ui.setScaleMode(1) // 设置预览模式
        window.removeEventListener('resize', uiHandle.ui._resizeEvent)
        uiHandle.ui.play()
        // 重写Escape快捷键
        if (uiHandle.ui.keyMap) {
          uiHandle.ui.keyMap.register({
            name: '取消',
            code: 'Escape',
            fn: () => {}
          })
        }
        if (
          uiHandle.ui.canvas.event.eventFns.wheel.length < 2 ||
          !uiHandle.ui.canvas.canvasManage
        ) {
          uiHandle.ui.canvas.canvasManage = new UI.ScaleManage(
            uiHandle.ui.canvas
          )
        }
        this.calcCanvasScale()
        // 缩放
        // uiHandle.ui.canvas.on('wheel', (e, g) => {
        //   uiHandle.ui.canvas.canvasManage.wheelEvent(e)
        // })
        // 生成缩略图后，保存缩略图，避免切换组件时提示保存
        await this.diagram.updateSnapshot(true)
        await this.diagram.saveComp()
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    resetCanvas() {
      uiHandle.ui.canvas.canvasManage = new UI.ScaleManage(uiHandle.ui.canvas)
    },
    calcCanvasScale() {
      const rect = this.compCanvasDom.getBoundingClientRect()
      if (rect.width > this.width && rect.height > this.height) {
        uiHandle.ui.canvas.canvasManage.setZoom(1)
      } else {
        uiHandle.ui.setScaleMode(1)
      }
    },
    getAttachmentResource(instance) {
      ;['script', 'img', 'fonts', 'css'].forEach(k => {
        let obj = {}
        Object.entries(instance[k] || {}).forEach(([k, v]) => {
          obj[k] = v.replace(/^(.*)s-static/, '')
        })
        if (
          Object.keys(obj).length > 0 &&
          JSON.stringify(obj) !== JSON.stringify(this.diagram.comp.config[k])
        ) {
          this.diagram.comp.config[k] = obj
          this.diagram.setUpdatePropsKey('config')
        }
      })
    },
    updateSize() {
      const container = uiHandle.container
      this.setCompSize('width', container.width)
      this.setCompSize('height', container.height)
    },
    resize() {
      if (!uiHandle.ui) {
        return
      }

      const container = uiHandle.container

      if (container) {
        container.top = 0
        container.left = 0
      }

      uiHandle.ui.resize()
      this.resetCanvas()
    },
    addScriptToUIWindow(id, s) {
      const head = document.head
      let script = head.querySelector(`#${id}`)

      if (script) {
        head.removeChild(script)
        script = null
      }

      script = document.createElement('script')
      script.type = 'text/javascript'
      script.id = id
      script.appendChild(document.createTextNode(s))
      head.appendChild(script)
    },
    changeProperty(value, keys, config, options) {
      if (uiHandle.container.app && value !== undefined && keys !== undefined) {
        uiHandle.container.app.changeProperty(value, keys, config, options)
      }
    },
    // compPreview() {
    //   // uiHandle.select()

    //   if (this.compPreviewState) {
    //     uiHandle.exitPreview()
    //   } else {
    //     uiHandle.enterPreview()
    //   }

    //   this.updateCompPreviewState()
    // },
    // updateCompPreviewState() {
    //   this.compPreviewState = uiHandle.getPreviewState()
    // },
    async getScreenshots() {
      if (!uiHandle.container) {
        return
      }

      await this.preview.getScreenshots(await uiHandle.getSnapshot())
      uiHandle.ui.canvas.zoomAvailCenter()
    },
    changeSize(e, key) {
      let val = Number(e.target.value)
      if (val !== 0 && !val) {
        e.target.value = this[key]
      }
      this[key] !== val && this.setCompSize(key, val)
      this.setCanvasSize(key, val)

      if (uiHandle.container.app) {
        this.appRender()
      }
    },
    async saveConfig() {
      await this.diagram.saveComp()
    },
    moveHandle(type, e) {
      if (type === 'move') {
        this.propertyPanelWidth -= e.movementX
        this.maskShow = true
      } else if (type === 'end') {
        this.maskShow = false
      }
    },
    setCompSize(key, val) {
      this.$set(this.diagram.comp.config, key, val)
      this.diagram.setUpdatePropsKey('config')
    },
    setCanvasSize(key, val) {
      uiHandle.ui.canvas.style[key] = val
      this.resize()
      let app = uiHandle.container.app
      app.resize()
      app.size.width = this.width
      app.size.height = this.height
    },
    switchPropertyPanel() {
      this.showPropertyPanel = !this.showPropertyPanel
    },
    switchBluePrint() {
      this.setPreviewBluePrintState(!this.previewBluePrintVisible)
    },
    fullScreen() {
      this.previewFull = !this.previewFull
      this.previewFull ? this.loginFullScreen() : this.exitFullScreen()
      this.leftFold &&
        this.$nextTick(() => {
          this.resize()
        })
    },
    loginFullScreen() {
      this.setLeftFold(true)
      this.setCodeState(false)
    },
    exitFullScreen() {
      this.setLeftFold(false)
      this.setCodeState(true)
    },
    closePreview() {
      this.previewFull = false
      this.showPropertyPanel = false
      this.$nextTick(() => {
        this.setPreviewBluePrintState(false)
        this.setPreviewState(false)
        this.exitFullScreen()
        // 销毁组件实例
        uiHandle.clearComp()
      })
    }
  },
  mounted() {
    this.compCanvasDom = document.getElementsByClassName('canvas-run')[0]

    this.init()
    Object.assign(this.diagram, {
      uiHandle: uiHandle,
      reloadUI: this.updateComp,
      addScriptToUIWindow: this.addScriptToUIWindow
    })

    this.$bus.$on('renderDiagram', () => {
      uiHandle.clearComp()
      this.updateComp()
    })

    this.initZoomObserver()
  },
  beforeDestroy() {
    this.$bus.$off('renderDiagram', this.updateComp)
  }
}
</script>

<style lang="stylus" scoped>
.preview-ui
  flex-shrink 0
  display flex
  flex-direction column
  min-height 150px
  background-color #1B1C1F
  .el-code-header
    height 36px
    line-height 30px
    background-color: #242528
    display flex;
    align-items center
    padding 0 10px
    .title
      margin-right auto
      white-space nowrap

    .config
      height 30px
      display flex
      align-items center
      justify-content space-between
      overflow: hidden;

      .dark-input
        height 24px
        width 100px
        background-color #313235 !important
        border-color #1B1C1F
    .nav-menu
      flex-shrink 0
      display flex
      .nav-item
        padding 0 7px
        cursor pointer
        i
          font-size 16px
          vertical-align bottom
        &.current,
        &:hover
          color #147ffa

  .component-canvas
    position relative
    flex 1
    display flex
    height calc(100% - 36px)
    .canvas-run
      flex 1
      height 100%
    .mask
      position: absolute
      width: 100%
      height: 100%
      background-color: rgba(255, 255, 255, 0)
    .prop-panel-wrapper
      position absolute
      background-color #242528
      // border-top 1px solid #000
      // border-bottom  1px solid #000
      top 0
      right 0
      display flex
      min-width 250px
      max-width calc(100% - 150px)
      height 100%
      .line
        flex-shrink 0
        position relative
        width 1px
        height 100%
        cursor e-resize
        z-index 1
        .line-content
          position absolute
          top 0
          right 0
          width 5px
          height 100%
      .prop-panel
        flex 1
        height 100%
        overflow auto
        .u-panel
          background-color transparent
          >>>.u-menu
            background-color transparent
          >>>.u-menu-panel
            background-color transparent
          >>>.u-group-body
            background-color #242528
</style>
