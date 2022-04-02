<template>
  <a-modal
    v-model="visible"
    title="请将Echarts代码粘贴到下面的文本框内"
    @ok="handleOk"
    @cancel="handleCancel"
    class="dark-modal"
    width="600px"
  >
    <div style="width: 100%;height: 400px;">
      <Code v-model="code" />
    </div>
    <template slot="closeIcon">
      <i class="iconfont conch-icon-homepage-closeitem"></i>
    </template>
    <template slot="footer">
      <a-button key="submit" type="primary" @click="handleOk">
        确定
      </a-button>
    </template>
  </a-modal>
</template>
<script>
import Code from '@/components/base/Code'
import getDefaultCode from 'common/js/diagram/getDefaultCode'
import getDefaultConfig from 'common/js/diagram/getDefaultConfig'
import { FORMAT_CODE, OPEN_COMP } from 'common/js/event-types'
export default {
  inject: ['diagram'],
  data() {
    return {
      visible: false,
      code: ''
    }
  },
  methods: {
    showModal() {
      this.visible = true
    },
    async handleOk(e) {
      if (!this.code) {
        this.$notification.info({
          message: '代码不可为空'
        })
        return
      }
      this.confirmOk('该操作会覆盖组件，是否继续？', null, () => {
        this.addNewComp()
      })
    },
    addNewComp() {
      if (this.diagram.sp !== this.diagram.pageList[0]) {
        this.diagram.openPage(this.diagram.pageList[0])
      }
      // 重置代码
      this.diagram.updateCompProps(
        'code',
        getDefaultCode(
          'fromEcharts',
          `(() => {
            var option;
            var instance = this.instance
          ${this.code.replace(/myChart/g, 'instance')};
          return option})()`
        )
      )
      // 重置config.js
      this.diagram.updateCompProps('options', getDefaultConfig())
      // 重置css
      this.diagram.updateCompProps('s', '')

      if (/\$.|\$\((.*?)\)/.test(this.code)) {
        this.diagram.addCompScript('jquery')
      }
      this.$bus.$emit(OPEN_COMP)
      this.handleCancel()
      this.$bus.$emit(FORMAT_CODE)
      this.diagram.reloadUI()
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    }
  },
  components: {
    Code
  }
}
</script>
