<script>
import Header from './header/Header'
import Right from './right/Right'
import Imagination from './Imagination'
import diagram from 'common/js/diagram'
import {
  OPEN_EDITOR_LOADING,
  CLOSE_EDITOR_LOADING
} from 'common/js/event-types'

import { mapMutations, mapGetters } from 'vuex'
import {
  SET_Z_MODE,
  SET_LEFT_FOLD,
  SET_PREVIEW_STATE
} from 'store/mutation-types'

export default {
  provide: {
    diagram
  },
  data() {
    return {
      isLoading: true,
      loading: 0,
      diagram,
      showImagination: false,
      isCooperation: this.$route.meta.isCooperation
    }
  },
  async created() {
    window.diagram = diagram
    document.onkeydown = this.editorEvent.bind(this)
    this.$bus.$on(OPEN_EDITOR_LOADING, () => (this.loading += 1))
    this.$bus.$on(CLOSE_EDITOR_LOADING, () => {
      if (this.loading === 0) return
      this.loading -= 1
    })
    try {
      if (this.loadHandle) await this.loadHandle()
      this.isLoading = false
    } catch (error) {
      console.error(error)
      this.$notification.error({
        message: '组件加载出错',
        description: error + ''
      })
    }
  },
  computed: {
    comp() {
      return diagram.comp
    },
    ...mapGetters({
      zMode: 'zMode',
      leftFold: 'leftFold'
    })
  },
  methods: {
    ...mapMutations({
      setZMode: SET_Z_MODE,
      setLeftFold: SET_LEFT_FOLD,
      setPreviewState: SET_PREVIEW_STATE
    }),

    async editorEvent(e) {
      try {
        const isCtrl = e.ctrlKey || e.metaKey
        const keyCode = e.keyCode
        switch (true) {
          // 保存
          case isCtrl && keyCode === 83:
            e.returnValue = false
            this.$emit(OPEN_EDITOR_LOADING)
            let d = await diagram.saveComp()
            this.$bus.$emit('renderDiagram')
            this.setPreviewState(true)
            if (d) {
              this.$notification.success({
                message:
                  '保存成功' +
                  (this.isCooperation
                    ? '，可以到 ThingJS UI-布局 页面中更新该组件看到效果'
                    : '')
              })
            }
            this.$emit(CLOSE_EDITOR_LOADING)
            break
          case isCtrl && (keyCode === 69 || keyCode === 84 || keyCode === 80):
            e.returnValue = false
            this.showImagination = true
            break
          // esc
          case keyCode === 27:
            // this.showImagination = false
            this.setZMode(false)
            this.setLeftFold(false)
            break
        }
      } catch (error) {}
    }
  },
  components: {
    Header,
    Right,
    Imagination
  }
}
</script>

<style lang="stylus">
$header-height = 60px;
$editor-color = #fff;
$editor-font-size = 14px;
.ed-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #1e1e1e;
  color: $editor-color;
  font-size: $editor-font-size;
  .ed-header {
    height: $header-height;
    transform-origin: 0 0;
  }
}
</style>
