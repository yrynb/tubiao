<template>
  <div class="IN-container" @click.stop="close">
    <div class="IN-body" @click.stop v-show="showBody">
      <div class="line">
        <a-input
          placeholder="请输入搜索关键词"
          v-model="search"
          class="dark-input input-blue"
        />
      </div>
      <ul>
        <li
          v-for="item in showList"
          :key="item.icon"
          class="line"
          @click="handle(item)"
        >
          <i :class="'iconfont ' + item.icon"></i>
          <label for="">{{ item.title }}</label>
          <span>{{ item.message }}</span>
        </li>
        <li class="line more">
          <i class="iconfont conch-icon-moreimagination"></i>
          <span>更多好用功能陆续在这里开放</span>
        </li>
      </ul>
    </div>
    <AddCompFromEc ref="fromEchart" @close="close" />
    <AddCompFromECR ref="fromEchartURL" @close="close" />
    <ImageList ref="imageList" @close="close" />
    <ScriptList ref="scriptList" @close="close" />
    <CssList ref="cssList" @close="close" />
    <UtilLib ref="UtilLib" @close="close" />
    <FontList ref="fontList" @close="close" />
  </div>
</template>

<script>
import AddCompFromEc from 'modal/editor/AddCompFromEc'
import AddCompFromECR from 'modal/editor/AddCompFromECR'
import ImageList from './imagination/ImageList'
import ScriptList from './imagination/ScriptList'
import UtilLib from './imagination/UtilLib'
import FontList from './imagination/FontList'
import CssList from './imagination/CssList'

export default {
  inject: ['diagram'],
  data() {
    return {
      showBody: true,
      search: '',
      list: [
        {
          icon: 'conch-icon-echarts1',
          title: '导入Echarts',
          message: '从Echarts官网示例或Gallery中直接拷贝代码过来',
          key: 'fromEchart',
          needMessage: true
        },
        {
          icon: 'conch-url',
          title: '导入Echarts',
          message: '从URL导入Echarts',
          key: 'fromEchartURL',
          needMessage: true
        },
        {
          icon: 'conch-icon-attachment',
          title: '附件资源',
          message: '组件中用到的图片资源都在这',
          key: 'imageList'
        },
        {
          icon: 'conch-icon-importsource',
          title: '引入其它JS库资源',
          message: '可以在这里向组件中引入JQuery，lodash等外部资源',
          key: 'scriptList'
        },
        {
          icon: 'conch-CSS1',
          title: '引入其它CSS库资源',
          message: '可以在这里向组件中引入Element UI，Animate等外部资源',
          key: 'cssList'
        },
        {
          icon: 'conch-icon_test1',
          title: '引入工具方法',
          message: '可以在这里向组件中引入开源、节流等工具方法',
          key: 'UtilLib'
        },
        {
          icon: 'conch-font',
          title: '引入字体库资源',
          message: '可以在这里向组件中引入更多的免费字体资源',
          key: 'fontList'
        }
      ]
    }
  },
  computed: {
    showList() {
      return this.list.filter(item => item.title.includes(this.search))
    },
    comp() {
      return this.diagram.comp
    }
  },
  methods: {
    hasComp(description) {
      if (!this.comp) {
        this.$notification.info({
          message: '请至左侧组件列表打开一个已有组件',
          description
        })
        return true
      }
    },
    handle(item) {
      if (
        this.hasComp(item.needMessage ? '使用此项功能会覆盖原有组件代码' : '')
      ) {
        return
      }
      this.showBody = false
      this.$refs[item.key].showModal()
    },
    close() {
      this.showBody = true
      Object.values(this.$refs).forEach(k => {
        k.handleCancel && k.visible && k.handleCancel()
      })
      this.$emit('close')
    }
  },
  components: {
    AddCompFromEc,
    AddCompFromECR,
    ImageList,
    ScriptList,
    UtilLib,
    FontList,
    CssList
  }
}
</script>

<style lang="stylus" scoped>
.IN-container {
  width: 100%;
  height: 100%;
  position:absolute;
  top: 0;
  left: 0;
  background-color: rgba(0,0,0,0.3);
  z-index: 999;
  .IN-body {
    position: relative;
    top: 95px;
    margin: 0 auto;
    width: 600px;
    height: 400px;
    background: #252526;
    box-shadow: 2px 3px 6px 0px rgba(0, 0, 0, 0.7);
    .line {
      padding: 4px 15px;
      >input {
        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 0;
          border-top: 1px solid #999999;
          border-radius: 8px;
          transform: scale(0.5);
          transform-origin: 0 0;
        }
      }
    }
    ul {
      margin-top: 5px;
    }
    li {
      line-height: 21px;
      &:not(.more):hover {
        background: #062F4A;
        cursor: pointer;
      }
      i {
        font-size: 14px;
        margin-right: 10px;
      }
      label {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        margin-right: 5px;
      }
      span {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}
</style>
