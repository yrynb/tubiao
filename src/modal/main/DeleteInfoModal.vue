<template>
  <a-modal
    class="delete-modal"
    v-model="visible"
    :visible="visible"
    title="删除"
    :centered="true"
    @cancel="handleCancel"
    dialogClass="footer-center footer-default-btn"
  >
    <a-icon
      type="question-circle"
      theme="twoTone"
      two-tone-color="#eb2f96"
      width="436px"
      style="font-size: 50px;"
    ></a-icon>
    <p class="message">{{ ModalText }}</p>
    <template slot="footer">
      <a-button key="back" @click="handleCancel">
        取消
      </a-button>
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
import { cancelStation } from 'api/station'

export default {
  data() {
    return {
      // 数据
      data: null,
      // 是否显示
      visible: false,
      // 回调
      callback: null,
      // 确定中
      loading: false,
      // 内容信息
      ModalText: '你确定要删除吗？'
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.app.userInfo
    }
  },
  methods: {
    showModal({ data, callback }) {
      this.data = data
      this.callback = callback
      this.visible = true
    },
    handleOk() {
      this.deleteFn()
    },
    handleCancel() {
      this.visible = false
      this.callback && this.callback(false)
    },
    deleteFn() {
      const data = {
        sid: this.data.id
      }
      this.loading = true
      cancelStation(data)
        .then(res => {
          if (res.code !== 200) {
            return
          }

          this.callback && this.callback(true)
        })
        .catch(() => {})
        .then(() => {
          this.callback && this.callback(false)
          this.loading = false
          this.visible = false
        })
    }
  }
}
</script>

<style lang="stylus" scoped>
.delete-modal
  /deep/ .ant-modal-content
    .ant-modal-close
      width: 40px;
      text-align: center;
      margin-right: 0;
      .ant-modal-close-x
        width: 100%;
        height: 40px;
        line-height: 40px;
    .ant-modal-header
      height: 40px;
      line-height: 40px;
    .ant-modal-body
      text-align: center;
      .message
        margin: 25px 0 20px 0;
</style>
