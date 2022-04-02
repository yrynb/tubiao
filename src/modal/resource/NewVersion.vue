<template>
  <a-modal
    class="addProject-modal my-scroll"
    v-model="visible"
    title="选择组件的版本"
    dialogClass="footer-center footer-default-btn"
    :dialogStyle="{ top: '200px' }"
    :maskClosable="!inputVisible"
    :footer="null"
    :width="760"
  >
    <ul>
      <li v-for="i in optionArr" :key="i.id">
        <p>{{ i.name }}</p>
        <div class="operate">
          <p class="viewBtn" @click="previewHandle(i.id)">
            预览
          </p>
          <!-- <p class="jumpBtn" @click="handleOk(i.id, '_self')">
            切换至该版本
          </p> -->
        </div>
      </li>
    </ul>
  </a-modal>
</template>
<script>
export default {
  data() {
    return {
      // 是否显示
      visible: false,
      inputVisible: false,
      optionArr: []
    }
  },
  mounted() {},
  methods: {
    show(bool) {
      this.visible = bool
    },
    handleOk(selectId, target) {
      if (!selectId) {
        this.$notification.info({ message: '请先选择需要更新到的版本' })
        return this.handleCancel()
      }
      let newUrl = this.$router.resolve({
        path: '/previewComp',
        query: {
          id: selectId
        }
      })
      window.open(newUrl.href, target)
    },
    previewHandle(selectId) {
      this.$emit('getData', selectId)
      this.$emit('jumpVersion', selectId)
    }
  }
}
</script>
<style lang="stylus" scoped>
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
      padding:10px 24px;
ul
  margin-bottom: 18px;
  width: 100%;
  height: 250px;
  overflow: auto;
  li
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 10px;
    width: 100%;
    font-size: 14px;
    border-bottom: 1px solid #ccc;
    .operate
      display: flex;
      >p
        padding: 0 9px;
        color: #fff;
        background: #1890ff;
        border-radius: 5px;
        cursor: pointer;
        display:none;
        &:nth-child(1)
          margin-right:10px;
        &:hover
          background: #007aff;
    &:hover
      background: #efefef;
      .operate
        >p
          display: block;
</style>
