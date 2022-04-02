<template>
  <div class="cascader">
    <!-- 一级分类 -->
    <div class="scrollbar">
      <ul class="box-first">
        <li
          class="menu"
          v-for="(category, index) in categoryList"
          :key="index"
          :class="{
            active: selected && selected.value === category.value,
            'active-bg': isSubExpand && selected.value === category.value
          }"
          @click="categoryClick(category)"
        >
          <i
            :class="
              category.value
                ? 'iconfont conch-' + category.value
                : 'iconfont conch-all'
            "
          ></i>
          <p class="text">
            {{ category.name }}
          </p>
        </li>
      </ul>
    </div>
    <!-- 二级分类 -->
    <div class="scrollbar sub" v-show="isSubExpand">
      <ul class="box-second" v-if="selected">
        <li
          class="menu"
          v-for="(item, i) in selected.children"
          :key="i"
          :class="{ active: subSelected && subSelected.value === item.value }"
          @click="subCategoryClick(item)"
        >
          <span class="sub-text">{{ item.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    searchFilterData: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      categoryList: [],
      selected: null,
      subSelected: null,
      isSubExpand: false
    }
  },
  methods: {
    // 分类点击事件
    categoryClick(category) {
      if (!category.children || !category.children.length) {
        this.isSubExpand = false
      } else if (this.selected && category.value !== this.selected.value) {
        this.isSubExpand = true
      } else {
        this.isSubExpand = !this.isSubExpand
      }

      this.selected = category
      this.subSelected = this.isSubExpand ? category.children[0] : null
      this.cascader = true
      this.$emit('panelFilter', { category })
    },
    // 二级分类点击事件
    subCategoryClick(subCategory) {
      this.subSelected = subCategory

      this.$emit('panelFilter', { category: this.selected, subCategory })
    }
  },
  created() {
    this.categoryList = [
      {
        name: '全部',
        value: null
      },
      // {
      //   name: '分析',
      //   value: 'analysis'
      // },
      {
        name: '图表',
        value: 'echarts',
        children: [
          {
            name: '全部',
            value: null
          },
          {
            name: '柱状图',
            value: 'Bar',
            type: 'echarts'
          },
          {
            name: '条形图',
            value: 'BarHori',
            type: 'echarts'
          },
          {
            name: '折线图',
            value: 'Line',
            type: 'echarts'
          },
          {
            name: '区域图',
            value: 'quyutu',
            type: 'echarts'
          },
          {
            name: '饼环图',
            value: 'Pie',
            type: 'echarts'
          },
          {
            name: '散点图',
            value: 'Scatter',
            type: 'echarts'
          },
          {
            name: '雷达图',
            value: 'Radar',
            type: 'echarts'
          },
          {
            name: '关系图',
            value: 'Graph',
            type: 'echarts'
          },
          {
            name: '其他',
            value: 'echarts-other',
            type: 'echarts'
          }
        ]
      },
      {
        name: '地图',
        value: 'map'
      },
      {
        name: '信息',
        value: 'blank'
      },
      {
        name: '表格',
        value: 'tab'
      },
      {
        name: '控件',
        value: 'control',
        children: [
          {
            name: '全部',
            value: null
          },
          {
            name: '按钮类',
            value: 'button',
            type: 'control'
          },
          {
            name: '选择类',
            value: 'select',
            type: 'control'
          },
          {
            name: '输入类',
            value: 'input',
            type: 'control'
          },
          {
            name: '数据类',
            value: 'data',
            type: 'control'
          },
          {
            name: '导航类',
            value: 'navigation',
            type: 'control'
          }
        ]
      },
      {
        name: '媒体',
        value: 'media'
      },
      {
        name: '素材',
        value: 'sucai',
        children: [
          {
            name: '全部',
            value: null
          },
          {
            name: '视频',
            value: 'shipin',
            type: 'sucai'
          },
          {
            name: '图标',
            value: 'tubiao',
            type: 'sucai'
          },
          {
            name: '点缀',
            value: 'dianzhui',
            type: 'sucai'
          },
          {
            name: '背景图',
            value: 'beijingtu',
            type: 'sucai'
          },
          {
            name: '背景框',
            value: 'beijingkuang',
            type: 'sucai'
          },
          {
            name: '装饰条',
            value: 'zhuangshitiao',
            type: 'sucai'
          },
          {
            name: '插画',
            value: 'chahua',
            type: 'sucai'
          }
        ]
      },
      {
        name: '其他',
        value: 'other'
      }
    ]
    this.selected = this.categoryList[0]
  },
  watch: {
    searchFilterData(cur) {
      if (!cur && this.cascader) {
        return
      }
      this.cascader = false
      this.selected = this.categoryList[0]
      // this.selected = cur ? null : this.categoryList[0]
      this.subSelected = null
      this.isSubExpand = false
      !cur && this.$emit('panelFilter', { category: null, subCategory: null })
    },
    isSubExpand(cur) {
      if (!cur) {
        this.subSelected = null
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.cascader
  display: flex
  height: 100%
  background-color: #292B30
  font-family: PingFangSC-Regular, PingFang SC
  .scrollbar
    height: 100%
    overflow-x: hidden
    overflow-y: scroll
    &.sub
      background-color: #212227
    &::-webkit-scrollbar {
      display: none
    }
  .box-first
    width: 50px
  .menu
    height: 70px
    padding: 15px 0
    color: #FFF
    text-align: center
    font-size: 12px
    cursor: pointer
    .text
      opacity: 0.7
    .sub-text
      opacity: 0.9
    &:hover
      color: #0B71E6
      background-color: #212227
    &.active
      color: #0B71E6
      .text,
      .sub-text
        opacity: 1
    &.active-bg
      background-color: #212227
  .img
    width: 18px
    height: 18px
    margin-bottom: 2px
  .box-second
    flex: 1
    width: 76px
    .menu
      height: 50px
      &:hover, &.active
        color: #0B71E6
        background: #17181A
.iconfont
  font-size: 16px
</style>
