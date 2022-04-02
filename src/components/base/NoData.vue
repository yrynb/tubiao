<template>
  <div class="no-data">
    <i class="iconfont conch-icon-smile"></i>
    <p class="message">
      <slot>无数据展示，赶紧去创建新组件</slot>
    </p>
  </div>
</template>

<script>
export default {
  name: 'NoData'
}
</script>

<style lang="stylus">
.no-data
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #999999;
  font-size: 15px;
  .iconfont
    font-size: 80px;
  .message
    width: 398px;
    text-align: center;
</style>
