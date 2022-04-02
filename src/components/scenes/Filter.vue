<template>
  <div class="filterBox">
    <div class="search-wrapper">
      <!-- <a-button
        class="btn"
        type="primary"
        size="large"
        @click="createNewProject"
      >
        <i class="iconfont conch-icon-homepage-addscene"></i>
        <span>创建新组件</span>
      </a-button> -->
    </div>
    <transition
      name="fade-down"
      @enter="filterEnter"
      @afterEnter="filterAfterEnter"
      @leave="filterLeave"
      @after-leave="filterAfterLeave"
    >
      <div class="filter-wrapper" v-if="value">
        <div class="filter-inner">
          <div class="filter-item">
            <span class="filter-label">分类</span>
            <div class="filter-content">
              <div class="filter-list">
                <a-button
                  class="btn"
                  type="primary"
                  size="small"
                  v-for="(category, index) in categoryList"
                  :key="index"
                  :class="{ active: category._active }"
                  @click="categoryClickEvent(category)"
                  >{{ category.name }}</a-button
                >
              </div>
              <div class="filter-list">
                <template v-if="categoryActiveItem">
                  <button
                    class="btn ant-btn-primary"
                    v-for="(item, i) in categoryActiveItem.children"
                    :key="i"
                    :class="{ active: item._active }"
                    @click.stop="categorySecClickEvent(item)"
                  >
                    {{ item.name }}
                  </button>
                </template>
              </div>
            </div>
          </div>
          <a-button
            class="close ml-auto btn"
            type="link"
            size="large"
            v-if="closetabIsShow"
            @click="$emit('input', false)"
          >
            <i class="iconfont conch-icon-closetab"></i>
          </a-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'FilterWrapper',
  props: {
    // 组件使用页面
    use: {
      type: String,
      immediate: true
    },
    // 过滤是否显示
    value: {
      type: Boolean,
      default: true
    },
    // 分类是否可关闭
    closetabIsShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 分类选中
      categoryActiveItem: null
    }
  },
  created() {
    this.categoryActiveItem = this.categoryList[0]
  },
  computed: {
    // 类别列表
    categoryList() {
      const list = this.$store.state.app.propList

      list.forEach((child, index) => {
        if (!index) {
          child._active = true
          return
        }
        child._active = false

        child.children.forEach(item => {
          item._active = false
        })
      })

      return this.$store.state.app.propList
    }
  },
  methods: {
    // 分类点击事件
    categoryClickEvent(category) {
      category._active = true

      this.categoryList.forEach(item => {
        if (item !== category) {
          item.children &&
            item.children.forEach(i => {
              i._active = false
            })
          item._active = false
        }
      })
      this.$emit('filterChecked', (this.categoryActiveItem = category))
    },
    // 二级分类点击事件
    categorySecClickEvent(categorySubValue) {
      categorySubValue._active = !categorySubValue._active
      this.$emit('filterChecked', this.categoryActiveItem)
    },
    filterHandle() {
      return {
        category: this.categoryActiveItem.value,
        categorySub: this.categoryActiveItem.children
          .filter(item => item._active)
          .map(item => item.value)
      }
    },
    // 创建新组件
    createNewProject() {
      let newUrl = this.$router.resolve({
        path: '/editor'
      })
      window.open(newUrl.href, '_blank')
    },
    // 过滤进入
    filterEnter(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    // 过滤进入后
    filterAfterEnter(el) {
      el.style.height = ''
    },
    // 过滤离开
    filterLeave(el) {
      el.style.height = el.scrollHeight + 'px'
      // 强制浏览器重绘
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight
      el.style.height = 0
      this.categoryList.forEach((item, index) => {
        if (item._active) {
          item.children.filter(itemChildren => (itemChildren._active = false))
        }
        index === 0 ? (item._active = true) : (item._active = false)
      })
      this.$emit(
        'filterChecked',
        (this.categoryActiveItem = this.categoryList[0])
      )
    },
    // 过滤离开后
    filterAfterLeave(el) {
      el.style.height = ''
    }
  }
}
</script>

<style lang="stylus" scoped>
.filterBox
  flex-grow: 0;
  flex-shrink: 0;
  width: 100%;
  // padding: 0 10px 10px 10px;

  .filter-wrapper
    width: 100%;
    overflow: hidden;
    margin-bottom: 10px;
    .filter-inner
      display: flex;
      width: 100%;
      padding: 15px 20px 15px;
      margin-top: 10px;
      background-color: white;
      box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.05);
      .filter-item
        display: flex;
        .filter-label
          flex-shrink: 0;
          flex-grow: 0;
          width: 60px;
          line-height: 20px;
          color: #333333;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.4px;
        .filter-content
          height: 100%;
          .filter-list
            display: flex;
            flex-wrap:wrap;
            line-height: 20px;
            .btn
              display: block;
              height: 20px;
              line-height: 18px;
              padding: 0 7px;
              margin-right: 10px;
              color: #666666;
              font-size: 0.75rem;
              letter-spacing: 0.41px;
              background-color: transparent;
              border: 1px solid #D9D9D9;
              border-radius: 0;
              box-shadow: none;
              text-shadow: none;
              cursor: pointer;
              white-space: nowrap;
              & + .btn
                margin-right: 10px;
                margin-bottom: 10px;
              &:hover
              &.active
                color: white;
                background-color: #007AFF;
                border-color: #007AFF;
            & + .filter-list
              margin-top: 10px;
      .close
        height: 50px;
        color: #808080;
        &:hover
        &.active
          color: #007AFF;
          background-color: #fff;
          border-color: #fff;
  .fade-down-enter-active, .fade-down-leave-active
    transition: height 0.25s linear;
  .fade-down-enter, .fade-down-leave-to
    height: 0;
</style>
