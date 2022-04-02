<template>
  <div class="ed-code-header">
    <div class="ed-code-nav" ref="nav" @wheel="moveNav">
      <div class="ed-code-list" ref="list">
        <div
          class="ed-code-page"
          v-for="item in pageList"
          :key="item.name"
          :class="{ 'select-page': selectFile === item }"
          @click="openPage($event, item)"
        >
          <span class="name">
            {{ item.name }}
          </span>
          <i
            class="icon-close"
            v-if="codeAllowClose"
            :class="
              item.isHover
                ? 'iconfont conch-icon-closetab'
                : !item.isEdit
                ? 'iconfont conch-icon-closetab'
                : 'iconfont conch-yuandian'
            "
            @click.stop="closeTab(item)"
            @mouseenter="item.isHover = true"
            @mouseleave="item.isHover = false"
          ></i>
        </div>
      </div>
    </div>
    <IconBtn :list="btnList" className="icon-btn-editor-code" />
  </div>
</template>

<script>
import IconBtn from '@/components/base/IconBtn'
import {
  CLOSE_EDITOR_LOADING,
  OPEN_EDITOR_LOADING
} from 'common/js/event-types'
import configHandle from 'common/js/configHandle'
import { mapGetters, mapMutations } from 'vuex'
import { SET_PREVIEW_STATE } from 'store/mutation-types'
import bus from 'common/js/eventBus'

export default {
  inject: ['diagram'],
  components: {
    IconBtn
  },
  data() {
    return {
      isCooperation: this.$route.meta.isCooperation
    }
  },
  computed: {
    pageList() {
      return this.diagram.pageList.filter(item => !item.isClose)
    },
    selectFile() {
      return this.diagram.sp
    },
    userInfo() {
      return this.$store.state.app.userInfo
    },
    btnList() {
      return [
        {
          icon: 'conch-icon-runcode',
          title: '保存并运行',
          handle: this.runSave
        },
        {
          icon: 'conch-save1',
          title: '保存',
          handle: this.saveComp
        },
        this.isCooperation
          ? null
          : {
              icon: 'conch-icon-pubcomp',
              title: '发布',
              handle: this.pubComp
            },
        {
          icon: 'conch-icon-propicon',
          title: '信息',
          handle: this.openProp
        },
        this.userInfo.admin
          ? {
              icon: 'conch-task-filling',
              title: '发布为模板',
              color: this.comp.example === 1 ? '#1890ff' : '#fff',
              handle: this.pubExample
            }
          : null
      ].filter(b => !!b)
    },
    comp() {
      return this.diagram.comp
    },
    ...mapGetters({
      codeAllowClose: 'codeAllowClose'
    })
  },
  watch: {
    pageList() {
      this.initSelectClassName()
    }
  },
  methods: {
    ...mapMutations({
      setPreviewState: SET_PREVIEW_STATE
    }),
    openPage(e, page) {
      this.diagram.openPage(page)

      this.initSelectClassName()
    },
    initSelectClassName() {
      this.$nextTick(() => {
        const listChildren = this.$refs.list.children

        for (const child of listChildren) {
          if (child.classList.contains('select-page')) {
            const prevTarget = child.previousSibling
            prevTarget && prevTarget.classList.add('no-border')
          } else {
            child.classList.remove('no-border')
          }
        }
      })
    },
    openProp() {
      bus.$emit('OPEN_PROPS')
    },
    async pubComp() {
      this.$bus.$emit(OPEN_EDITOR_LOADING)
      await this.diagram.publishComp()
      this.$bus.$emit(CLOSE_EDITOR_LOADING)
    },
    async saveComp() {
      this.$bus.$emit(OPEN_EDITOR_LOADING)
      configHandle.examineConfigKey()
      const d = await this.diagram.saveComp(true)
      if (d) {
        this.$notification.success({
          message:
            '保存成功' +
            (this.isCooperation
              ? '，可以到 ThingJS UI-布局 页面中更新该组件看到效果'
              : '')
        })
      }
      this.$bus.$emit(CLOSE_EDITOR_LOADING)
    },
    // 运行并保存
    async runSave() {
      await this.openPreview()
      // await this.saveComp()
    },
    async pubExample() {
      this.$bus.$emit(OPEN_EDITOR_LOADING)
      await this.diagram.publishExample()
      this.$bus.$emit(CLOSE_EDITOR_LOADING)
    },
    async closeTab(item) {
      this.diagram.closePage(item)
      this.initSelectClassName()
    },
    resizeCode() {
      this.$emit('resizeCode')
    },
    openPreview() {
      this.$bus.$emit('renderDiagram')
      this.setPreviewState(true)
    },
    moveNav({ currentTarget, deltaY }) {
      currentTarget.scrollLeft += 30 * (deltaY > 0 ? 1 : -1)
    }
  }
}
</script>

<style lang="stylus" scoped>
.ed-code-header {
  display: flex;
  background-color: #242528;
  color: #fff;
  font-size: 12px;
  line-height: 34px;
  .ed-code-nav{
    display: flex;
    flex 1
    overflow: hidden;
    .ed-code-list {
      display: flex;
      .ed-code-page {
        flex-shrink: 0;
        display flex
        align-items center
        position: relative;
        text-align: center;
        width: 170px;
        background-color: #242528;
        border-top: 2px solid #242528;
        cursor: pointer;
        .name{
          width 100%
          text-align center
        }
        .icon-close {
          position: absolute;
          right 5px
          padding 0 9px
          font-size: 12px;
        }
        &:after{
          content ''
          position absolute
          top 20%
          bottom 20%
          right 0
          width 1px
          background-color rgba(255, 255, 255, 0.1)
        }
        &.select-page {
          background-color: #1B1C1F;
          border-top-color: #147FFA;
        }
        &.no-border:after,
        &.select-page:after,
        &:last-child:after{
          content none
        }
      }
    }
  }
  .icon-btn-editor-code{

  }
}
</style>
