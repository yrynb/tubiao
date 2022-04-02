<template>
  <List
    ref="content"
    :list="listData"
    :options="[
      { name: 'copyCompId', slot: 'top-right' },
      { name: 'deleteBtn', slot: 'top-center', type: 'myComponent' },
      { name: 'versionTag', slot: 'bottom-top-right' },
      { name: 'hot', slot: 'bottom-left' },
      { name: 'edit', slot: 'bottom-right' },
      { name: 'downloadBtn', slot: 'bottom-right', type: 'myComponent' }
    ]"
    :finish="finish"
    :dataGetting="dataGetting"
    noDataMsg="您还没有创建过组件~赶快点击开发入口创建组件吧。"
    @load="loadScene"
  />
</template>

<script>
import { myComponents } from 'api/comp'
import mixinsScene from '@/components/scenes/mixinScene'

export default {
  mixins: [mixinsScene],
  data() {
    return {
      requestPromise: myComponents
    }
  },

  mounted() {
    this.$bus.$on('loadDeleteData', this.loadDeleteData)
  },
  methods: {
    getOpt() {
      return {
        page: this.page,
        size: this.size,
        query: {
          owner: this.userInfo.userName
        }
      }
    },
    async loadDeleteData(num = 1) {
      if (this.finish) return
      const { size, page } = this
      if (num === 1) {
        this.size = num
        this.page = this.listData.length + 1
        await this.getData()
        this.size = size
        this.page = page
      } else {
        const perfix = (num / size) | 0
        let promiseList = [this.getData()].concat(
          new Array(perfix)
            .fill(0)
            .filter((k, i) => page - i > 0)
            .map((k, i) =>
              this.getData({
                page: page - i
              })
            )
        )
        this.dataHandleSelf = d =>
          d.filter(item => !this.listData.find(l => l.id === item.id))
        await Promise.all(promiseList)
        this.dataHandleSelf = null
      }
    },
    destroyed() {
      this.$bus.$off('loadDeleteData', this.loadDeleteData)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/common/stylus/index.styl';
</style>
