<template>
  <a-modal
    v-model="visible"
    title="模板库"
    @ok="handleOk"
    @cancel="handleCancel"
    class="dark-modal"
    width="1000px"
  >
    <template slot="closeIcon">
      <i class="iconfont conch-icon-homepage-closeitem"></i>
    </template>
    <div
      style="width: 100%;height: 600px;"
      class="util-body my-scroll"
      v-if="list"
      @click.stop
    >
      <div>
        <div v-for="item in list" :key="item.id" @click="selectItem(item)">
          <a-checkbox v-model="item._checked"></a-checkbox>
          {{ item.name }}
        </div>
      </div>
      <div>
        <Code v-model="code" v-if="code" :readOnly="true" ref="editor" />
        <NoData v-else>点击名称查看模板</NoData>
      </div>
    </div>
    <template slot="footer">
      <a-button key="submit" type="primary" @click.stop="handleOk">
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
      list: null,
      select: null
    }
  },
  methods: {
    async showModal() {
      if (!this.list) {
        const d = await requestHandle(
          getPropList({
            query: {
              type: 'conchTemplate'
            }
          }),
          '模板库列表查询失败'
        )
        if (d) {
          d.forEach(item => (item._checked = false))
          this.list = d
        }
      }
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    },
    async handleOk() {
      if (!this.select) {
        this.$notification.info({
          message: '未选择组件模板，创建失败'
        })
        return
      }
      this.$emit('addCompByTemp', this.select)
      this.handleCancel()
    },
    selectItem(item) {
      if (this.select === item) return
      if (this.select) this.select._checked = false
      item._checked = true
      this.select = item
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
