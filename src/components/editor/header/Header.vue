<template>
  <header class="ed-header">
    <img src="/conch/static/img/logo.png" />
    <div>
      <span
        v-for="item in helpLink"
        :key="item.key"
        @click="openHelp(item.link)"
      >
        <i class="iconfont conch-icon-mdicon"></i>
        {{ item.name }}
      </span>
      <span @click="openImagination">
        <i class="iconfont conch-icon-imagination"></i>
        Imagination
      </span>
      <span @click="openJC">
        <i class="iconfont conch-icon-help"></i>
        教程
      </span>
    </div>
  </header>
</template>

<script>
const helpLinks = [
  {
    icon: 'jsicon',
    name: '图表开发',
    key: 'code',
    link:
      'https://wiki.uino.com/book/61518cd1d7588a2ffde08415/6164074ac298200d057882ee.html'
  },
  {
    icon: 'jsicon',
    name: '属性面板',
    key: 'options',
    link:
      'https://wiki.uino.com/book/61a58e053f6f5d728d74a61c/61a5c0f4e07ea3022970a7fa.html'
  },
  {
    icon: 'mdicon',
    name: '常见问题',
    key: 'doc',
    link:
      'https://wiki.uino.com/book/61518cd1d7588a2ffde08415/6166d5e3c6a165649450dec3.html'
  }
]
export default {
  inject: ['diagram'],
  data() {
    return {
      helpLink: helpLinks
    }
  },
  computed: {
    comp() {
      return this.diagram.comp || {}
    }
  },
  methods: {
    openHelp(link) {
      window.open(link)
    },
    openJC() {
      window.open(
        'https://wiki.uino.com/book/61518cd1d7588a2ffde08415/book-cover.html'
      )
    },
    openImagination() {
      this.$emit('openImagination')
    }
  }
}
</script>

<style lang="stylus" scoped>
.ed-header {
  width: 100%;
  background-color: #282A2E;
  position: relative;
  i {
    font-size: 14px;
  }
  >img, >div {
    position absolute;
    top: 20px;
  }
  >img {
    height: 24px;
    margin-left: 6px;
    left: 16px;
  }
  >div {
    right: 16px;
    >span {
      margin-left: 10px;
      cursor: pointer;
      >i {
        margin-right: 2px;
      }
    }
  }
}
</style>
