<template>
  <a-drawer
    class="dark-drawer css-drawer my-scroll"
    width="330"
    :visible="visible"
    :closable="false"
    @close="handleCancel"
  >
    <div class="css-container">
      <header class="child-between">
        <span>CSS资源</span>
      </header>
      <a-input
        placeholder="请输入搜索关键词"
        v-model="search"
        class="dark-input"
      />
      <ul class="css-body">
        <li v-for="item in showCssList" :key="item">
          <span :title="item">{{ item }}</span>
          <i class="iconfont conch-icon-importjs" @click="useCss(item)"></i>
        </li>
      </ul>
    </div>
  </a-drawer>
</template>

<script>
import { getStaticList } from 'api/resource'
import { requestHandle } from 'common/js/util'
export default {
  inject: ['diagram'],
  data() {
    return {
      visible: false,
      search: '',
      cssList: [],
      loaded: false
    }
  },
  computed: {
    comp() {
      return this.diagram.comp
    },
    showCssList() {
      return this.cssList.filter(k => k.includes(this.search))
    }
  },
  methods: {
    async showModal() {
      if (!this.loaded) await this.getCssList()
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    },
    async getCssList() {
      let d = await requestHandle(
        getStaticList({ type: 'css' }),
        '获取列表错误'
      )
      if (d) {
        this.loaded = true
        this.cssList = d.sort((a, b) => a.localeCompare(b, 'zh-CN'))
      }
    },

    useCss(name) {
      if (!this.comp) {
        this.$notification.info({
          message: '请至左侧组件列表打开一个已有组件'
        })
        return
      }

      this.diagram.addCompCss(name)
    }
  }
}
</script>

<style lang="stylus">
.css-drawer {
  color: #fff;
  .ant-drawer-header {
    padding: 0
  }
  .ant-drawer-body {
    padding 12px 15px;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    .css-container {
      height: 100%;
      width: 100%;
      overflow: auto;
      header {
        font-size: 14px;
        >span {
          color: #999999;
        }
      }
      .dark-input.ant-input {
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin: 19px 0;
      }
    }
    .css-body {
      background-color: rgba(48, 48, 48, 1);
      >li {
        line-height: 30px;
        position: relative;
        span {
          color: rgba(255,255,255,0.7)
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          display: inline-block;
          width: 90%;
          line-height: 24px;
        }
        i {
          display: none;
          cursor: pointer;
          position: absolute;
          right: 10px;
        }
        &:hover {
          i {
            display: inline-block;
          }
        }
      }
    }
  }
}
</style>
