<template>
  <div class="comp-containerA" :style="containerAStyle">
    <div class="comp-containerB" :style="containerBStyle">
      <div ref="comp" :style="style"></div>
    </div>
    <input type="text" id="screenshot_uino" />
  </div>
</template>

<script>
import { getByIdVersion } from 'api/version'
import Vue from 'vue'
export default {
  name: 'PreviewSnapshot',
  data() {
    return {
      compId: this.$router.currentRoute.query.id,
      paddding: this.$router.currentRoute.query.padding || 15,
      comp: null,
      comp_width: 480,
      comp_height: 270,
      comp_bgColor: '#212226',
      translateX: 0,
      translateY: 0,
      scale: 'scale(1)',
      default_width: 480,
      default_height: 270
    }
  },
  computed: {
    style() {
      return `width:${this.comp_width}px;height:${this.comp_height}px;background-color:${this.comp_bgColor};`
    },
    containerAStyle() {
      return `width:${this.default_width}px;height:${this.default_height}px;background-color:${this.comp_bgColor};`
    },
    containerBStyle() {
      let scale = (this.default_width - this.paddding * 2) / this.default_width
      scale = scale <= 0 ? 1 : scale
      // eslint-disable-next-line
      let text = `width:${this.default_width}px;height:${this.default_height}px;transform:scale(${scale})`
      return text
    }
  },
  async created() {
    this.getDefaultSize()
    await this.getCompById()
    await this.initConch(this.$refs.comp, this.compId)
  },
  methods: {
    // 获取url中宽高并赋值
    getDefaultSize() {
      if (this.$router.currentRoute.query.width) {
        this.default_width = this.$router.currentRoute.query.width
        this.comp_width = this.$router.currentRoute.query.width
      }
      if (this.$router.currentRoute.query.height) {
        this.comp_height = this.$router.currentRoute.query.height
        this.default_height = this.$router.currentRoute.query.height
      }
    },
    changeInput() {
      const dom = document.querySelector('#screenshot_uino')
      dom.value = this.compId
    },
    // 应用位移和缩放
    transformComp() {
      this.$refs.comp.style.transformOrigin = '50% 50%'
      this.$refs.comp.style.transform = `translateX(${this.translateX}px) translateY(${this.translateY}px) ${this.scale}`
    },
    // 计算缩放比例和位移距离
    calculateSale() {
      // 拿到组件容器第一个子节点真实宽高
      const h = this.$refs.comp.children[0].getBoundingClientRect().height
      const w = this.$refs.comp.children[0].getBoundingClientRect().width
      if (h > this.comp_height) {
        this.comp_height = h
      }
      if (w > this.comp_width) {
        this.comp_width = w
      }

      const dh = this.default_height
      const dw = this.default_width
      this.translateX = dw / 2 - this.comp_width / 2
      this.translateY = dh / 2 - this.comp_height / 2
      if (this.comp_width >= dw && this.comp_height >= dh) {
        this.scale = `scale(${Math.min(
          dw / parseInt(this.comp_width),
          dh / parseInt(this.comp_height)
        )})`
        this.transformComp()
        return
      }
      if (this.comp_width <= dw && this.comp_height <= dh) {
        let s = Math.min(
          dw / parseInt(this.comp_width),
          dh / parseInt(this.comp_height)
        )
        if (s > 2) {
          this.scale = `scale(2)`
          this.transformComp()
          return
        }
        this.scale = `scale(${s})`
        this.transformComp()
        return
      }
      if (this.comp_width <= dw && this.comp_height >= dh) {
        this.scale = `scale(${dh / parseInt(this.comp_height)})`
        this.transformComp()
        return
      }
      if (this.comp_width >= dw && this.comp_height <= dh) {
        this.scale = `scale(${dw / parseInt(this.comp_width)})`
        this.transformComp()
      }
    },
    // 通过ID获取组件信息
    async getCompById() {
      const a = await getByIdVersion(this.compId)
      if (a.code === 200) {
        this.comp = a.data
        const config = JSON.parse(this.comp.config)
        // config.bgColor && (this.comp_bgColor = config.bgColor)
        config.width && (this.comp_width = config.width)
        config.height && (this.comp_height = config.height)
      } else {
        console.warn(a.message)
      }
    },
    async initConch(dom, id) {
      // 1、先加载conch的base.js文件
      const baseUrl = window.location.origin
      const baseScript = document.createElement('script')
      baseScript.src = `${baseUrl}/spray/compile`
      document.head.appendChild(baseScript)

      // 2、加载完成引入需要展示的conch组件
      baseScript.onload = () => {
        const compScript = document.createElement('script')
        compScript.src = `${baseUrl}/s-static/component/${id}.js`
        document.head.appendChild(compScript)

        compScript.onload = async () => {
          if (dom) {
            id = 'C' + id
            const app = new window.conch[id](dom, {
              prefix: window.location.origin + '/s-static',
              Vue
            })
            // 判断组件类型
            // if (app.type === 'echarts') {
            //   this.comp_width = this.default_width
            //   this.comp_height = this.default_height
            // }
            await app.render()
            this.calculateSale()
            this.changeInput()
            window.instance = app
          }
        }
      }
    }
  }
}
</script>

<style scoped>
#screenshot_uino {
  transform: translateX(-999px);
}
</style>
