<script>
import List from '@/components/scenes/List'
import Loading from '@/components/base/Loading'
import { getListSize, requestHandleByID, debounce } from 'common/js/util'
export default {
  data() {
    return {
      // 下拉是否结束
      finish: false,
      // 接口获取中
      dataGetting: false,
      // 页码
      page: 1,
      // 每页数量
      size: 5,
      listData: [],
      total: 0
    }
  },
  created() {
    const dataHandle = (type => {
      let fn
      switch (type) {
        case 'projectList':
          fn = d => {
            this.optionArr = []
            d.forEach((item, index) => {
              if (index === 0) this.selected = item.id
              this.optionArr.push(item)
            })

            this.finish = true
          }
          break
        case 'List':
          fn = d => {
            this.total = d.totalElements
            if (this.dataHandleSelf) d = this.dataHandleSelf(d)
            this.listData = d
          }
          break
        default:
          fn = d => {
            if (this.dataHandleSelf) d.content = this.dataHandleSelf(d.content)
            this.listData = this.listData.concat(d.content)
            this.total = d.totalElements
            if (this.listData.length >= d.totalElements) {
              this.finish = true
            }
          }
          break
      }

      return d => {
        if (d) {
          fn(d)
        } else {
          this.listData = []
        }
      }
    })(this.type)
    Object.assign(this, { dataHandle })
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.type || this.type === 'page') {
        this.size = getListSize(this.$refs.content.$el)
        const fn = debounce(() => {
          const size = getListSize(this.$refs.content.$el)
          if (size > this.size && size > this.listData.length) {
            this.size = size
            this.init()
          }
        }, 500)
        window.addEventListener('resize', fn)
        this.$once('hook:beforeDestroy', () => {
          window.removeEventListener('resize', fn)
        })
      }
      this.init()
    })
  },
  computed: {
    userInfo() {
      return this.$store.state.app.userInfo
    }
  },
  methods: {
    isCanNotLoadData() {
      if (this.dataGetting) {
        this.$notification.info({
          message: '数据正在加载请稍后'
        })
        return true
      }
    },
    // 初始化
    init() {
      this.initData()
      this.getData()
    },
    initData() {
      this.page = 1
      this.listData = []
      this.finish = false
    },
    async getData(opt) {
      if (this.isCanNotLoadData()) return
      this.dataGetting = true
      let d = await requestHandleByID(
        this.requestPromise(Object.assign(this.getOpt(), opt)),
        '获取列表失败'
      )
      if (d) {
        this.dataHandle(d)
      }
      this.dataGetting = false
    },
    loadScene() {
      if (this.isCanNotLoadData()) return
      this.page += 1
      this.getData()
    }
  },
  components: {
    List,
    Loading
  },
  destroyed() {
    if (Array.isArray(this.openConfirmOk) && this.openConfirmOk.length) {
      this.openConfirmOk.forEach(k => {
        this.$notification.close(k)
      })
    }
  }
}
</script>
