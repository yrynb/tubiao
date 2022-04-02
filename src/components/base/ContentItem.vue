<template>
  <div class="component">
    <div class="component-body" :style="borderRadiusTop">
      <div class="component-image">
        <img
          :src="item.publishSnapshot || item.snapshot"
          alt=""
          :class="widthIsFill ? 'image-width' : 'image-height'"
          @load="imageLoad"
        />
      </div>
      <div class="tool-container">
        <div class="mask"></div>
        <div class="top-left">
          <slot name="top-left"></slot>
        </div>
        <div class="top-right">
          <slot name="top-right"></slot>
        </div>
        <!-- <div class="top-right-scale">
          <slot name="top-right-scale"></slot>
        </div> -->
        <div class="comp-top-center">
          <slot name="top-center"></slot>
        </div>
      </div>
    </div>
    <div class="component-content" :style="borderRadiusBottom">
      <div class="name-wrapper">
        <p class="title" :style="`color:${titleColor}`">{{ item.name }}</p>
        <div class="tag">
          <slot name="bottom-top-right" :item="item"></slot>
        </div>
      </div>
      <div class="content-wrapper tool-container">
        <div class="bottom-left">
          <slot name="bottom-left" :item="item"></slot>
        </div>
        <div class="bottom-right">
          <slot name="bottom-right" :item="item"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContentItem',
  data() {
    return {
      // 宽度是否填充
      widthIsFill: false,
      // 高度是否填充
      heightIsFill: false,
      // 鼠标悬浮
      hoverFlag: false,
      // 加入资源中心中
      shopLoadingFlag: false
    }
  },
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    },
    compConentBackground: {
      type: String,
      default: 'white'
    },
    borderRadius: {
      type: Number,
      default: 0
    },
    titleColor: {
      type: String,
      default: '#666'
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.app.userInfo
    },
    borderRadiusTop() {
      const s = `border-top-left-radius:${this.borderRadius}px;border-top-right-radius:${this.borderRadius}px;`
      return s
    },
    borderRadiusBottom() {
      const s = `border-bottom-left-radius:${this.borderRadius}px;border-bottom-right-radius:${this.borderRadius}px;background:${this.compConentBackground};`
      return s
    }
  },
  methods: {
    // 图片加载完成
    imageLoad(e) {
      const target = e.target

      if (target.width > target.height) {
        this.widthIsFill = true
      } else {
        this.heightIsFill = true
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.component {
  padding: 10px;
  width: 100%;
  min-width: 320px;
  border-radius: 10px;
  .component-body {
    position: relative;
    width: 100%;
    overflow: hidden;
    .component-image {
      padding-bottom: 56.25%;
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #212226;
      .image-width {
        width: 100%;
        height: auto;
        max-height: 100%;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%)
        display: block;
        transition: transform 0.25s linear;
      }
      .image-height {
        height: 100%;
        width: auto;
        max-width: 100%;
        position: absolute;
        left: 50%;
        top: 0;
        transform: translateX(-50%)
        display: block;
        transition: transform 0.25s linear;
      }
    }
    // 移入动画区
    &:hover {
      .mask, .top-right {
        opacity: 1
      }
      .comp-top-center {
        //animation slideInBottom 0.25s linear forwards;
        opacity: 1
      }
      .image-height {
        transform: scale(1.2) translateX(-50%)
	      transform-origin:50% 50%;
        -ms-transform-origin:50% 50%; /* IE 9 */
        -webkit-transform-origin:50% 50%; /* Safari and Chrome */
      }
      .image-width {
        transform: scale(1.2) translateY(-50%)
	      transform-origin:50% 50%;
        -ms-transform-origin:50% 50%; /* IE 9 */
        -webkit-transform-origin:50% 50%; /* Safari and Chrome */
      }
    }
  }
  .component-content {
    width: 100%;
    height: 70px;
    padding: 10px;
    position: relative;
    .name-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: absolute;
      width: 93%;
      z-index: 10;
      font-size: 14px;
      .title {
        width: 75%;
        height: 20px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .tag {
        >div {
          padding:0 8px;
          color: #40a9ff;
          font-size: 12px;
          border: 1px solid #40a9ff;
          border-radius: 5px;
        }
        .version-wrapper-example {
          padding: 0;
          color: rgba(255,255,255,0.3);
          font-size: 12px;
          border: 0px solid #40a9ff;
          border-radius: 0px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          line-height: 20px;
        }
      }
    }
    .slot-publish-time-example {
      padding-left: 10px;
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      line-height: 20px;
    }
  }
  .tool-container {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    >div {
      position: absolute;
    }
    .mask {
      height: 100%;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      transition: opacity 0.25s linear;
      opacity: 0;
    }
    // slot 定位区
    .top-left {
      top: 6px;
      left: 10px;
    }
    .top-right {
      top: 10px;
      right: 10px;
      transition: opacity 0.25s linear;
      opacity: 0;
    }
    .top-right-scale{
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      border: 25px solid transparent;
      border-top-color: #007aff;
      border-right-color: #007aff;
    }
    .comp-top-center {
      //top: -10%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      opacity: 0;
      transition: opacity 0.25s linear;
    }
    .bottom-left {
      bottom: 10px;
      left: 10px;
      display: flex;
    }
    .bottom-right {
      bottom: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
@keyframes slideInBottom {
  0% {
    top: 110%;
  }
  100% {
    top: 50%;
  }
}
</style>
