<template>
  <a-drawer
    class="dark-drawer script-drawer my-scroll"
    width="330"
    :visible="visible"
    :closable="false"
    @close="handleCancel"
  >
    <div class="script-container">
      <header class="child-between">
        <span>fonts 资源</span>
      </header>
      <a-input
        placeholder="请输入搜索关键词"
        v-model="search"
        class="dark-input"
      />
      <ul class="script-body">
        <li v-for="item in showFontList" :key="item.file">
          <span :title="item.name">{{ item.name }}</span>
          <i class="iconfont conch-icon-importjs" @click="useFont(item)"></i>
        </li>
      </ul>
    </div>
  </a-drawer>
</template>

<script>
import { getFonts } from 'api/resource'
import { requestHandle } from 'common/js/util'
export default {
  inject: ['diagram'],
  data() {
    return {
      visible: false,
      search: '',
      list: [],
      loaded: false
    }
  },
  computed: {
    comp() {
      return this.diagram.comp
    },
    showFontList() {
      return this.list.filter(k => k.name.includes(this.search))
    }
  },
  methods: {
    async showModal() {
      if (!this.loaded) await this.getFontList()
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    },
    async getFontList() {
      let d = await requestHandle(getFonts(), '获取列表错误')
      if (d) {
        this.loaded = true
        this.list = d
      }
    },

    useFont(name) {
      if (!this.comp) {
        this.$notification.info({
          message: '请至左侧组件列表打开一个已有组件'
        })
        return
      }
      this.diagram.addCompFont(name)
    }
  }
}
</script>
<style scoped>
.script-body {
  background-color: rgba(48, 48, 49, 1);
}
</style>
