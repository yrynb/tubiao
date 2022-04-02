<template>
  <a-modal
    v-model="visible"
    title="工具库"
    @ok="handleOk"
    @cancel="handleCancel"
    class="dark-modal"
    width="1000px"
  >
    <template slot="closeIcon">
      <i class="iconfont conch-icon-homepage-closeitem"></i>
    </template>
    <div
      style="width: 100%;height: 70vh;"
      class="util-body my-scroll"
      v-if="list"
    >
      <div>
        <div v-for="item in list" :key="item.id" @click="selectItem(item)">
          <a-checkbox v-model="item._checked" @click.stop></a-checkbox>
          {{ item.name }}
        </div>
      </div>
      <div>
        <Code v-model="code" v-if="code" :readOnly="true" ref="editor" />
        <NoData v-else>点击方法查看具体实现</NoData>
      </div>
    </div>
    <template slot="footer">
      <a-button key="submit" type="primary" @click="handleOk">
        确定
      </a-button>
    </template>
  </a-modal>
</template>
<script>
import Code from '@/components/base/Code'
import { getPropList } from 'api/prop'
import { requestHandle } from 'common/js/util'
export default {
  inject: ['diagram'],
  data() {
    return {
      visible: false,
      value: '',
      code: '',
      list: null
    }
  },
  methods: {
    async showModal() {
      if (!this.list) {
        const d = await requestHandle(
          getPropList({
            query: {
              type: 'conchUtil'
            }
          }),
          '工具库列表查询失败'
        )
        if (d) {
          const utils = this.diagram.getUtilLib()
          d.forEach(item => {
            item._checked = !!utils.includes(item.value)
          })
          this.list = d
        }
      }
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    },
    async handleOk(e) {
      this.diagram.addUtilLib(this.list.filter(item => item._checked))
      this.handleCancel()
    },
    selectItem(item) {
      if (this.code) {
        this.$refs.editor.setValue((this.code = item.desc))
      } else {
        this.code = item.desc
      }
    }
  },
  components: {
    Code
  }
}
</script>

<style lang="stylus" scoped>
.util-body {
  display: flex;
  >div {
    height: 100%;
    color: #fff;
    &:nth-child(1) {
      width: 30%;
      border-right: 1px solid rgba(0,0,0,.7);
      overflow: auto;
      >div {
        width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        padding 5px;
        cursor: pointer;
        &:hover {
          background: rgba(255,255,255,.3);
        }
      }
    }
    &:nth-child(2) {
      width: 70%;
    }
  }
}
</style>
