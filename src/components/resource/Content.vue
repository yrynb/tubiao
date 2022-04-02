<template>
  <div class="content-wrapper">
    <div class="nav-wrapper">
      <div class="nav-list">
        <router-link
          v-for="item in linkList"
          :key="item.goTo"
          :to="item.goTo"
          class="nav-link"
          active-class="active"
          >{{ item.name }}</router-link
        >
      </div>
    </div>
    <div class="message-wrapper">
      <p class="message" v-for="item in data" :key="item" v-html="item"></p>
    </div>
    <div class="photo">
      <div class="photo-image">
        <img src="/conch/static/img/icon-rawlogo.png" alt="" class="image" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Content',
  data() {
    return {
      linkList: [
        {
          name: '我的收藏',
          goTo: '/resource/repository'
        },
        {
          name: '我的项目',
          goTo: '/resource/project'
        },
        {
          name: '我的组件',
          goTo: '/resource/component'
        },
        {
          name: '下载历史',
          goTo: '/resource/history'
        }
      ]
    }
  },
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.content-wrapper
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #252526;
  overflow: hidden;
  .nav-wrapper
    float: right;
    padding-top: 20px;
    .nav-list
      .nav-link
        position: relative;
        display: block;
        line-height: 40px;
        padding: 0 20px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.875rem;
        letter-spacing: 0.47px;
        &:before
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 3px;
          height: 100%;
          background-color: transparent;
        &:hover
        &.active
          color: white;
          &:before
            background-color: #007AFF;
        & + .nav-link
          margin-top: 10px;
  .message-wrapper
    position: absolute;
    top: 35%;
    left: 50%;
    width: 80%;
    transform: translate(-50%, 0);
    z-index: 1;
    .message
      line-height: 25px;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.5);
      text-indent: 2rem;
      opacity: 0;
      animation: scale 0.25s linear 0.3s forwards;
  .photo
    position: absolute;
    top: 74%;
    left: 20%;
    user-select: none;
    animation slideInBottom 0.25s linear forwards;
    .photo-image
      width: 213px;
      height: 165px;
    .image
      display: block;
      width: 100%;
      height: 100%;
      transform-origin: 119px 76px;
      animation: rotate 60s linear infinite;

@keyframes slideInBottom
  0%
    transform: translateY(100vw);
  100%
    transform: translateY(0);

@keyframes scale
  0%
    opacity: 1;
    transform: scale(0);
  100%
    opacity: 1;
    transform: scale(1);

@keyframes rotate
  0%
    transform: rotate(0);
  100%
    transform: rotate(360deg);
</style>
