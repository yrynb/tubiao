<template>
  <div v-show="visible" class="preview-model">
    <header>
      <a-button :ghost="true" @click="ok">应用缩略图</a-button>
      <i
        class="iconfont conch-icon-homepage-closeitem"
        @click.stop="visible = false"
      ></i>
    </header>
    <img :src="imgSrc" class="preview-img" />
  </div>
</template>

<script>
import { SHOW_SNAPSHOT_PREVIEW } from 'common/js/event-types'
export default {
  inject: ['diagram'],
  props: {
    imgSrc: {
      default: '',
      type: String
    }
  },
  data() {
    return {
      visible: false
    }
  },
  mounted() {
    this.$bus.$on(SHOW_SNAPSHOT_PREVIEW, msg => {
      this.visible = msg
    })
  },
  methods: {
    async ok() {
      await this.diagram.setSnapshot(this.imgSrc)
      this.visible = false
    }
  }
}
</script>

<style lang="stylus" scoped>
.preview-model {
    max-height: 500px;
    max-width: 700px;
    border: 1px solid #d9d9d9;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%)
    position: fixed;
    background-color: rgba(255, 255, 255, 0.6);
    z-index: 10001;
    .preview-img {
      max-height: 470px;
      max-width: 600px;
    }
    >header {
      line-height: 50px;
      padding: 0 10px 0 10px;
      font-size: 16px;
      position: absolute;
      right: 0px;
      * {
        margin-right: 10px;
        color: #d9d9d9;
        border-color: #d9d9d9;
      }
      button:hover {
        color: #40a9ff;
        border-color: #40a9ff;
      }
      i {
        cursor: pointer;
      }
      i:hover {
        color: #40a9ff;
      }
    }
  }
</style>
