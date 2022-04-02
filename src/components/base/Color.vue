<template>
  <div class="color-container">
    <Sketch v-model="color" />
  </div>
</template>
<script>
import { Sketch } from 'vue-color'
export default {
  props: {
    value: {
      type: String,
      required: true
    }
  },
  computed: {
    color: {
      get() {
        return this.value
      },
      set(v) {
        const rgba = v.rgba
        this.$emit('input', `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`)
      }
    }
  },
  components: {
    Sketch
  }
}
</script>

<style lang="stylus" scoped>
.color-container {
  position: absolute;
  z-index: 999;
  line-height: normal;
}
</style>
