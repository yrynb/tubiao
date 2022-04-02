<template>
  <a-modal
    v-model="visible"
    :title="isCompList ? '模版列表' : '请将Echarts链接粘贴到下面的文本框内'"
    @ok="handleOk"
    @cancel="handleCancel"
    class="dark-modal"
    :width="isCompList ? '1000px' : '400px'"
  >
    <div
      :style="{ width: '100%', height: isCompList ? '75vh' : '100px' }"
      class="my-scroll"
    >
      <List
        v-if="isCompList"
        :list="compList"
        :options="[
          { name: 'copyCompId', slot: 'top-right' },
          { name: 'preview', slot: 'top-center', type: 'gallery' },
          { name: 'handleBtn', slot: 'top-center', option: option },
          { name: 'versionTag', slot: 'bottom-top-right' },
          { name: 'hot', slot: 'bottom-left' },
          { name: 'downloadBtn', slot: 'bottom-right', type: 'gallery' }
        ]"
        :noMore="true"
        :finish="true"
      />
      <a-input
        v-else
        placeholder="请输入链接"
        class="dark-input input-blue"
        v-model="value"
      />
    </div>
    <template slot="closeIcon">
      <i class="iconfont conch-icon-homepage-closeitem"></i>
    </template>
    <template slot="footer">
      <a-button
        key="submit"
        type="primary"
        @click="addNewComp"
        v-if="isCompList"
      >
        我要自己覆盖
      </a-button>
      <a-button key="submit" type="primary" @click="handleOk" v-else>
        确定
      </a-button>
    </template>
  </a-modal>
</template>
<script>
import getDefaultCode from 'common/js/diagram/getDefaultCode'
import getDefaultConfig from 'common/js/diagram/getDefaultConfig'
import {
  FORMAT_CODE,
  OPEN_COMP,
  OPEN_EDITOR_LOADING,
  CLOSE_EDITOR_LOADING
} from 'common/js/event-types'
import { getExternalData } from 'api/resource'
import { getCompList } from 'api/comp'
import { getByIdVersion } from 'api/version'
import { decodeURL, requestHandle } from 'common/js/util'
import List from '@/components/scenes/List'
import diagram from 'common/js/diagram'
export default {
  inject: ['diagram'],
  data() {
    return {
      visible: false,
      value: '',
      compList: null,
      option: {
        title: '以该组件为模板生成',
        icon: 'icon-scenectrol-play',
        handle: async item => {
          this.$bus.$emit(OPEN_EDITOR_LOADING)
          const d = await requestHandle(
            getByIdVersion(item.publishId),
            '组件请求错误'
          )
          if (d) {
            if (this.diagram.sp !== this.diagram.pageList[0]) {
              this.diagram.openPage(this.diagram.pageList[0])
            }
            const copyList = [
              'category',
              'code',
              'doc',
              'echartsId',
              'options',
              'type'
            ]
            copyList.forEach(k => {
              this.diagram.updateCompProps(k, d[k])
            })
            this.diagram.updateCompProps('config', JSON.parse(d.config))
            this.$bus.$emit(OPEN_COMP)
            this.handleCancel()
            this.$bus.$emit(FORMAT_CODE)
            this.diagram.reloadUI()
          }
          this.$bus.$emit(CLOSE_EDITOR_LOADING)
        }
      }
    }
  },
  computed: {
    isCompList() {
      return !!this.compList
    }
  },
  methods: {
    showModal() {
      this.visible = true
    },
    async handleOk(e) {
      if (!this.value) {
        this.$notification.info({
          message: '链接不可为空'
        })
        return
      }
      if (!/^(http|https)(.*?)c=(.*?)/.test(this.value)) {
        this.$notification.info({
          message: '不是可用链接'
        })
        return
      }
      this.searchListBykID()
    },
    async searchListBykID() {
      const { c } = decodeURL(this.value)
      if (c) {
        this.$bus.$emit(OPEN_EDITOR_LOADING)
        let d = await requestHandle(
          getCompList({
            query: {
              echartsId: c,
              publish: 1
            }
          })
        )
        this.$bus.$emit(CLOSE_EDITOR_LOADING)
        if (Array.isArray(d) && d.length) {
          this.confirmOk(
            '似乎有依据此链接生成的组件你要看看么？',
            null,
            () => {
              this.compList = d
            },
            () => {
              this.addNewComp()
            }
          )
        } else {
          this.addNewComp()
        }
      }
    },
    addNewComp() {
      this.confirmOk('该操作会覆盖组件，是否继续？', null, async () => {
        this.$bus.$emit(OPEN_EDITOR_LOADING)
        const { c } = decodeURL(this.value)
        let d = await requestHandle(
          getExternalData({
            type: 'external',
            name: 'echarts_gallery',
            params: {
              id: c
            }
          }),
          '链接请求错误'
        )
        if (d) {
          const { code, scripts } = d
          this.diagram.updateCompProps(
            'code',
            getDefaultCode(
              'fromEcharts',
              `(() => {
                var option;
                var instance = this.instance
              ${code.replace(/myChart/g, 'instance')};
              return option})()`,
              scripts
                .map(s => {
                  let name
                  if (s.endsWith('.js')) {
                    s = s.slice(0, s.length - 3)
                  }
                  if (s.includes('/')) {
                    const list = s.split('/')
                    name = list[list.length - 1]
                  }
                  return `import ${(name || s).replace(
                    /\.|-|@|=|\+|%|&|#/g,
                    ''
                  )} from '${s}'`
                })
                .concat(
                  /\$.|\$\((.*?)\)/.test(code)
                    ? ["import jquery from 'lib/jquery'"]
                    : []
                )
                .join('\n')
            )
          )
          // 重置config.js
          this.diagram.updateCompProps('options', getDefaultConfig())
          // 重置css
          this.diagram.updateCompProps('s', '')

          if (this.diagram.sp !== this.diagram.pageList[0]) {
            this.diagram.openPage(this.diagram.pageList[0])
          }
          this.diagram.updateCompProps('echartsId', c)
          this.$bus.$emit(OPEN_COMP)
          this.handleCancel()
          this.$bus.$emit(FORMAT_CODE)
          diagram.reloadUI()
        }
        this.$bus.$emit(CLOSE_EDITOR_LOADING)
      })
    },
    handleCancel() {
      this.compList = null
      this.visible = false
      this.$emit('close')
    }
  },
  components: { List }
}
</script>
