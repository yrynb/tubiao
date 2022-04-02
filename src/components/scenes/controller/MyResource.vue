<template>
  <div class="repository-wrapper">
    <div class="filter">
      <div class="search-wrapper">
        <a-badge :count="downloadList.length">
          <a-button
            v-for="(item, index) in shopCard"
            :key="item.icon"
            class="btn badgeBtn"
            size="large"
            :class="downloadList.length ? 'active ' : ' '"
            :disabled="downloadList.length ? false : true"
            @click="item.handle"
          >
            <template v-if="index === 0">
              <a-dropdown placement="bottomCenter">
                <div>
                  <i :class="'iconfont ' + item.icon"></i>
                  <span>{{ item.name }}</span>
                </div>
                <a-menu
                  slot="overlay"
                  v-show="downloadList.length ? true : false"
                  style="margin-top:10px;text-align:center;"
                >
                  <a-menu-item>
                    <a
                      rel="noopener noreferrer"
                      title="项目中已使用过Conch组件"
                      @click="downloadClickEvent(true)"
                    >
                      增量下载
                    </a>
                  </a-menu-item>
                  <a-menu-item>
                    <a
                      rel="noopener noreferrer"
                      title="项目中第一次使用Conch组件"
                      @click="downloadClickEvent(false)"
                    >
                      全量下载
                    </a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </template>
            <template v-else>
              <i :class="'iconfont ' + item.icon"></i>
              <span>{{ item.name }}</span>
            </template>
          </a-button>
        </a-badge>
        <div class="input-group ml-auto">
          <a-select
            label-in-value
            :default-value="{ key: 'name' }"
            style="width: 120px;"
            class="selectBox no-border-select"
            @change="handleChange"
          >
            <a-select-option value="name">组件名称</a-select-option>
            <a-select-option value="publishId">组件ID</a-select-option>
            <a-select-option value="owner">作者名称 </a-select-option>
            <a-select-option value="tag">关键词 </a-select-option>
          </a-select>
          <a-input
            type="text"
            class="input-normal"
            v-model="search"
            @change="searchHandle"
            placeholder="输入名称搜索"
          >
            <a-icon
              slot="suffix"
              type="close-circle"
              @click="deleteMsg"
              v-show="this.search"
            />
          </a-input>
          <a-button class="btn btn-search" type="link" size="large">
            <i class="iconfont conch-icon-compsearch"></i>
          </a-button>
        </div>
      </div>
      <AddProjectModal
        ref="addProject"
        @clearResourceArr="clearResourceArr"
      ></AddProjectModal>
    </div>
    <filter-wrapper
      ref="filterWrapper"
      :filterIsShow="true"
      :closetabIsShow="false"
      @filterChecked="init"
    ></filter-wrapper>
    <List
      ref="content"
      :list="listData"
      :options="[
        { name: 'checkBox', slot: 'top-left' },
        { name: 'copyCompId', slot: 'top-right' },
        { name: 'preview', slot: 'top-center' },
        { name: 'deleteBtn', slot: 'top-center', type: 'myResource' },
        { name: 'versionTag', slot: 'bottom-top-right' },
        { name: 'hot', slot: 'bottom-left' },
        { name: 'author', slot: 'bottom-left' },
        { name: 'downloadBtn', slot: 'bottom-right' }
      ]"
      :finish="finish"
      :dataGetting="dataGetting"
      noDataMsg="您还没有收藏记录~赶快图表市场中挑选喜欢的组件，加入到资源库进行下载使用吧。"
      @load="loadScene"
    />
  </div>
</template>

<script>
import FilterWrapper from '@/components/scenes/Filter'
import { mapActions } from 'vuex'
import { DOWNLOAD_COMPS } from 'store/mutation-types'
import { debounce, requestHandle } from 'common/js/util'
import { mystars } from 'api/comp'
import { cancelBatchStar } from 'api/star'
import AddProjectModal from '@/modal/resource/AddProjectModal'
import mixinsScene from '@/components/scenes/mixinScene'

export default {
  mixins: [mixinsScene],
  data() {
    return {
      // 一级分类选择
      category: null,
      // 二级分类选择
      categorySub: null,
      // 搜索内容
      search: null,
      query: {},
      // 防抖输入
      debounceSearch: debounce(this.init, 200),
      requestPromise: mystars,
      shopCard: [
        {
          name: '下载资源包',
          icon: 'conch-icon-downbatch',
          handle: e => {}
        },
        {
          name: '添加到项目',
          icon: 'conch-icon-addtoproject',
          handle: this.addProjectEvent
        },
        {
          name: '批量移出收藏',
          icon: 'conch-icon-compdel-res',
          handle: this.confirmHandle
        }
      ],
      option: {
        title: '',
        icon: 'icon_test1',
        handle: async item => {}
      }
    }
  },
  computed: {
    // 需要下载资源
    downloadList() {
      return this.listData.filter(item => item._checked)
    }
  },
  mounted() {
    this.$bus.$on('loadDeleteData', this.loadDeleteData)
  },
  methods: {
    ...mapActions({
      downloadComps: DOWNLOAD_COMPS
    }),
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
    getOpt() {
      const { category, categorySub } = this.$refs.filterWrapper.filterHandle()
      return {
        page: this.page,
        size: this.size,
        query: Object.assign(
          {
            category
          },
          this.query
        ),
        supplement: {
          state: 1,
          types: categorySub.length ? categorySub : null
        },
        sort: null
      }
    },
    // 批量下载
    downloadClickEvent(bool) {
      if (this.downloadList.length === 0) {
        this.$notification.info({
          message: '请先选择需要下载的组件'
        })
      }
      this.downloadComps({
        ids: this.downloadList.map(item => item.id),
        increase: bool
      })
      this.listData.forEach(item => {
        this.$set(item, '_checked', false)
      })
    },
    // 添加到项目
    addProjectEvent() {
      if (this.downloadList.length) {
        this.$refs.addProject.show()
        this.$refs.addProject.checkedList = []

        this.downloadList.forEach(item => {
          this.$refs.addProject.checkedList.push(item.id)
        })
      } else {
        this.$notification.info({
          message: '请先选择需要添加到项目的组件'
        })
      }
    },
    clearResourceArr() {
      this.listData.forEach(item => {
        this.$set(item, '_checked', false)
      })
    },
    // 批量移除收藏弹框
    confirmHandle() {
      this.$confirm({
        title: '删除',
        content: '您确定要移出收藏吗？',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        centered: true,
        onOk: () => {
          this.cancelBatchEvent()
        },
        onCancel() {}
      })
    },
    // 批量移出收藏
    async cancelBatchEvent() {
      if (this.downloadList.length) {
        let sids = []
        this.downloadList.forEach(item => {
          sids.push(item.id)
        })

        let d = await requestHandle(cancelBatchStar({ sids }))
        if (d) {
          this.$notification.success({
            message: '移出收藏成功'
          })

          sids.forEach(id => {
            this.listData.splice(
              this.listData.findIndex(item => item.id === id),
              1
            )
          })
          this.loadDeleteData(sids.length)
        }
      } else {
        this.$notification.info({
          message: '请先选择需要移出组件'
        })
      }
    },
    // 搜索选项
    handleChange(value) {
      this.selectKey = value.key
      if (!this.search) return
      this.search = ''
      this.searchHandle()
    },
    async searchHandle() {
      switch (this.selectKey) {
        case 'owner':
          this.debounceSearch()
          this.query = { owner: this.search || null }
          break
        case 'publishId':
          const s = /^C/.test(this.search) ? this.search.slice(1) : this.search
          this.query = { publishId: s || null }
          this.debounceSearch()
          break
        case 'tag':
          this.debounceSearch()
          this.query = { tag: this.search || null }
          break
        default:
          this.debounceSearch()
          this.query = { name: this.search || null }
          break
      }
    },
    deleteMsg() {
      if (this.search) {
        this.search = ''
        this.searchHandle()
      }
    }
  },
  components: {
    FilterWrapper,
    AddProjectModal
  },
  destroyed() {
    this.$bus.$off('loadDeleteData', this.loadDeleteData)
  }
}
</script>

<style lang="stylus" scoped>
.repository-wrapper {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}
.filter
    flex-grow: 0;
    flex-shrink: 0;
    width: 100%;
    padding: 0 10px 10px 10px;
    .search-wrapper
      display: flex;
      align-items:center;
      width: 100%;
      height: 40px;
      .ant-badge
        border: 1px solid #40a9ff;
        border-radius: 5px;
      .badgeBtn
        padding: 0;
        width: 120px;
        color: #666;
        font-size: 0.875rem;
        background: #fff;
        border: none;
        border-radius: 0;
        &:nth-child(1)
          border-top-left-radius: 5px;
          border-bottom-left-radius: 5px;
          >div
            span
              display: inline-block;
              line-height: 40px;
        &:nth-child(2)
          border: 1px solid rgb(217, 217, 217);
          border-top:none;
          border-bottom:none;
        &:nth-child(3)
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
        &:hover
          color: #fff;
          background: #007aff;
        .iconfont
          margin-right: 5px;
          font-size: 0.75rem;
      .input-group
        position: relative;
        width: 450px;
        height: 42px;
        color: #999999;
        .input-normal
          position: relative;
          width: 100%;
          height: 100%;
          padding: 0 42px 0 120px;
          font-size: 0.75rem;
          background-color: transparent;
          border: none;
          border-radius: 4px;
          outline: none;
        &:before
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 200%;
          border: 1px solid #999999;
          border-radius: 8px;
          transform: scale(0.5);
          transform-origin: 0 0;
        &:hover:before
          border-color: #007AFF;
        .btn-search
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 40px;
          height: 42px;
          line-height: 42px;
          padding: 0;
          text-align: center;
          color: inherit;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          .iconfont
            margin-right: 0;
            font-size: 1rem;
          &:hover
          &.active
            color: white;
            background-color: #007AFF;
            border-color: #007AFF;
        .selectBox
          position: absolute;
          top: 1px;
          left: 0;
          z-index: 10;
          height: 38px;
          line-height 38px;
/deep/.ant-input-affix-wrapper .ant-input:not(:last-child)
    width: 100%;
    height: 100%;
    padding-right: 20px;
    border: none;
    outline: none;
    box-shadow: none;
    background: transparent;
/deep/.ant-input-affix-wrapper .ant-input-suffix
      right: 50px;
      z-index: 20;
</style>
