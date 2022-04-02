<template>
  <a-modal
    class="create-modal"
    v-model="visible"
    :visible="visible"
    title="创建组件"
    :centered="true"
    dialogClass="footer-center footer-default-btn"
  >
    <a-icon
      type="question-circle"
      theme="twoTone"
      two-tone-color="#eb2f96"
      width="436px"
      style="font-size: 50px; margin-bottom: 15px;"
    ></a-icon>
    <a-form-model
      ref="ruleForm"
      :model="form"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-model-item label="分类 ">
        <a-select v-model="form.classify">
          <a-select-option value="blank">
            自定义
          </a-select-option>
          <a-select-option value="Echarts">
            Echarts
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>

    <template slot="footer">
      <a-button key="back" @click="handleCancel">
        取消
      </a-button>
      <a-button type="primary" @click="handleOk">
        确认
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      visible: false,
      form: {
        classify: 'blank'
      }
    }
  },
  computed: {
    ...mapGetters({
      propList: 'propList'
    })
  },
  methods: {
    showModal(data) {
      this.visible = !!data
    },
    handleOk() {
      this.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let newUrl = this.$router.resolve({
            path: '/conch/editor',
            query: { classify: this.form.classify }
          })
          window.open(newUrl.href, '_blank')
        }
      })
      this.visible = false
    },
    handleCancel() {
      this.$refs.ruleForm.resetFields()
      this.visible = false
    }
  }
}
</script>

<style lang="stylus" scoped>
.create-modal
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
      i
        margin: 0 auto
    .ant-checkbox-wrapper
      position: absolute
</style>
