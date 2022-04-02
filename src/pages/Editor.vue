<template>
  <div class="ed-container">
    <Loading v-if="isLoading" size="large" />
    <template v-else>
      <Loading size="large" v-if="loading !== 0" />
      <transition name="editor-header">
        <Header v-show="!zMode" @openImagination="showImagination = true" />
      </transition>
      <div class="ed-body" :style="{ height: edBodyHeight }">
        <div class="ed-left" v-show="!isIdQuery">
          <LeftFold v-show="leftFold" />
          <transition
            name="editor-left"
            @after-leave="resizeLayout"
            @after-enter="resizeLayout"
          >
            <Left v-show="!leftFold" />
          </transition>
        </div>
        <div class="ed-right">
          <Right v-if="comp" ref="right" />
          <a-empty
            v-else
            :description="false"
            image="/conch/static/img/logo-editor.png"
            class="dark-empty flex-center ed-right-empty"
          />
        </div>
      </div>
      <Imagination v-show="showImagination" @close="showImagination = false" />
    </template>
  </div>
</template>

<script>
import Left from '../components/editor/left/Left'
import LeftFold from '../components/editor/left/LeftFold'
import { mapGetters, mapMutations } from 'vuex'
import { SET_Z_MODE } from 'store/mutation-types'
import EditorMixins from '@/components/editor/EditorMixins'
export default {
  mixins: [EditorMixins],
  data() {
    return {
      isIdQuery: this.$route.query.id
    }
  },
  computed: {
    edBodyHeight() {
      return this.zMode ? '100%' : 'calc(100% - 60px)'
    },
    ...mapGetters({
      zMode: 'zMode',
      leftFold: 'leftFold'
    })
  },
  methods: {
    async loadHandle() {
      if (this.isIdQuery) {
        let ID = this.isIdQuery.split('')
        if (ID[0] === 'C') {
          ID.shift()
        }
        ID = ID.join('')
        await this.diagram.editorByID(ID)
      } else {
        await this.diagram.getListByGroup()
      }
    },
    resizeLayout() {
      this.$refs.right.resizeAll()
    },
    ...mapMutations({
      setZMode: SET_Z_MODE
    })
  },
  components: {
    Left,
    LeftFold
  }
}
</script>

<style lang="stylus">
div.ed-body {
  width: 100%;
  display: flex;
  .ed-left{
    flex-shrink 0
    height 100%
    border-right 1px solid #000
  }
  .ed-right{
    flex 1
    height 100%
    overflow hidden
    border-top 1px solid #000
    .ed-right-empty{
      height 100%
    }
  }
  .ed-list-container {
    width 260px
  }
  .fold-container {
    width: 48px;
  }
}

.editor-left-enter-active, .editor-left-leave-active {
  transition: all .25s ease
}
.editor-left-enter, .editor-left-leave-to {
  width: 48px !important;
}

.editor-header-enter-active {
  animation: editor-header-in .5s;
}
.editor-header-leave-active {
  animation: editor-header-in .5s reverse;
}
@keyframes editor-header-in {
  0% {
    height: 0;
  }
  100% {
    height: $header-height;
  }
}
</style>
