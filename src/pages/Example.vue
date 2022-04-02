<template>
  <div class="example">
    <!-- <div class="content my-scroll">
      <p class="title">官方图表</p>
      <a-anchor :affix="false" :getContainer="getContainer">
        <a-anchor-link
          v-for="item in propListChildren"
          :key="item.id"
          title=" "
          :href="'#' + item.value"
        />
      </a-anchor>
    </div> -->
    <!-- 左侧分类 -->
    <CascaderPanel
      :searchFilterData="searchFilterData"
      @panelFilter="panelFilter"
    ></CascaderPanel>
    <div class="main-wrapper my-scroll">
      <div class="main" ref="contentBody">
        <!-- 搜索框 -->
        <div class="search-filter">
          <i class="iconfont conch-icon-homepage-search"></i>
          <input
            type="text"
            class="input"
            placeholder="搜索"
            ref="searchRef"
            @keyup.enter="searchFilter"
          />
        </div>
        <Loading size="large" v-if="dataGetting"></Loading>
        <template>
          <div class="content-box">
            <div
              v-for="item in propListChildren"
              :key="item.id"
              :id="item.value"
            >
              <List
                ref="content"
                :list="exampleList[item.value] || []"
                :options="[
                  {
                    name: 'handleBtnExample',
                    slot: 'top-center',
                    option: option
                  },
                  { name: 'pasteComponentExample', slot: 'top-center' },
                  { name: 'copyCompIdExample', slot: 'top-center' },
                  { name: 'versionTagExample', slot: 'bottom-top-right' },
                  { name: 'publishTimeExample', slot: 'bottom-left' },
                  { name: 'starExample', slot: 'bottom-right' },
                  { name: 'downloadBtnExample', slot: 'bottom-right' }
                ]"
                :noMore="true"
                :dataGetting="dataGetting"
                :compConentBackground="`#1B1C1F`"
                :borderRadius="8"
                :titleColor="
                  `rgba(255,255,255,0.7);font-size:16px;line-height:20px;padding-left:10px;`
                "
                noDataMsg="暂无官方图表"
                @load="loadScene"
              />
            </div>
            <NoData
              v-if="
                !Object.values(exampleList).length ||
                  !Object.values(exampleList)[0].length
              "
              >敬请期待</NoData
            >
          </div>
          <ExampleModal ref="addProject" />
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import ExampleModal from '@/modal/main/ExampleModal'
import mixinsScene from '@/components/scenes/mixinScene'
import CascaderPanel from '@/components/cascader/Panel'
import { mapGetters } from 'vuex'
import { getCompListByPage, getCompListByAgg } from 'api/comp'
import { getPropList } from 'api/prop'
import { requestHandle, getListSize } from 'common/js/util'

let exampleList = []
export default {
  mixins: [mixinsScene],
  data() {
    return {
      isLoading: true,
      propListChildren: [],
      exampleList: {},
      currentIndex: 0,
      requestPromise: getCompListByPage,
      type: 'List',
      option: {
        title: '预览',
        icon: 'previewComp',
        handle: async item => {
          // this.$refs.addProject.modalData = item
          // this.$refs.addProject.showModal()
          let newUrl = this.$router.resolve({
            path: '/previewComp',
            query: {
              id: item.publishId,
              type: 'example'
            }
          })
          window.open(newUrl.href, '_blank')
        }
      },
      panelFilterData: {
        category: null,
        subCategory: null
      },
      searchFilterData: ''
    }
  },
  async created() {
    let d = await requestHandle(
      getPropList({
        query: { type: 'conchExample' }
      }),
      '获取列表失败'
    )
    if (d) {
      this.propListChildren = d

      if (exampleList.length) this.loadList()
    }
    this.initData()
    this.getData()
  },
  mounted() {
    this.isLoading = false
    let contentBody = this.getContainer()
    contentBody.addEventListener('scroll', () => {
      if (
        contentBody.clientHeight + Math.ceil(contentBody.scrollTop) >=
          contentBody.scrollHeight &&
        exampleList.length < this.total
      ) {
        this.loadScene()
      }
    })
  },
  computed: {
    ...mapGetters({
      propList: 'propList'
    })
  },
  methods: {
    // 搜索查询
    searchFilter(e) {
      const value = (this.searchFilterData = e.target.value)

      if (value) {
        this.requestPromise = getCompListByAgg
        exampleList = []
        this.initData()
        this.getData()
      } else {
        this.requestPromise = getCompListByPage
      }
    },
    // 分类查询
    panelFilter(data) {
      this.panelFilterData = data
      this.searchFilterData = ''
      this.requestPromise = getCompListByPage
      this.$refs.searchRef.value = ''

      exampleList = []
      this.initData()
      this.getData()
    },
    // 初始化
    init() {},
    getOpt() {
      const { category, subCategory } = this.panelFilterData
      return this.searchFilterData
        ? {
            page: this.page,
            size: getListSize(this.getContainer()),
            query: {
              category: null,
              example: 1,
              tag: '模板'
            },
            supplement: {
              types: null,
              queryValue: this.searchFilterData
            },
            sort: 'type,DESC&publishTime,DESC'
          }
        : {
            page: this.page,
            size: getListSize(this.getContainer()),
            query: {
              category: category && category.value,
              example: 1,
              tag: '模板'
            },
            supplement: {
              types: subCategory && subCategory.value && [subCategory.value]
            },
            sort: 'type,DESC&publishTime,DESC'
          }
    },
    dataHandleSelf(list) {
      exampleList = exampleList.concat(list.content)

      if (this.propListChildren.length) this.loadList()
      this.isLoading = false
      return list
    },
    loadList() {
      let obj = {}
      this.propListChildren.forEach(item => {
        obj[item.value] = exampleList
      })
      this.exampleList = obj
    },
    getContainer() {
      return this.$refs.contentBody
    }
  },
  destroyed() {
    exampleList = []
  },
  components: {
    ExampleModal,
    CascaderPanel
  }
}
</script>
<style lang="stylus" scoped>
.example
  display: flex;
  width: 100%;
  min-width: 1300px;
  height: 100%;
  background-color: #F4F5F7;
  .content
    flex-shrink: 0;
    flex-grow: 0;
    width: 180px;
    min-width: 200px;
    max-width: 300px;
    height: 100%;
    background-color: #252526;
    .title
      padding: 10px;
      color:#fff;
      font-size: 18px;
      font-weight:600;
      border-bottom 1px solid #777
    .ant-anchor-wrapper
      padding-left: 0px;
      max-height: calc(100vh - 108px)!important;
      background: #252526;
/deep/.ant-anchor-link
        padding: 0;
        a.ant-anchor-link-title
          padding: 20px;
          color: #fff;
        &:hover
          background: #1890ff;
      .ant-anchor-link-active
        background: #1890ff;
  .main-wrapper
    background-color: #17181A;
    width: 100%;
    height: 100%;
    background-color: #17181A
    .main
      display: flex;
      flex-direction: column;
      flex: 1;
      width: auto;
      height: 100%;
      padding: 10px;
      overflow-x: hidden;
      overflow-y: auto;
      .search-filter
        margin: 10px;
        padding-left: 8px;
        width: 200px;
        height: 32px;
        line-height: 32px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        color: #fff;
        font-size: 12px;
        .conch-icon-homepage-search
          opacity: 0.5
          font-size: 8px;
        .input
          width: 170px;
          border: none;
          text-indent: 2px
          background-color: transparent;
          font-family: PingFangSC-Regular, PingFang SC;
      .content-box
        height: 100%
</style>
