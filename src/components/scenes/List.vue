<template>
  <div
    class="content-box"
    v-scroll="{ load: listenScroll, interval: 10, finish: finish }"
  >
    <div class="content-wrapper">
      <template v-if="listData && listData.length">
        <ListBtn
          v-for="(item, index) in listData"
          :options="options"
          :key="item.id + index"
          :list="listData"
          :item="item"
          :compConentBackground="compConentBackground"
          :borderRadius="borderRadius"
          :titleColor="titleColor"
        >
        </ListBtn>
      </template>
    </div>
    <div class="load-more" v-if="!noMore && (listData.length || !finish)">
      <div class="load-state">
        {{
          finish ? '没有更多内容了' : dataGetting ? '加载中' : '上滑加载更多'
        }}
      </div>
    </div>
    <no-data v-if="!listData.length && finish">{{ noDataMsg }}</no-data>
  </div>
</template>

<script>
import ListBtn from '@/components/base/ListBtn'

export default {
  props: {
    list: {
      type: Array,
      immediate: true
    },
    options: {
      type: Array,
      immediate: true
    },
    finish: {
      type: Boolean,
      default: false
    },
    dataGetting: {
      type: Boolean,
      default: false
    },
    noDataMsg: {
      type: String,
      immediate: true
    },
    noMore: {
      type: Boolean,
      default: false
    },
    compConentBackground: {
      type: String,
      immediate: true
    },
    borderRadius: {
      type: Number,
      immediate: true
    },
    titleColor: {
      type: String,
      immediate: true
    }
  },
  computed: {
    listData: function() {
      let resourceArrData = JSON.parse(localStorage.getItem('resourceArr'))

      if (resourceArrData && resourceArrData.length > 0) {
        this.list.map(item =>
          resourceArrData.map(
            pItem => item.id === pItem.sid && (item._checked = true)
          )
        )
      }
      return this.list
    }
  },

  watch: {
    listData() {
      for (let i = 0; i < this.listData.length; i++) {
        if (i < 10) {
          if (
            this.listData[i].snapshot &&
            !this.listData[i].snapshot.includes('?t=')
          ) {
            this.listData[i].snapshot =
              this.listData[i].snapshot + '?t=' + new Date().getTime()
          }
          if (
            this.listData[i].publishSnapshot &&
            !this.listData[i].publishSnapshot.includes('?t=')
          ) {
            this.listData[i].publishSnapshot =
              this.listData[i].publishSnapshot + '?t=' + new Date().getTime()
          }
        }
      }
    }
  },
  methods: {
    listenScroll() {
      if (!this.finish) {
        this.$emit('load')
      }
    }
  },
  components: {
    ListBtn
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/common/stylus/index.styl';

.content-box{
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  .content-wrapper {
    gridWrapper(340px)
  }
  .load-more{
    width: 100%;
    text-align :center;
    color: #666666;
  }
}
</style>
