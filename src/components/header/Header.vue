<template>
  <header class="header">
    <a class="logo-link">
      <div class="logo">
        <img class="image" src="/conch/static/img/logo.png" alt="" />
      </div>
    </a>
    <div class="nav">
      <router-link to="/main" class="nav-item nav-link" active-class="active"
        >官方图表</router-link
      >
      <router-link
        v-if="!userInfo.guest"
        to="/gallery"
        class="nav-item nav-link"
        active-class="active"
      >
        图表市场
      </router-link>
      <a
        href="https://wiki.uino.com/book/61518cd1d7588a2ffde08415/book-cover.html"
        target="_blank"
        class="nav-item nav-link"
        active-class="active"
        >教程</a
      >
      <router-link
        to="/resource"
        class="nav-item nav-link"
        active-class="active"
        >我的资源
      </router-link>
      <a
        href="/conch/editor?type=myComponent"
        target="_blank"
        class="nav-item nav-link"
        >开发入口</a
      >
    </div>
    <div class="nav ml-auto">
      <div class="nav-item nav-user">
        <!-- <p class="user-title">北京优锘科技有限公司</p> -->
        <p class="user-sub-title">
          {{ userInfo.userTitle || userInfo.userName }}
        </p>
      </div>
      <div class="nav-item">
        <a-dropdown :trigger="['click']" placement="bottomCenter">
          <a class="ant-dropdown-link">
            <a-avatar icon="user" v-if="userInfo.guest" />
            <img class="avatar" v-if="!userInfo.guest" :src="userInfo.avatar" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item @click="logoff">退出登录</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
  </header>
</template>

<script>
import { logout } from 'api/sso'
export default {
  name: 'Header',
  data() {
    return {}
  },
  computed: {
    userInfo() {
      return this.$store.state.app.userInfo
    }
  },
  mounted() {
    if (this.userInfo.guest && this.$router.currentRoute.path === '/main') {
      this.$router.replace('/example')
    }
  },
  methods: {
    // 退出登录
    logoff() {
      this.$confirm({
        title: '退出登录?',
        content: '您确定要退出登录吗？',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          await logout()
          localStorage.removeItem('Authorization')
          localStorage.removeItem('token')
          window.location.reload()
        },
        onCancel() {}
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.header {
  display: flex;
  width: 100%;
  height: 60px;
  line-height: 60px;
  padding: 0 0 0 20px;
  background-color: #2F3136;
  .logo-link{
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 0px;
    margin-right: 30px;
    .logo{
      width: 60px;
      .image{
        display: block;
        width: 100%;
        height: 100%;
      }
    }
  }
  .nav{
    display: flex;
    height: 100%;
    .nav-item{
      padding: 0 10px;
      &.nav-link{
        position: relative;
        display: flex;
        align-items: center;
        padding: 0 20px;
        color: rgba(255,255,255,0.7);
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        letter-spacing: 0.54px;
        white-space: nowrap;
        &:before{
          content: '';
          position: absolute;
          left: 18px;
          right: 0;
          bottom: 0;
          width: 68%;
          height: 3px;
          background-color: transparent;
        }
        &:hover:before,
        &.active:before{
          background-color: #0B71E6;
        }
        &:hover,
        &.active{
          color: #0B71E6;
        }
      }
      &.nav-user{
        padding: 0 6px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        color: white;
        .user-title{
          line-height: 20px;
          text-align: center;
          font-size: 0.875rem;
          letter-spacing: 0.47px;
          white-space: nowrap;
        }
        .user-sub-title{
          text-align: right;
          letter-spacing: 0px;
          white-space: nowrap;
          height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(255,255,255,0.7);
          line-height: 20px;
        }
      }
      .ant-dropdown-link{
        display: block;
        height: 100%;
        padding: 0 20px 0 0;
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
      }
    }
  }
}
</style>
