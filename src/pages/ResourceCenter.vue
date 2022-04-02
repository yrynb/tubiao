<template>
  <div class="resource">
    <div class="content">
      <content-wrapper :data="messageList"></content-wrapper>
    </div>
    <div class="main-wrapper">
      <div class="main my-scroll">
        <router-view></router-view>
      </div>
    </div>
    <NewVersion />
  </div>
</template>

<script>
import ContentWrapper from '@/components/resource/Content'
import NewVersion from '@/modal/resource/NewVersion'
import { getArray } from 'common/js/util'

export default {
  name: 'ResourceCenter',
  data() {
    return {
      messageList: []
    }
  },
  components: {
    ContentWrapper,
    NewVersion
  },
  created() {},
  mounted() {},
  methods: {
    // 初始化message
    initMessage(data) {
      this.messageList = []

      this.$nextTick(() => {
        this.messageList = getArray(data)
      })
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.initMessage(to.meta.messageList)
    })
  },
  beforeRouteUpdate(to, from, next) {
    this.initMessage(to.meta.messageList)
    next()
  }
}
</script>

<style lang="stylus" scoped>
.resource
  display: flex;
  width: 100%;
  min-width: 1300px;
  height: 100%;
  background-color: #F4F5F7;
  .content
    flex-shrink: 0;
    flex-grow: 0;
    width: 30%;
    min-width: 200px;
    max-width: 500px;
    height: 100%;
  .main-wrapper
    width: 100%;
    height: 100%;
    .main
      flex: 1;
      width: auto;
      height: 100%;
      padding: 30px;
      overflow-x: hidden;
      overflow-y: hidden;
</style>
