<template>
  <div class="project-wrapper">
    <div class="filter">
      <a-select
        show-search
        style="width: 244px"
        option-label-prop="label"
        v-model="selected"
        :filter-option="filterOption"
        option-filter-prop="children"
      >
        <a-select-option
          v-for="item in optionArr"
          :key="item.id"
          :label="item.name"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
      <div class="btn-wrapper">
        <a-badge :count="listData.length">
          <a-dropdown
            placement="bottomCenter"
            :disabled="listData.length ? false : true"
          >
            <a-button class="btn badgeBtn" size="large">
              <i class="iconfont conch-icon-downbatch"></i>
              <span>下载资源包</span>
            </a-button>
            <a-menu
              slot="overlay"
              style="text-align:center;"
              v-show="listData.length ? true : false"
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
        </a-badge>

        <a-button
          class="deleteBtn"
          type="danger"
          size="large"
          ghost
          :disabled="optionArr.length ? false : true"
          @click="confirmHandle"
          >删除</a-button
        >
      </div>
    </div>
    <div class="main">
      <!-- <div class="notice" v-if="notice">
        有组件取消发布或删除，请谨慎使用
      </div> -->
      <List
        ref="content"
        :list="listData"
        :options="[
          { name: 'copyCompId', slot: 'top-right' },
          { name: 'preview', slot: 'top-center' },
          { name: 'deleteBtn', slot: 'top-center', type: 'myProject' },
          { name: 'versionTag', slot: 'bottom-top-right', type: 'myProject' },
          { name: 'hot', slot: 'bottom-left' },
          { name: 'author', slot: 'bottom-left' },
          { name: 'downloadBtn', slot: 'bottom-right' }
        ]"
        :finish="finish"
        :dataGetting="dataGetting"
        :noMore="true"
        noDataMsg="您还没有项目记录~赶快图表市场中挑选喜欢的组件，加入到资源库进行下载使用吧。"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { DOWNLOAD_COMPS } from 'store/mutation-types'
import { requestHandle } from 'common/js/util'
import { myProjects, deleteByIdProject } from 'api/project'
import mixinsScene from '@/components/scenes/mixinScene'

export default {
  mixins: [mixinsScene],
  data() {
    return {
      // 项目名称
      optionArr: [],
      // 选中项目
      selected: '',
      // publish:0 未发布 status:1 已删除
      // notice: false,
      inputVisible: false,
      inputValue: '',
      requestPromise: myProjects,
      type: 'projectList'
    }
  },
  watch: {
    selected(nv, ov) {
      if (nv !== ov) {
        this.getList(nv)
      }
    }
  },
  methods: {
    ...mapActions({
      downloadComps: DOWNLOAD_COMPS
    }),
    getOpt() {
      return {
        query: {
          type: 1,
          owner: this.userInfo.userName
        },
        supplement: {
          hiddenChildren: false
        }
      }
    },
    getList(name) {
      let item = this.optionArr.find(item => item.id === name)
      if (item) {
        this.listData = item.components
        const findItem = this.listData.find(
          item => item.publish === 0 || item.status === 1
        )
        if (findItem) {
          this.$notification.info({
            message: '有组件取消发布或删除，请谨慎使用'
          })
        }
      } else {
        this.listData = []
      }
    },
    // 删除项目
    confirmHandle() {
      this.$confirm({
        title: '删除',
        content: '您确定要删除此项目吗？',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        centered: true,
        onOk: () => {
          this.deleteProject()
        },
        onCancel() {}
      })
    },
    async deleteProject() {
      let d = await requestHandle(
        deleteByIdProject(this.selected),
        '删除项目失败'
      )
      if (d) {
        this.$notification.success({
          message: '删除项目成功'
        })

        this.optionArr.splice(
          this.optionArr.findIndex(item => item.id === this.selected),
          1
        )

        this.selected = this.optionArr.length > 0 ? this.optionArr[0].id : ''
      }
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      )
    },
    // 批量下载
    downloadClickEvent(bool) {
      if (this.listData.length === 0) {
        this.$notification.info({
          message: '请先选择需要下载的组件'
        })
      }
      this.downloadComps(this.listData.map(item => item.id))
      this.downloadComps({
        ids: this.listData.map(item => item.id),
        increase: bool
      })
    }
  }
}
</script>

<style lang="stylus" scoped>

.project-wrapper
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  .filter
    display: flex;
    padding-left: 10px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    .badgeBtn
      margin-left: 15px;
      font-size: 0.875rem;
      color: #666;
      border-color: #40a9ff;
      &:hover
        color: #fff;
        background: #007aff;
      .iconfont
        margin-right: 5px;
        font-size: 0.75rem;
    .deleteBtn
      margin-left: 15px;
      font-size: 0.875rem
  .notice
    margin-top: 10px;
    margin-left: 10px;
    line-height: 28px;
    font-size:12px;
    color: #ff4d4f;
    text-indent: 10px;
    border-radius: 5px;
    background: rgba(249,233,181,0.6);
  .main
    margin-top: 10px;
    height: 100%;
    overflow-y: scroll;
</style>
