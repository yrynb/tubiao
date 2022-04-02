<template>
  <div class="ed-code-wrapper" ref="wrapper">
    <CodeArea ref="codeArea" v-if="codeVisible"></CodeArea>
    <div class="line" v-move="moveHandle" v-show="previewVisible">
      <div class="line-content"></div>
    </div>
    <Preview
      ref="preview"
      :class="previewVisible ? '' : 'low'"
      :style="{ width: codeVisible ? width + 'px' : '' }"
    ></Preview>
  </div>
</template>

<script>
import CodeArea from '@/components/editor/right/CodeArea'
import Preview from '@/components/editor/right/Preview'
import configHandle from 'common/js/configHandle'
import { CLOSE_EDITOR_LOADING, OPEN_COMP } from 'common/js/event-types'
import { mapGetters, mapMutations } from 'vuex'
import { SET_PREVIEW_STATE } from 'store/mutation-types'
import { debounce } from 'common/js/util'

export default {
  inject: ['diagram'],
  data() {
    return {
      width: 0,
      // 默认一开始不加载组件调试页面,解决刚进入页面发起两次编译请求的问题
      // DiagramUIRenderFlag: false,
      reset: null
    }
  },
  mounted() {
    this.initScrollWidth()
    this.$bus.$on(OPEN_COMP, this.closeDiagram)
    // 当点击运行时再加载组件调试页面
    // this.$bus.$on('renderDiagram', this.openRenderDiagram)
    // this.$bus.$on('closeRenderDiagram', this.closeRenderDiagram)
    this.reset = debounce(this.resizeAll, 500)
  },
  beforeDestroy() {
    this.$bus.$off(OPEN_COMP, this.closeDiagram)
    // this.$bus.$off('renderDiagram', this.openRenderDiagram)
    // this.$bus.$off('closeRenderDiagram', this.closeRenderDiagram)
  },
  computed: {
    ...mapGetters({
      previewVisible: 'showPreview',
      codeVisible: 'showCode'
    })
  },
  watch: {
    previewVisible() {
      this.$nextTick(this.initScrollWidth)

      setTimeout(this.resizeAll)
    }
  },
  methods: {
    ...mapMutations({
      setPreviewState: SET_PREVIEW_STATE
    }),
    async openDiagram() {
      // this.$bus.$emit(OPEN_EDITOR_LOADING)
      this.setPreviewState(true)
      this.$nextTick(this.resizeAll)
      await this.diagram.reloadUI()
      await this.diagram.updateSnapshot()
      configHandle.examineConfigKey()
      this.$bus.$emit(CLOSE_EDITOR_LOADING)
    },
    closeDiagram() {
      this.setPreviewState(false)
      this.$nextTick(this.resizeAll)
    },
    resizeAll() {
      this.$refs.codeArea && this.$refs.codeArea.resizeCode()
      this.$refs.preview && this.$refs.preview.resizeAll()
    },
    initScrollWidth() {
      this.width = this.$refs.wrapper.clientWidth / 2
    },
    moveHandle(type, e) {
      if (type === 'move') {
        this.width -= e.movementX
        this.reset()
      } else if (type === 'end') {
        // this.resizeAll()
      }
    }
  },
  components: {
    CodeArea,
    Preview
  },
  destroyed() {}
}
</script>

<style lang="stylus" scoped>
.ed-code-wrapper{
  position relative
  display: flex;
  height: 100%;
  .line{
    position relative
    width 1px
    height 100%
    background-color: #000;
    cursor e-resize
    z-index 1
    .line-content{
      position absolute
      top 0
      right 0
      width 5px
      height 100%
    }
  }
  .low{
    position absolute
    height 100%
    z-index -100
  }
}
</style>
