<template>
  <div class="md-container my-scroll">
    <div class="md-body" v-html="mdHtml" ref="MDBody"></div>
  </div>
</template>
<script>
import md from 'common/js/md'
import { debounce } from 'common/js/util'
export default {
  props: {
    md: String
  },
  data() {
    return {
      mdHtml: null
    }
  },
  beforeCreate() {
    this.setMdCode = debounce(nv => {
      this.mdHtml = md.marked(nv, this.$refs.MDBody)
      this.$nextTick(() => {
        md.setCode(this.$refs.MDBody)
      })
    }, 500)
  },
  watch: {
    md: {
      immediate: true,
      handler(nv) {
        if (nv) this.setMdCode(nv)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.md-container {
  height: 100%;
  padding: 16px;
  background-color: #fff;
  >div {
    height: 100%;
    width: 100%;
    overflow: auto
  }
}
</style>
