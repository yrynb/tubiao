<template>
  <div class="main-wrapper my-scroll">
    <Loading size="large" v-if="isLoading"></Loading>
    <template v-else>
      <div class="filter">
        <div class="search-wrapper">
          <a-button
            class="btn"
            size="large"
            style="margin-right:15px;"
            @click="filterIsShow = !filterIsShow"
          >
            <i class="iconfont conch-icon-homepage-filter"></i>
            <span>过滤</span>
          </a-button>
          <a-button
            class="btn"
            size="large"
            style="margin-right:15px;"
            v-show="resourceArr.length"
            @click="clearArr"
          >
            <i class="iconfont conch-Eliminate"></i>
            <span>清空选中</span>
          </a-button>

          <a-badge :count="resourceArr.length">
            <a-button
              v-for="(item, index) in shopCard"
              :key="item.icon"
              class="btn badgeBtn shopcard"
              size="large"
              :class="resourceArr.length ? 'active ' : ' '"
              :disabled="resourceArr.length ? false : true"
              @click="item.handle"
            >
              <template v-if="index === 1">
                <a-dropdown placement="bottomCenter">
                  <div>
                    <i :class="'iconfont ' + item.icon"></i>
                    <span>{{ item.name }}</span>
                  </div>
                  <a-menu
                    slot="overlay"
                    v-show="resourceArr.length ? true : false"
                    style="margin-top:10px;text-align:center;"
                  >
                    <a-menu-item>
                      <a
                        rel="noopener noreferrer"
                        title="项目中已使用过Conch组件"
                        @click="joinOrDownloadHandler('download')(true)"
                      >
                        增量下载
                      </a>
                    </a-menu-item>
                    <a-menu-item>
                      <a
                        rel="noopener noreferrer"
                        title="项目中第一次使用Conch组件"
                        @click="joinOrDownloadHandler('download')(false)"
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

            <span> </span>
          </a-badge>
          <span class="comp-number">{{ `共${this.total}个组件` }}</span>
          <div class="input-group  ml-auto">
            <a-select
              label-in-value
              :default-value="{ key: 'name' }"
              style="width: 120px;height:42px;"
              class="selectBox no-border-select"
              @change="handleChange"
            >
              <a-select-option value="name">组件名称</a-select-option>
              <a-select-option value="publishId">组件ID</a-select-option>
              <a-select-option value="owner">作者名称</a-select-option>
              <a-select-option value="tag">关键词</a-select-option>
            </a-select>
            <a-input
              type="text"
              class="input-normal"
              v-model="search"
              @change="searchHandle"
              placeholder="请输入搜索内容"
            >
              <a-icon
                slot="suffix"
                type="close-circle"
                @click="deleteMsg"
                v-show="this.search"
              />
            </a-input>
            <a-button class="btn-search" size="large">
              <i class="iconfont conch-icon-compsearch"></i>
            </a-button>
          </div>
        </div>

        <AddProjectModal
          ref="addProject"
          @clearResourceArr="clearArr"
        ></AddProjectModal>
      </div>

      <filter-wrapper
        ref="filterWrapper"
        v-model="filterIsShow"
        :closetabIsShow="true"
        @createComp="createComp"
        @filterChecked="init"
      ></filter-wrapper>
      <template>
        <List
          ref="content"
          :list="listData"
          :options="[
            { name: 'joinResourceCenter', slot: 'top-left' },
            { name: 'copyCompId', slot: 'top-right', type: 'gallery' },
            { name: 'preview', slot: 'top-center', type: 'gallery' },
            { name: 'pasteComponent', slot: 'top-center' },
            { name: 'versionTag', slot: 'bottom-top-right' },
            { name: 'hot', slot: 'bottom-left' },
            { name: 'author', slot: 'bottom-left' },
            { name: 'star', slot: 'bottom-right' },
            { name: 'downloadBtn', slot: 'bottom-right' }
          ]"
          :finish="finish"
          :dataGetting="dataGetting"
          noDataMsg="无数据展示，赶紧去创建新组件"
          @load="loadScene"
        />
      </template>
      <CreateCompModal ref="createModal" />
    </template>
  </div>
</template>

<script>
import FilterWrapper from '../components/scenes/Filter'
import CreateCompModal from 'modal/main/CreateCompModal'
import AddProjectModal from '@/modal/resource/AddProjectModal'
import mixinsScene from '@/components/scenes/mixinScene'
import { getCompListByPage } from 'api/comp'

import {
  DOWNLOAD_COMPS,
  SAVEBATCH_STAR,
  RESOURCE_ARR
} from 'store/mutation-types'
import { mapGetters } from 'vuex'
import { debounce } from 'common/js/util'

export default {
  mixins: [mixinsScene],
  data() {
    return {
      isLoading: true,
      // 过滤是否显示
      filterIsShow: false,
      // 搜索
      selectKey: null,
      query: {},
      search: null,
      // 防抖输入
      debounceSearch: debounce(this.init, 200),
      // listData: [],
      shopCard: [
        {
          name: '添加到收藏',
          icon: 'conch-icon-favcomp-t-big',
          handle: this.joinOrDownloadHandler('join')
        },
        {
          name: '下载资源包',
          icon: 'conch-icon-downbatch',
          handle: e => {}
        },
        {
          name: '添加到项目',
          icon: 'conch-icon-addtoproject',
          handle: this.addProjectEvent
        }
      ],
      requestPromise: getCompListByPage,
      type: 'page'
    }
  },
  mounted() {
    this.isLoading = false
    let _that = this
    window.addEventListener('storage', function(e) {
      if (e.key === 'starState') {
        let i = _that.listData.findIndex(
          item => item.id === e.newValue || item.publishId === e.newValue
        )
        _that.listData[i].star = !_that.listData[i].star
        localStorage.removeItem('starState')
      }
    })
  },
  computed: {
    ...mapGetters({
      resourceArr: 'resourceArr' // 购物车数据
    })
  },
  methods: {
    // 创建新组件
    createComp(data) {
      this.$refs.createModal.showModal(data)
    },
    // 清空购物车
    clearArr() {
      localStorage.removeItem('resourceArr')
      this.$store.commit(RESOURCE_ARR, [])
      this.listData
        .filter(item => item._checked)
        .forEach(item => {
          item._checked = false
        })
    },
    // 下载或加入资源中心
    joinOrDownloadHandler(name) {
      const handle = k => {
        this.shopContentShow = !this.shopContentShow
        this.clearArr(false)
      }
      return name === 'download'
        ? bool => {
            this.$store.dispatch(DOWNLOAD_COMPS, {
              ids: this.resourceArr.map(item => item.sid),
              increase: bool
            })
            handle()
          }
        : () => {
            this.$store.dispatch(SAVEBATCH_STAR, [
              this.resourceArr,
              this.listData
            ])
            handle()
          }
    },
    // 添加到项目
    addProjectEvent() {
      this.$refs.addProject.show()

      this.$refs.addProject.checkedList = this.resourceArr.map(item => item.sid)
    },
    getOpt() {
      const { category, categorySub } = this.$refs.filterWrapper.filterHandle()
      return {
        page: this.page,
        size: this.size,
        query: Object.assign(
          {
            category,
            publish: 1
          },
          this.query
        ),
        supplement: {
          types: categorySub.length ? categorySub : null
        },
        sort: 'publishTime,DESC'
      }
    },
    dataHandleSelf(list) {
      list.forEach(item => {
        item._checked = !!this.resourceArr.find(
          catchItem => catchItem.sid === item.publishId
        )
      })
      return list
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
        case 'tag':
          this.debounceSearch()
          this.query = { tag: this.search || null }
          break
        case 'publishId':
          const s = /^C/.test(this.search) ? this.search.slice(1) : this.search
          this.query = { publishId: s || null }
          this.debounceSearch()
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
    CreateCompModal,
    AddProjectModal
  }
}
</script>

<style lang="stylus" scoped>
.tool-center
  left: 40% !important;
.main-wrapper
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 1300px;
  height: 100%;
  padding: 30px 20px 20px;
  margin: 0 auto;
  .filter
    flex-grow: 0;
    flex-shrink: 0;
    width: 100%;
    padding: 0 10px 10px 10px;
    .search-wrapper
      display: flex;
      width: 100%;
      .btn
        font-size: 0.875rem;
        .iconfont
          margin-right: 5px;
          font-size: 0.75rem;
      .ant-badge
        border: 1px solid #40a9ff;
        border-radius: 5px;
      .badgeBtn
        padding: 0;
        width: 120px;
        color: #666;
        background: #fff;
        border: none;
        border-radius: 0;
        &:nth-child(1)
          border-top-left-radius: 5px;
          border-bottom-left-radius: 5px;
        &:nth-child(2)
          border: 1px solid rgb(217, 217, 217);
          border-top:none;
          border-bottom:none;
          >div
            span
              display: inline-block;
              line-height: 40px;
        &:nth-child(3)
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
        &:hover
          color: #fff;
          background: #007aff;
      .filter-badge
        position: relative;
        /deep/ .ant-badge-count
          top: 7px!important;
        .shopcard
          padding: 0!important;
          background: transparent;
          border-color: transparent;
          .conch-icon-gouwuche
            font-size: 1rem;
          &.active
            color: #096dd9;
            border-color: transparent;
        .shop-content
          display: none;
          position: absolute;
          top: 5px;
          left: 50px;
          z-index: 10;
          width: 250px;
          font-size: 12px;
          color: #666;
          text-align: center;
          li
            display: inline-block;
            margin-right: 5px;
            width: 100px;
            height: 35px;
            line-height: 35px;
            background: #FFFFFF;
            border-radius: 4px;
            border: 1px solid #007AFF;
            cursor: pointer;
            &:hover
              background: #F1F1F1;
      .comp-number
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.65)
        line-height: 40px;
        position: relative;
        margin: 0 20px 0 auto;
      .input-group
        position: relative;
        width: 500px;
        color: #999999;
        margin-left: 0 !important;
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
          height: 40px;
          line-height: 40px;
          padding: 0;
          text-align: center;
          color: inherit;
          background: transparent;
          border: none;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          .iconfont
            margin-right: 0;
            font-size: 1rem;
          &:hover
          &.active
            color: #007AFF;
            background: transparent;
  .selectBox
    position: absolute;
    top: 1px;
    z-index: 10;
    height: 42px;
    line-height 42px;
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
        font-size: 13px;
</style>
