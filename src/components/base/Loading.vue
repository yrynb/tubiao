<script>
export default {
  name: 'Loading',
  props: {
    size: {
      type: String,
      default: ''
    }
  },
  render(h) {
    return (
      <div class="loading">
        <a-spin size={this.size} />
      </div>
    )
  }
}
</script>
<style lang="stylus" scoped>
.loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background-color: rgba(0,0,0,0.2)
  >div {
    position: absolute;
    top: 50%;
    left: 50%;
  }
}
</style>
