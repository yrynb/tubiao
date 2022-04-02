<template>
  <div class="ed-code">
    <CodeHeader @resizeCode="resizeCode" @openProp="openProp"></CodeHeader>
    <div :class="['ed-code-body', { 'is-markdown': isMarkdown }]">
      <Code v-model="code" ref="editorCode" :language="selectFile.mode" />
      <MD v-if="isMarkdown" :md="code" />
    </div>
    <CompProps />
  </div>
</template>

<script>
import Code from '@/components/base/Code'
import MD from '@/components/base/MD'
import CodeHeader from './CodeHeader'
import CompProps from './CompProps'
import { mapGetters, mapMutations } from 'vuex'
import {
  SET_PREVIEW_BLUE_PRINT_STATE,
  SET_PREVIEW_STATE
} from 'store/mutation-types'
import { OPEN_PAGE, OPEN_COMP, OPEN_PROPS } from 'common/js/event-types'
import bus from 'common/js/eventBus'

export default {
  inject: ['diagram'],
  data() {
    return {
      visible: false,
      codeStr: ''
    }
  },
  mounted() {
    bus.$on(OPEN_PAGE, this.updateEditor)
    bus.$on(OPEN_COMP, this.updateEditor)
    bus.$on(OPEN_PROPS, this.openProp)
  },
  computed: {
    selectFile() {
      return this.diagram.sp
    },
    isMarkdown() {
      return this.selectFile.mode === 'markdown'
    },
    code: {
      get() {
        return this.codeStr || this.comp[this.selectFile.key]
      },
      set(nv) {
        if (
          typeof nv === 'string' &&
          this.comp.hasOwnProperty(this.selectFile.key) &&
          nv !== this.comp[this.selectFile.key]
        ) {
          this.diagram.updateCompProps(this.selectFile.key, nv)
          this.codeStr = nv
          // 切换页面是否编辑过的状态
          if (!this.selectFile.isEdit && this.selectFile.key !== 'cases') {
            this.selectFile.isEdit = true
          }
        }
      }
    },
    comp() {
      return this.diagram.comp
    },
    ...mapGetters({
      leftFold: 'leftFold',
      openProps: 'openProps'
    })
  },
  watch: {
    leftFold() {
      this.resizeCode()
      setTimeout(() => {
        this.$nextTick(() => this.resizeCode())
      }, 500)
    }
  },
  methods: {
    ...mapMutations({
      setOpenProps: OPEN_PROPS
    }),
    openProp() {
      this.setPreviewBluePrintState(false)
      this.setPreviewState(false)
      // this.visible = true
      this.setOpenProps(true)
    },
    updateEditor() {
      // this.visible = false
      this.setOpenProps(false)
      this.$refs.editorCode.setValue(this.comp[this.selectFile.key] || '')
    },
    ...mapMutations({
      setPreviewBluePrintState: SET_PREVIEW_BLUE_PRINT_STATE,
      setPreviewState: SET_PREVIEW_STATE
    }),
    resizeCode() {
      this.$refs.editorCode.layout()
    }
  },
  components: {
    Code,
    MD,
    CodeHeader,
    CompProps
  },
  destroyed() {
    bus.$off(OPEN_PAGE, this.updateEditor)
    bus.$off(OPEN_COMP, this.updateEditor)
    bus.$off(OPEN_PROPS, this.openProp)
  }
}
</script>

<style lang="stylus" scoped>
.ed-code {
  position: relative;
  min-width 200px
  height: 100%;
  overflow: hidden;
  flex: 1;
  .ed-code-body {
    height: calc(100% - 35px);
    &.is-markdown {
      display: flex;
      >div {
        height: 100%;
        width: 50%;
      }
    }
  }
}
</style>
