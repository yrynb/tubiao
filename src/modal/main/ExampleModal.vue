<template>
  <a-modal
    width="80%"
    v-model="visible"
    :title="modalData.name"
    :footer="null"
    @ok="hideModal"
  >
    <div class="example-content">
      <div>
        <Code v-model="code" v-if="code" :readOnly="true" ref="editor" />
      </div>
      <div ref="comp"></div>
    </div>
  </a-modal>
</template>

<script>
import diagram from 'common/js/diagram/previewComp'
import Code from '@/components/base/Code'

export default {
  provide: {
    diagram
  },
  data() {
    return {
      visible: false,
      modalData: {},
      diagram,
      code: '',
      id: ''
    }
  },
  mounted() {},
  methods: {
    showModal() {
      this.visible = true
      if (this.id === this.modalData.publishId) return
      this.id = this.modalData.publishId
      this.$nextTick(async () => {
        await this.diagram.useById(this.modalData.publishId, this.$refs.comp)
        if (this.code) {
          this.$refs.editor.setValue((this.code = this.diagram.comp.code))
        } else {
          this.code = this.diagram.comp.code
        }
        this.$nextTick(() => {
          this.$refs.editor.setTop(0)
          this.$refs.editor.setLeft(0)
        })
      })
    },
    hideModal() {
      this.visible = false
    }
  },
  components: {
    Code
  }
}
</script>
<style lang="stylus" scoped>
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
      padding:0;
.example-content
  display: flex;
  height: 70vh;
  >div
    width: 50%;
</style>
