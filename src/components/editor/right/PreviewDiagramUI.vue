<template>
  <div class="preview-ui">
    <div class="el-code-header">
      <span class="title">预览</span>
      <ul class="nav-menu">
        <li class="nav-item" :class="openProps ? 'current' : ''">
          <i
            class="iconfont conch-icon-propicon"
            title="信息"
            v-if="isPreview"
            @click="clickOpenProps"
          ></i>
        </li>
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
        <li
          class="nav-item"
          :class="previewFull ? 'current' : ''"
          @click="fullScreen"
        >
          <i class="iconfont conch-full-screen" title="全屏"></i>
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
// import Vue from 'vue'
import { mapGetters, mapMutations } from 'vuex'
import {
  SET_CODE_STATE,
  SET_LEFT_FOLD,
  SET_PREVIEW_BLUE_PRINT_STATE,
  SET_PREVIEW_STATE,
  OPEN_PROPS,
  PREVIEW_FULL
} from 'store/mutation-types'
// import configHandle from '../../../common/js/configHandle'
import bus from 'common/js/eventBus'
import previewComp from '../../../common/js/diagram/previewComp'
import UI from '@uino/thing-ui-canvas'
import { requestHandle, loadFonts } from 'common/js/util'
import { getFonts } from 'api/resource'
// import { debounce } from 'common/js/util'

let fontLists = []
export default {
  name: 'PreviewDiagramUI',
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
      compPreviewState: false,
      propertyPanelWidth: 321,
      compId: this.$router.currentRoute.query.id,
      canvasTransform: '',
      maskShow: false
      // reset: null
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
      return this.diagram.comp.config.height || 270
    },
    width() {
      return this.diagram.comp.config.width || 480
    },
    ...mapGetters({
      previewBluePrintVisible: 'showPreviewBluePrint',
      isPreview: 'isPreview',
      openProps: 'openProps'
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
    async init() {
      if (this.loading) {
        return
      }
      this.loading = true
      uiHandle.init(this.$refs['canvas'], {
        style: {
          width: this.width,
          height: this.height,
          backgroundColor: 'transparent'
        }
      })

      // 加载字体列表
      await this.getFontList()

      this.loading = false

      await this.updateComp()
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
        // 获取组件信息
        await previewComp.useById(this.compId)

        await uiHandle.updateComp('C' + this.compId)

        const app = (window.instance = uiHandle.container.app)

        // 将组件实例传入属性面板config
        this.panelConfig.handlers = app

        app.changeOptsToPropertyPanel()
        this.options = app._options.propertyPanel || {}
        this.$emit('compInstance', app)

        this.loading = false
        this.setCanvasSize('height', this.height)
        this.setCanvasSize('width', this.width)
        uiHandle.ui.setScaleMode(1)
        uiHandle.ui.play()
        if (uiHandle.ui.keyMap) {
          uiHandle.ui.keyMap.register({
            name: '取消',
            code: 'Escape',
            fn: () => {}
          })
        }
        uiHandle.ui.canvas.canvasManage = new UI.ScaleManage(uiHandle.ui.canvas)
        this.calcCanvasScale()
        // 缩放
        // uiHandle.ui.canvas.on('wheel', (e, g) => {
        //   uiHandle.ui.canvas.canvasManage.wheelEvent(e)
        // })
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    calcCanvasScale() {
      const rect = this.$refs['canvas'].getBoundingClientRect()
      if (rect.width > this.width && rect.height > this.height) {
        uiHandle.ui.canvas.canvasManage.setZoom(1)
      } else {
        uiHandle.ui.setScaleMode(1)
      }
    },
    resetCanvas() {
      uiHandle.ui._resizeEvent()
      uiHandle.ui.canvas.canvasManage = new UI.ScaleManage(uiHandle.ui.canvas)
    },
    setCanvasSize(key, val) {
      uiHandle.ui.canvas.style[key] = val
      this.resize()
      let app = uiHandle.container.app
      app.resize()
      app.size.width = this.width
      app.size.height = this.height
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
    changeProperty(value, keys, config, options) {
      if (uiHandle.container.app && value !== undefined && keys !== undefined) {
        uiHandle.container.app.changeProperty(value, keys, config, options)
      }
    },
    moveHandle(type, e) {
      if (type === 'move') {
        this.propertyPanelWidth -= e.movementX
        // this.reset()
        this.maskShow = true
      } else if (type === 'end') {
        this.maskShow = false
      }
    },

    switchPropertyPanel() {
      this.showPropertyPanel = !this.showPropertyPanel
    },
    switchBluePrint() {
      this.setPreviewBluePrintState(!this.previewBluePrintVisible)
    },
    fullScreen() {
      this.previewFull = !this.previewFull
      if (this.isPreview) {
        bus.$emit(PREVIEW_FULL, this.previewFull)
      } else {
        this.previewFull ? this.loginFullScreen() : this.exitFullScreen()
      }

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
    loginPreviewFullScreen() {
      this.setPreviewFull(true)
    },
    exitPreviewFullScreen() {
      this.setPreviewFull(false)
    }
  },
  mounted() {
    this.init()
    // this.reset = debounce(this.resetCanvas, 500)
    this.initZoomObserver()
  },
  beforeDestroy() {}
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
    background-color #212226
    .canvas-run
      flex 1
      height 100%
      overflow: hidden
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
