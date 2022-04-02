<template>
  <div class="preview" ref="preview">
    <PreviewDiagramUI
      ref="previewDiagramUi"
      @compInstance="getCompInstance"
      :style="{
        height: uiHeight + 'px',
        maxHeight: previewBluePrintVisible ? 'calc(100% - 150px)' : ''
      }"
    ></PreviewDiagramUI>
    <div class="line" v-move="moveHandle" v-if="previewBluePrintVisible">
      <div class="line-content"></div>
    </div>
    <DiagramBluePrint
      ref="diagramBluePrint"
      v-if="previewBluePrintVisible"
      :compInstance="CompInstance"
      @closeBlueprintDiagram="closeBlueprintDiagram"
    ></DiagramBluePrint>
  </div>
</template>

<script>
import PreviewDiagramUI from '@/components/editor/right/PreviewDiagramUI'
import DiagramBluePrint from '@/components/editor/right/DiagramBluePrint'
import { OPEN_COMP } from 'common/js/event-types'
import { mapGetters, mapMutations } from 'vuex'
import { SET_PREVIEW_BLUE_PRINT_STATE } from 'store/mutation-types'
import { debounce } from 'common/js/util'

export default {
  inject: ['diagram'],
  provide() {
    return {
      preview: this
    }
  },
  data() {
    return {
      CompInstance: null,
      uiHeight: 0,
      reset: null
    }
  },
  computed: {
    ...mapGetters({
      previewBluePrintVisible: 'showPreviewBluePrint'
    })
  },
  watch: {
    previewBluePrintVisible() {
      this.switchBluePrint()
    }
  },
  methods: {
    ...mapMutations({
      setPreviewBluePrint: SET_PREVIEW_BLUE_PRINT_STATE
    }),
    getCompInstance(comp) {
      this.CompInstance = comp
    },
    switchBluePrint() {
      const previewHeight = this.$refs.preview.clientHeight

      if (this.previewBluePrintVisible) {
        this.uiHeight = previewHeight / 2
      } else {
        this.uiHeight = previewHeight
      }
      this.$nextTick(this.resizeAll)
    },
    destroyBlueprintDiagram() {
      this.closeBlueprintDiagram()
      this.CompInstance = null
    },
    closeBlueprintDiagram() {
      this.setPreviewBluePrint(false)
    },
    resizeAll() {
      this.$refs.previewDiagramUi && this.$refs.previewDiagramUi.resize()
      this.$refs.diagramBluePrint && this.$refs.diagramBluePrint.resize()
    },
    moveHandle(type, e) {
      if (type === 'move') {
        this.uiHeight += e.movementY
        this.reset()
      }
    }
  },
  mounted() {
    this.uiHeight = this.$refs.preview.clientHeight
    this.$bus.$on(OPEN_COMP, this.destroyBlueprintDiagram)
    this.$bus.$on('renderDiagram', this.closeBlueprintDiagram)
    this.reset = debounce(this.resizeAll, 500)
  },
  beforeDestroy() {
    this.$bus.$off(OPEN_COMP, this.destroyBlueprintDiagram)
    this.$bus.$off('renderDiagram', this.closeBlueprintDiagram)
  },
  components: {
    PreviewDiagramUI,
    DiagramBluePrint
  }
}
</script>

<style lang="stylus" scoped>
.preview
  display flex
  flex-direction column
  width 100%
  min-width 200px
  overflow hidden

  .el-code-header
    height 36px
    background-color: #252526
    display flex;
    align-items center
    padding 0 10px
    .title
      margin-right auto
      white-space nowrap

    .config
      height 25px
      display flex
      justify-content space-between
      overflow: hidden;

      .dark-input
        height: 24px;
        width: 100px;
    .nav-menu
      flex-shrink 0
      i
        font-size 16px

  .line
    position relative
    width 100%
    height 0px
    background-color: #242528;
    cursor s-resize
    z-index 1
    flex-shrink: 0
    .line-content
      position absolute
      left 0
      bottom 0
      width 100%
      height 5px
</style>
