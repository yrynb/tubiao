<template>
  <div style="overflow: auto;height: calc(100% - 20px)" ref="compListBody">
    <div v-show="isNewFile" class="add-new-file tree-item" @click.stop>
      <i class="iconfont conch-icon-rightarrow"></i>
      <i :class="'iconfont conch-icon-compfinder'"></i>
      <a-input
        placeholder="请输入组件名"
        class="dark-input input-blue"
        style="width: 300px"
        v-model="newFileValue"
        @pressEnter="addNewFileHandle"
        ref="newInput"
      />
    </div>
    <a-tree
      show-icon
      :load-data="onLoadData"
      :tree-data="list"
      :draggable="true"
      :expandedKeys.sync="expandedKeys"
      :selectedKeys="[]"
      class="dark-tree"
      :replace-fields="replaceFields"
      @dragenter="dragenterHandle"
      @drop="dropNodeHandle"
      @select="selectNode"
      @expand="expandNode"
    >
      <i slot="jsicon" class="iconfont conch-icon-jsicon"></i>
      <i slot="cssicon" class="iconfont conch-icon-cssicon"></i>
      <i slot="mdicon" class="iconfont conch-icon-mdicon"></i>
      <i slot="echarts" class="iconfont conch-icon-echarts"></i>
      <i slot="blank" class="iconfont conch-icon-blank"></i>
      <i slot="folder" class="iconfont conch-icon-compfinder"></i>
      <!-- 新添加 -->
      <i slot="media" class="iconfont conch-icon-echarts"></i>
      <i slot="tab" class="iconfont conch-icon-echarts"></i>
      <i slot="other" class="iconfont conch-icon-echarts"></i>
      <i slot="control" class="iconfont conch-icon-echarts"></i>
      <i slot="analysis" class="iconfont conch-icon-echarts"></i>
      <i slot="map" class="iconfont conch-icon-echarts"></i>
      <i slot="sucai" class="iconfont conch-icon-echarts"></i>
    </a-tree>
  </div>
</template>

<script>
import {
  OPEN_EDITOR_LOADING,
  CLOSE_EDITOR_LOADING
} from 'common/js/event-types'
import { mapMutations, mapGetters } from 'vuex'
import {
  SET_PREVIEW_BLUE_PRINT_STATE,
  SET_PREVIEW_STATE
} from 'store/mutation-types'
export default {
  inject: ['diagram'],
  props: {
    list: Array
  },
  data() {
    return {
      isNewFile: false,
      newFileType: '',
      newFileValue: '',
      putAway: false,
      temp: null,
      replaceFields: {
        title: 'name'
      }
    }
  },
  computed: {
    comp() {
      return this.diagram.comp
    },
    expandedKeys: {
      get() {
        return this.diagram.expandedKeys
      },
      set(v) {
        this.diagram.expandedKeys = v
      }
    },
    ...mapGetters({
      openProps: 'openProps'
    })
  },
  mounted() {
    window.addEventListener('click', () => {
      if (this.isNewFile) {
        if (this.newFileValue) {
          this.addNewFileHandle()
        } else {
          this.isNewFile = false
        }
      }
    })
    this.scrollTo()
  },
  methods: {
    ...mapMutations({
      setPreviewState: SET_PREVIEW_STATE,
      setPreviewBluePrintState: SET_PREVIEW_BLUE_PRINT_STATE
    }),
    onLoadData(node) {
      if (node.dataRef.isGroup) {
        return this.diagram.openListByGroup(node.dataRef.group)
      } else {
        return Promise.resolve(1)
      }
    },
    dragenterHandle({ event, node }) {
      this.dragNode = !node.dataRef.isGroup && node.dataRef.group ? node : null
    },
    dropNodeHandle({ dragNode, node }) {
      if (node.dataRef.isGroup && !dragNode.dataRef.isGroup) {
        this.diagram.moveNodeToGroup(dragNode.dataRef, node.dataRef)
      }
      if (!node.dataRef.group && dragNode.dataRef.group) {
        this.diagram.removeNodeFromGroup(dragNode.dataRef)
      }
    },
    expandNode(keys, { expanded, node }) {
      if (expanded) {
        this.selectNode(keys, { node })
      }
    },
    selectNode(keys, { node }) {
      if (node.dataRef.isGroup) {
        if (!this.diagram.expandedKeys.includes(node.dataRef.key)) {
          this.diagram.expandedKeys.push(node.dataRef.key)
        }
      } else if (node.dataRef.isPage) {
        this.diagram.openPage(node.dataRef)
      } else {
        this.openComp(node.dataRef)
      }
    },
    scrollTo(top) {
      setTimeout(() => {
        this.$nextTick(() => {
          const compListBody = this.$refs.compListBody
          if (!compListBody) return
          if (top === null || top === undefined) {
            const selectCompDom = compListBody.querySelector(
              '.ant-tree-treenode-switcher-open'
            )
            top = selectCompDom && selectCompDom.offsetTop - 40
          }
          if (top < 0 || !top) top = 0
          compListBody.scrollTo({
            top,
            left: 0,
            behavior: 'smooth'
          })
        })
      }, 100)
    },
    async saveOldComp() {
      if (this.comp) await this.diagram.saveComp()
      // this.setDiagramState(false)
    },
    // 打开组件
    async openComp(comp) {
      if (comp === this.comp) {
        this.putAway = !this.putAway
        return
      }
      this.putAway = false
      let self = this

      // 增加属性信息面板检查
      if (this.openProps) {
        this.$notification.warn({
          message: '请先保存组件属性信息！'
        })
        return
      }

      if (this.diagram.updatePropsList.length > 0) {
        this.$confirm({
          title: '当前组件已发生更改，是否保存？',
          cancelText: '不保存',
          okText: '保存',
          zIndex: 10000,
          async onOk() {
            await self.saveOldComp()
            self.changeComp(comp)
          },
          onCancel() {
            // 先走回退的方法
            self.diagram.fallbackComp()
            self.changeComp(comp)
          }
        })
      } else {
        self.changeComp(comp)
      }
    },

    async changeComp(comp) {
      this.setPreviewState(false)
      this.setPreviewBluePrintState(false)
      this.$bus.$emit(OPEN_EDITOR_LOADING)
      await this.diagram.getComp(comp.id)
      this.$bus.$emit(CLOSE_EDITOR_LOADING)
    },
    // 添加新的组件（显示输入框）
    addFile(k, temp) {
      if (temp) this.temp = temp
      this.isNewFile = true
      this.scrollTo(0)
      this.newFileType = k
      this.$nextTick(() => {
        this.$refs.newInput.focus()
      })
    },
    // 添加新组件的动作
    async addNewFileHandle() {
      const value = this.newFileValue
      this.newFileValue = ''
      if (value) {
        this.$bus.$emit(OPEN_EDITOR_LOADING)
        // 先将之前打开的保存
        await this.saveOldComp()
        await this.diagram.addNewComp(value, this.newFileType, this.temp)
        // 生成新的
        this.isNewFile = false
        this.scrollTo()
        this.$bus.$emit(CLOSE_EDITOR_LOADING)
      } else {
        this.$notification.error({
          message: '组件名称不可为空'
        })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.add-new-file {
  display: flex;
  i {
    margin-right: 10px;
  }
}
.tree-item {
  padding-left: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.tree-item, li {
  cursor: pointer;
  line-height: 35px;
}
.conch-icon-rightarrow {
  display: inline-block;
  color: #707070;
  transition: 0.5s;
}
.ed-tree {
  i {
    margin-right: 10px;
    font-size: 12px;
  }
  li {
    padding-left: 60px;
    &.select-page {
      background: rgba(217, 217, 217, 0.1);
    }
    &:hover {
      background-color: rgba(217,217,217,0.1);
    }
  }
  >ul {
    transition: 0.5s;
    transform-origin: 0 0;
    transform: scaleY(0);
    height: 0;
  }
  &.is-select {
    .conch-icon-rightarrow {
      transform: rotate(90deg);
    }
    >ul {
      transform: scaleY(1);
      height: auto;
    }
  }
  &:not(.is-select ):hover {
    background-color: rgba(217,217,217,0.1);
  }
}
</style>
