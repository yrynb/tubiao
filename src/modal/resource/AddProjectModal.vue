<template>
  <a-modal
    class="addProject-modal"
    v-model="visible"
    title="选择将组件添加至项目"
    @cancel="handleCancel"
    :dialogStyle="{ top: '200px' }"
    :maskClosable="!inputVisible"
    dialogClass="footer-center footer-default-btn"
  >
    <a-select
      show-search
      style="width: 244px"
      option-label-prop="label"
      placeholder="请选择您要添加至的项目"
      :filter-option="filterOption"
      option-filter-prop="children"
      v-model="selected"
    >
      <a-select-option v-for="i in optionArr" :key="i.id" :label="i.name">
        {{ i.name }}
      </a-select-option>
    </a-select>

    <template>
      <div class="tag-wrapper">
        <a-input
          v-if="inputVisible"
          ref="input"
          type="text"
          size="small"
          :style="{ width: '78px' }"
          v-model="inputValue"
          @blur="handleInputConfirm"
          @keyup.enter.native="$event.target.blur"
        />
        <a-tag
          v-else
          style="background: #fff; borderStyle: dashed;"
          @click="showInput"
        >
          <a-icon type="plus" class="iconfont" />
          添加新项目
        </a-tag>
      </div>
    </template>

    <template slot="footer">
      <a-button type="primary" @click="handleOk" :disabled="loading">
        <i
          class="iconfont"
          :class="loading ? 'rotate conch-icon-loading' : ''"
        ></i>
        {{ loading ? '' : '确认' }}
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import { saveProject, getProjectList } from 'api/project'
import { saveBatchFolder } from 'api/folder'
import { requestHandle } from 'common/js/util'

export default {
  data() {
    return {
      // 是否显示
      visible: false,
      // 确定中
      loading: false,
      // 选中项目
      selected: undefined,
      // 选中组件
      checkedList: [],
      // 项目
      optionArr: [],
      inputVisible: false,
      inputValue: ''
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.app.userInfo
    }
  },
  methods: {
    show() {
      this.visible = true
      if (this.checkedList.length === 0) {
        this.initData()
      }
    },
    // 初始化数据
    initData() {
      this.optionArr = []
      this.getData()
    },
    async getData() {
      let opt = {
        query: {
          type: 1,
          owner: this.userInfo.userName
        },
        supplement: {
          hiddenChildren: true
        }
      }
      let data = await requestHandle(getProjectList(opt), '获取项目列表失败')
      this.optionArr = data
    },
    async handleOk() {
      this.loading = true

      if (!this.selected) {
        this.$notification.info({ message: '请先选择需要添加的项目' })
        return this.handleCancel()
      }

      let opt = {
        pid: this.selected,
        sids: this.checkedList,
        sType: 2
      }
      let d = await requestHandle(saveBatchFolder(opt), '加入项目失败')

      if (d) {
        this.$notification.success({
          message: '加入项目成功'
        })
        this.handleCancel()
      }

      this.$emit('clearResourceArr')
    },
    handleCancel() {
      Object.assign(this, {
        selected: undefined,
        loading: false,
        visible: false,
        inputVisible: false,
        inputValue: ''
      })
    },
    // select框
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      )
    },
    // tag
    showInput() {
      this.inputVisible = true
      this.$nextTick(function() {
        this.$refs.input.focus()
      })
    },

    async handleInputConfirm() {
      const name = this.inputValue
      this.loading = true
      if (name && !this.optionArr.find(item => item.name === name)) {
        let d = await requestHandle(
          saveProject({ name, type: 1 }),
          '添加新项目失败'
        )
        if (d) {
          this.optionArr.push({ name, id: d })
          this.selected = d
        }
      } else {
        this.$notification.error({
          message: '项目名称不可为空，不可重复'
        })
      }
      setTimeout(() => {
        Object.assign(this, {
          inputVisible: false,
          inputValue: '',
          loading: false
        })
      }, 200)
    }
  }
}
</script>
<style lang="stylus">
.addProject-modal
  /deep/ .ant-modal-content
    .ant-modal-close
      width: 40px;
      text-align: center;
      margin-right: 0;
      .ant-modal-close-x
        width: 100%;
        height: 40px;
        line-height: 40px;
        font-size: 13px;
    .ant-modal-header
      height: 40px;
      line-height: 40px;
      border-bottom: none;
      .ant-modal-title
        color: #333;
        font-size: 14px;
    .ant-modal-body
      padding:10px 0 15px 20px;
      .ant-select-selection__rendered
        .ant-select-selection__placeholder
          color: #999
        .ant-select-selection__choice
          background: transparent;
          border: transparent;
          transition: none !important;
          color: #999;
      .tag-wrapper
        display: inline-block;
        margin-left: 20px;
        .ant-tag
          margin-bottom: 10px;
    .ant-modal-footer
      text-align: right;
      background: #fff;
      border: none;
      line-height: 30px;
      padding-bottom: 20px;
      button
        margin-right: 20px;
</style>
