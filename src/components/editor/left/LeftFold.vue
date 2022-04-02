<template>
  <div class="fold-container">
    <div>
      <i class="iconfont conch-editor-expend" @click="setLeftFold(false)"></i>
    </div>
    <div>
      <i class="iconfont conch-editor-zenmode" @click="clickZenMode()"></i>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
import { SET_Z_MODE, SET_LEFT_FOLD } from 'store/mutation-types'
export default {
  methods: {
    ...mapMutations({
      setZMode: SET_Z_MODE,
      setLeftFold: SET_LEFT_FOLD
    }),
    ...mapGetters({
      zMode: 'zMode',
      leftFold: 'leftFold'
    }),
    clickZenMode() {
      this.setZMode(false)
      this.setLeftFold(!this.leftFold)
    }
  }
}
</script>
<style lang="stylus" scoped>
.fold-container {
  height: 100%;
  position: relative;
  background-color: #242528;
  >div {
    position: absolute;
    >i {
      cursor: pointer;
    }
    &:first-child {
      top: 20px;
      left: 14px;
      >i {
        font-size: 20px;
      }
    }
    &:last-child {
      bottom: 19px;
      left: 17px;
      >i {
        font-size: 12px;
      }
    }
  }
}
</style>
