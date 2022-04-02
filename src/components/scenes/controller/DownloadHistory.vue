<template>
  <div class="download-warp">
    <div class="download-select-warp">
      <a-select v-model="selected" style="width: 120px" @change="init">
        <a-select-option
          :value="item.key"
          v-for="item in timeList"
          :key="item.key"
        >
          {{ item.key }}
        </a-select-option>
      </a-select>
    </div>
    <a-timeline v-if="Array.isArray(listData) && listData.length > 0">
      <a-timeline-item v-for="item in listData" :key="item.time">
        <p>{{ item.time }}</p>
        <List
          ref="content"
          :list="item.child"
          :options="[
            { name: 'copyCompId', slot: 'top-right' },
            { name: 'preview', slot: 'top-center' },
            { name: 'versionTag', slot: 'bottom-top-right', type: 'myHistory' },
            { name: 'lastDownloadTime', slot: 'bottom-left' },
            { name: 'downloadBtn', slot: 'bottom-right' }
          ]"
          :noMore="true"
          :dataGetting="dataGetting"
          @load="loadScene"
        />
      </a-timeline-item>
    </a-timeline>
    <no-data v-else>{{ noDataMsg }}</no-data>
  </div>
</template>

<script>
import { myLogs } from 'api/comp'
import mixinsScene from '@/components/scenes/mixinScene'

export default {
  mixins: [mixinsScene],
  data() {
    const time = new Date().getTime()
    const day = 24 * 60 * 60 * 1000
    const timeList = [5, 15, 30, 60, 90]
      .map(k => ({
        key: k + '天',
        value: time - day * k
      }))
      .concat([
        {
          key: '全部',
          value: 'all'
        }
      ])
    return {
      requestPromise: myLogs,
      type: 'List',
      timeList,
      selected: timeList[0].key,
      noDataMsg:
        '您还没有下载记录~赶快图表市场中挑选喜欢的组件，加入到资源库进行下载使用吧。'
    }
  },
  methods: {
    getOpt() {
      const supplement = {
        state: 4
      }
      const selectTime = this.timeList.find(item => item.key === this.selected)
      if (selectTime) {
        supplement.startTime = selectTime.value !== 'all' ? selectTime.value : 0
      }
      return {
        page: this.page,
        size: this.size,
        query: {
          operator: this.userInfo.userName
        },
        supplement
      }
    },
    dataHandleSelf(d) {
      let list = []
      let currentTime
      let current
      d.forEach(item => {
        const { operationTime } = item
        if (currentTime !== operationTime || !current) {
          current = {
            time: operationTime,
            child: []
          }
          currentTime = operationTime
          list.push(current)
        }
        current.child.push(item)
      })
      return list
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/common/stylus/index.styl';
.download-warp {
  height: 100%;
  width: 100%;
  .download-select-warp {
    height: 40px;
  }
  >ul.ant-timeline {
    padding-top: 10px;
    height: calc(100% - 60px);
    overflow: auto;
  }
}
</style>
