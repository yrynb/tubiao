<template>
  <div class="pc-container" ref="container">
    <Loading v-if="isLoading" size="large" />
    <template v-else>
      <div
        class="operate"
        v-if="comp && (comp.publish === 1 || comp.publish === undefined)"
      >
        <a-button
          class="btn btn-resource"
          type="link"
          :title="this.comp.star ? '取消收藏' : '加入我的收藏'"
          :class="{ active: this.comp.star }"
          @click="saveOrDeleteResource"
        >
          <i
            class="iconfont"
            :class="
              shopLoadingFlag
                ? 'rotate conch-icon-loading'
                : 'conch-icon-favcomp-t-big'
            "
          ></i>
        </a-button>
        <downloadBtn :item="this.comp" :option="{ type: this.type }" />
        <pasteComponent :item="this.comp" />
        <a-button
          @click="newVersionHandle"
          style="margin-left:8px;"
          v-show="this.diagram.comp.version"
        >
          版本 {{ this.diagram.comp.version }}</a-button
        >
        <a-button type="primary" style="margin-left:10px;" @click="copyHandle"
          >复制组件ID</a-button
        >
        <span class="title">{{ this.diagram.comp.name }}</span>
      </div>
      <div class="preview-container" ref="previewContainer">
        <PreviewCompChild
          v-if="comp"
          ref="preview"
          class="comp-preview"
          :style="{ width: width + 'px' }"
        ></PreviewCompChild>
        <div class="line" v-move="moveHandle">
          <div class="line-content"></div>
        </div>
        <Code
          ref="editorCode"
          class="mdWrapper"
          :value="comp && comp.code"
          :readOnly="true"
          :style="{ width: codeWidth + 'px' }"
          v-if="!full"
        />
      </div>
      <CompProps v-if="openProps" :readOnly="true" />
      <NewVersion
        class="mdWrapper"
        ref="newVersion"
        @getData="getData"
        @jumpVersion="jumpVersion"
      />
    </template>
  </div>
</template>

<script>
import Code from '../components/base/Code'
import NewVersion from '@/modal/resource/NewVersion'
import { mapGetters, mapMutations } from 'vuex'
import {
  DOWNLOAD_COMPS,
  IS_PREVIEW,
  OPEN_PROPS,
  PREVIEW_FULL
} from 'store/mutation-types'
import { cancelStar, saveStar } from 'api/star'
import { getListVersion } from 'api/version'
import { requestHandle, copyString, debounce } from 'common/js/util'
import { downloadBtn, pasteComponent } from '../components/base/ListBtn'
import diagram from 'common/js/diagram'
import PreviewCompChild from '@/components/editor/right/PreviewCompChild'
import CompProps from '../components/editor/right/CompProps.vue'
import bus from 'common/js/eventBus'

export default {
  provide() {
    return {
      diagram
    }
  },
  data() {
    return {
      query: this.$router.currentRoute.query,
      isLoading: false,
      // 加入资源中心中
      shopLoadingFlag: false,
      // 下载中
      // downloadLoadingFlag: false,
      type: null,
      // 组件源id
      componentVersion: '',
      // 预览的版本id
      jumpVersionId: '',
      diagram,
      width: 0,
      codeWidth: 0,
      full: false,
      reset: null
    }
  },
  created() {
    this.setIsPreview(true)
  },
  async mounted() {
    const id = this.query.id
    await this.getData(id)
    this.type = this.query.type
    this.initScrollWidth()
    bus.$on(PREVIEW_FULL, d => {
      this.full = d
      this.initScrollWidth(d)
    })

    window.onresize = () => {
      this.initScrollWidth()
      this.$refs.preview.switchBluePrint()
    }

    this.reset = debounce(this.$refs.preview.resizeAll, 500)
  },
  computed: {
    comp() {
      return this.diagram.comp
    },
    ...mapGetters({
      userInfo: 'userInfo',
      openProps: 'openProps'
      // previewFull: 'previewFull'
    })
  },
  methods: {
    ...mapMutations({
      downloadComps: DOWNLOAD_COMPS,
      setOpenProps: OPEN_PROPS,
      setIsPreview: IS_PREVIEW
    }),
    initScrollWidth(d = false) {
      this.width = d
        ? this.$refs.previewContainer.clientWidth
        : this.$refs.previewContainer.clientWidth / 2
      this.codeWidth = this.$refs.previewContainer.clientWidth - this.width
    },
    moveHandle(type, e) {
      this.width = e.clientX
      this.codeWidth = this.$refs.previewContainer.clientWidth - this.width
      this.reset()
    },
    async getData(id) {
      await this.diagram.updateCompData(id)
      this.$refs.newVersion.show(false)
      this.isLoading = false
      this.$refs.editorCode.setValue(this.comp.code)
    },
    // 是否切换至改版本
    jumpVersion(select) {
      this.jumpVersionId = select
    },
    // 复制组件ID
    copyHandle() {
      if (this.jumpVersionId) {
        copyString('C' + this.jumpVersionId)
      } else {
        copyString('C' + this.query.id)
      }
    },
    // 是否加入收藏
    async saveOrDeleteResource() {
      if (this.shopLoadingFlag) {
        return
      }
      this.shopLoadingFlag = true

      const { opt, opt1 } =
        this.type === 'myComponent'
          ? {
              opt: {
                sType: 2,
                pid: this.comp.sid,
                sid: this.comp.publishId
              },
              opt1: { sid: this.comp.publishId }
            }
          : {
              opt: {
                sType: 2,
                pid: this.comp.sid,
                sid: this.comp.id
              },
              opt1: { sid: this.comp.id }
            }

      let d = await requestHandle(
        this.comp.star ? cancelStar(opt1) : saveStar(opt),
        '操作失败'
      )
      if (d) {
        this.shopLoadingFlag = false
        this.comp.star = !this.comp.star
        localStorage.setItem('starState', this.comp.id)
        this.$notification.success({
          message: '操作成功'
        })
      }
    },
    async newVersionHandle() {
      let d = await requestHandle(
        getListVersion({ query: { sid: this.diagram.comp.sid } })
      )

      if (d) {
        d.map(item => {
          item.name = '版本' + item.version
        })
        this.$refs.newVersion.optionArr = d
        this.$refs.newVersion.show(true)
      }
    }
  },
  components: {
    // MD,
    Code,
    downloadBtn,
    pasteComponent: pasteComponent('id'),
    NewVersion,
    PreviewCompChild,
    CompProps
  }
}
</script>

<style lang="stylus" scoped>
.pc-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #fff;
  font-size: 14px;
  .preview-container {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .comp-preview {
    }
    .line{
      position relative
      width 0px
      height 100%
      background-color: #000;
      cursor e-resize
      z-index 1
      .line-content{
        position absolute
        top 0
        right 0
        width 5px
        height 100%
      }
    }
    .mdWrapper{
      // height:  calc(50% - 25px) !important;
      // height:  calc(100% - 50px) !important;
    }
  }
  .operate{
    width: 100%;
    height: 50px;
    line-height: 50px;
    background: #000;
    position: relative;
    display: flex;
    align-items: center
    background-color: #2f3136;
    .title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%)
      font-size: 22px;
    }
    button {
      padding: 0 10px;
      .iconfont {
        color: white;
      }
      &.active,&:hover {
        border-color: transparent!important;
        .iconfont{
          color: #007AFF;
        }
      }
    }
  }
  // &:hover{
  //   .operate{
  //     display: block;
  //   }
  // }
  >div:not(.operate){
    height: calc(100% - 50px);
    // width: 50%;
    // display: inline-block;
    // float: left;
    // >div {
    //   height: 100%;
    // }
  }
}
</style>
