<template>
  <div class="ed-list-container" @dragleave="dragLeave">
    <!-- <div class="ed-list-header">
      <a-input
        placeholder="请输入组件名称"
        class="dark-input no-border-input"
        v-model="searchValue"
      >
        <i slot="prefix" class="iconfont conch-icon-compsearch"></i>
      </a-input>
    </div> -->
    <div class="ed-list-body my-scroll">
      <div @click.stop>
        <IconBtn :list="btnList" className="icon-btn-editor-list" />
        <ul class="select-comp-temp" v-show="showCompTemp">
          <li v-for="item in compTemps" :key="item.key" @click="openFile(item)">
            {{ item.name }}
          </li>
        </ul>
      </div>
      <CompList :list="list" ref="CompList" />
    </div>
    <IconBtn :list="modeBtnList" className="icon-btn-editor-mode" />
    <CompTempList ref="CompTempList" @addCompByTemp="addCompByTemp" />
    <GroupControl ref="GroupControl" :groupList="groupList" />
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { SET_Z_MODE, SET_LEFT_FOLD, OPEN_PROPS } from 'store/mutation-types'
import IconBtn from '@/components/base/IconBtn'
import CompList from './CompList'
import CompTempList from '@/modal/editor/CompTempList'
import GroupControl from '@/modal/editor/GroupControl'

export default {
  inject: ['diagram'],
  data() {
    return {
      searchValue: '',
      showCompTemp: false,
      compTemps: [
        {
          name: '信息图',
          key: 'blank'
        },
        {
          name: '统计图',
          key: 'echarts'
        },
        {
          name: '模  板',
          key: 'template',
          handle() {
            this.$refs.CompTempList.showModal()
          }
        }
      ],
      modeBtnList: [
        {
          icon: 'conch-editor-zenmodebig',
          handle: () => {
            this.setLeftFold(true)
            this.setZMode(true)
          }
        },
        {
          icon: 'conch-editor-hiddenleft',
          handle: () => {
            this.setLeftFold(true)
          }
        }
      ],
      btnList: [
        {
          icon: 'conch-conch-delcomp',
          title: '删除',
          handle: () => {
            this.diagram.deleteComp()
          }
        },
        {
          icon: 'conch-conch-newcomp',
          title: '创建新组件',
          handle: this.addNewComp
        },
        {
          icon: 'conch-zuguanli',
          title: '分组管理',
          handle: () => {
            this.$refs.GroupControl.showModal()
          }
        }
      ]
    }
  },
  mounted() {
    window.addEventListener('click', () => {
      if (this.showCompTemp) this.showCompTemp = false
    })
  },
  computed: {
    comp() {
      return this.diagram.comp
    },
    list() {
      return this.diagram.groupList
    },
    groupList() {
      return this.diagram.groupList !== null
        ? this.diagram.groupList.filter(g => g.isGroup)
        : null
    }
  },
  methods: {
    dragLeave(e) {
      if (this.$refs.CompList.dragNode) {
        this.diagram.removeNodeFromGroup(this.$refs.CompList.dragNode.dataRef)
      }
    },
    addNewComp() {
      this.setOpenProps(false)
      this.showCompTemp = !this.showCompTemp
    },
    openFile({ key, handle }) {
      this.showCompTemp = false
      typeof handle === 'function'
        ? handle.call(this)
        : this.$refs.CompList.addFile(key)
    },
    addCompByTemp(temp) {
      this.$refs.CompList.addFile(temp.value, {
        code: temp.desc
      })
    },
    ...mapMutations({
      setZMode: SET_Z_MODE,
      setLeftFold: SET_LEFT_FOLD,
      setOpenProps: OPEN_PROPS
    })
  },
  components: {
    IconBtn,
    CompList,
    CompTempList,
    GroupControl
  }
}
</script>

<style lang="stylus" scoped>
.ed-list-container {
  background-color: #242528;
  position: relative;
  height: 100%;
  z-index: 99;
  .ed-list-header {
    height: 35px;
    padding: 2px 7px;
  }
  .ed-list-body {
    width: 100%;
    height: calc(100% - 35px);
    padding: 13px 0;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 200%;
      height: 0;
      border-top: 1px solid #000;
      border-radius: 8px;
      transform: scale(0.5);
      transform-origin: 0 0;
    }
    .select-comp-temp {
      position: absolute;
      top: 45px;
      right: -30px;
      z-index: 9999;
      width: 84px;
      background: rgba(30, 30, 30, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-align: center;
      padding: 5px 0;
      >li {
        border-bottom 1px solid rgba(255, 255, 255, 0.2);
        line-height: 30px;
        cursor: pointer;
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        &:last-child {
          border: 0
        }
      }
    }
  }
}
</style>
<style lang="stylus">
.icon-btn-editor-list {
  flex-direction: row-reverse;
  padding-right: 10px;
}
.icon-btn-editor-mode {
  position: absolute;
  bottom: 11px;
  right: 8px;
  >i {
    font-size: 16px;
  }
}
</style>
