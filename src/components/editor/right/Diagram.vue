<template>
  <div>
    <PreviewImg :imgSrc="imgSrc" />
    <div
      class="ed-diagram"
      :style="{
        zIndex: showDiagram ? 9999 : -100,
        height: height + 'px',
        width: width + 'px'
      }"
      ref="comp"
    >
      <header>
        <a-button
          @click="getScreenshots"
          class="screenshots"
          size="small"
          type="dashed"
          :ghost="true"
          >截取缩略图</a-button
        >
        <ul :style="{ transform: `scaleX(${isShowColor ? 1 : 0})` }">
          <li
            v-for="color in colors"
            :key="color"
            :style="{ background: color }"
            @click="changeColor(color)"
          ></li>
        </ul>
        <img
          width="20"
          height="20"
          src="/conch/static/img/compColorGroupBtn.svg"
          @click="isShowColor = true"
        />
        W:
        <a-input
          class="dark-input"
          :value="width"
          @change="changeBox($event, 'width')"
        >
        </a-input>
        H:
        <a-input
          class="dark-input"
          :value="height"
          @change="changeBox($event, 'height')"
        >
        </a-input>
        <i
          class="iconfont conch-icon-scenectrol-play"
          @click.stop="diagram.initBigDiagram.apply(diagram)"
        ></i>
        <i
          class="iconfont conch-icon-homepage-closeitem"
          @click.stop="setDiagramState(false)"
        ></i>
      </header>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { SET_DIAGRAM_STATE } from 'store/mutation-types'
import PreviewImg from './PreviewImg.vue'
import { SHOW_SNAPSHOT_PREVIEW } from '../../../common/js/event-types'

const isNumber = val => /^\d+$/.test(val)

export default {
  inject: ['diagram'],
  components: {
    PreviewImg
  },
  props: {
    bgColor: {
      type: String,
      default: '#000'
    }
  },
  data() {
    return {
      colors: [
        '#161823',
        '#3D3B4F',
        '#424C50',
        '#065279',
        '#2E4E7E',
        '#003371',
        '#003472',
        '#FFFFFF'
      ],
      isShowColor: false,
      imgSrc: ''
    }
  },
  computed: {
    ...mapGetters({
      showDiagram: 'showDiagram'
    }),
    height: {
      get() {
        return this.diagram.comp.config.height || '600'
      },
      set() {}
    },
    width: {
      get() {
        return this.diagram.comp.config.width || '1020'
      },
      set() {}
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.diagram.init(this.$refs.comp)
    })
  },
  methods: {
    ...mapMutations({
      setDiagramState: SET_DIAGRAM_STATE
    }),
    changeColor(color) {
      this.isShowColor = false
      this.diagram.changeColor(color)
    },
    getNumber(nv, k) {
      return isNumber(nv) ? nv : this[k]
    },
    changeBox(e, k) {
      const val = this.getNumber(e.target.value, k)
      if (this[k] !== val) {
        this.$set(this.diagram.comp.config, k, val)
        this.diagram.setUpdatePropsKey('config')
        const diagramDom = this.diagram.parent.querySelector('#diagram')
        diagramDom.style[k] = val + 'px'
      }
    },
    // 截取缩略图
    async getScreenshots() {
      this.imgSrc = await this.diagram.manualUpdateSnapshot()
      // 整理好之后再对显示出来
      this.$bus.$emit(SHOW_SNAPSHOT_PREVIEW, true)
    }
  },
  destroyed() {
    this.diagram.destoryBigDiagram()
  }
}
</script>

<style lang="stylus" scoped>
.ed-diagram {
  position: absolute;
  top: 40px;
  right: 70px;
  // z-index: 9999;
  min-width: 460px;
  >iframe {
    width: 100%;
    height: 100%;
  }
  >header {
    background: #292929;
    line-height: 40px;
    text-align: end;
    position: relative;
    .screenshots {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
    >i {
      margin-right: 10px;
      cursor: pointer;
    }
    >input {
      width: 60px;
      height: 19px;
      margin-right: 5px;
    }
    >img {
      width: 16px;
      height: 16px;
      margin-top: -4px;
      margin-right: 10px;
      cursor: pointer;
    }
    >ul {
      display: inline-block;
      transform: scaleX(0);
      transform-origin: 100% 50%;
      transition: transform .5s linear;
      >li {
        display: inline-block;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        margin-right: 5px;
        cursor: pointer;
      }
    }
  }
}
</style>
