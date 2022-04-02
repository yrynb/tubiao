<template>
  <div id="app">
    <template v-if="loading"><Loading size="large"/></template>
    <template v-else>
      <div class="page-body">
        <header-wrapper v-if="headerIsShow"></header-wrapper>
        <div class="body-wrapper">
          <router-view></router-view>
        </div>
      </div>
    </template>
    <input type="text" class="input-hidden" id="copyString" />
  </div>
</template>

<script>
import HeaderWrapper from './components/header/Header'
import { SET_USER_INFO, GET_FIRST_PROP } from 'store/mutation-types'
import { mapActions } from 'vuex'
import { getUserInfo } from 'api/user'
import ssoLogin from './common/js/axios/ssoLogin'

// localStorage.setItem('Authorization', 'sso Spray123456')

// 专门用于预览截图添加token
if (window.location.pathname.includes('/conch/previewSnapshot')) {
  const token = ssoLogin.GetRequest().token
  token && localStorage.setItem('Authorization', 'sso ' + token)
}
export default {
  provide: {
    ssoLogin
  },
  name: 'app',
  data() {
    return {
      // 加载中
      loading: true,
      // 头部是否显示
      headerIsShow: true,
      ssoLogin
    }
  },
  components: { HeaderWrapper },
  watch: {
    headerIsShow(nV, oV) {
      if (nV !== oV && nV === false) {
        this.headerIsShow = this.initHeader()
      }
    }
  },
  created() {
    this.init()
  },
  mounted() {
    this.headerIsShow = this.initHeader()
  },
  methods: {
    initHeader() {
      return ![
        '/editor',
        '/previewComp',
        '/cooperation',
        '/previewSnapshot'
      ].some(k => location.pathname.includes(k))
    },
    // 初始化
    async init() {
      await this.ssoLogin.checkToken()
      await this.getProps()
      await this.setUserInfo()
    },
    // 获取用户信息
    async setUserInfo() {
      let res = await getUserInfo()
      if (res.code === 200) {
        this.loading = false
        this.$store.commit(SET_USER_INFO, res.data)
      } else {
        this.$notification.error({
          message: '获取用户信息失败',
          description: res.message
        })
      }
    },
    ...mapActions({
      getProps: GET_FIRST_PROP
    })
  }
}
</script>

<style lang="stylus">
@import '~@/common/stylus/index';

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  .page-body {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0;
    background-color: #F4F5F7;

    .body-wrapper {
      position: relative;
      flex: 1;
      width: 100%;
      overflow: auto;
    }
  }

  .input-hidden {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: -1;
  }
}
</style>
