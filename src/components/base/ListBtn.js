import ContentItem from './ContentItem.vue'
import Vue from 'vue'
import router from '@/router'
import Vuex from '@/store'
import eventBus from '../../common/js/eventBus'
import { notification, Modal } from 'ant-design-vue'
import { DOWNLOAD_COMPS, RESOURCE_ARR } from 'store/mutation-types'
import { cancelStar, saveStar } from 'api/star'
import { cancelFolder, saveFolder } from 'api/folder'
import { copyCompById, deleteCompById } from 'api/comp'
import { requestHandle, copyString, formatTime } from 'common/js/util'
import 'common/stylus/scene.styl'

// 最后下载时间
const publishTimeExample = {
  functional: true,
  props: { item: Object },
  render(h, { props }) {
    const time = props.item.publishTime || props.item.modifyTime
    return <div class="slot-publish-time-example">{formatTime(time)} </div>
  }
}
// 版本
const versionTagExample = {
  functional: true,
  props: { item: Object, pid: String, option: Object },
  render(h, { props }) {
    if (props.item.version > 0) {
      return props.item.version < props.item.publishVersion &&
        props.option.type !== 'myHistory' ? (
        <div
          class="version-wrapper version-wrapper-example"
          style="cursor:pointer;"
          onClick={e => {
            // eventBus.$emit('OPEN_NEWVERSION')
            Vue.confirmOk('确定要更新该组件吗', null, async () => {
              let apiFn =
                props.option.type === 'myProject' ? saveFolder : saveStar
              let d = await requestHandle(
                apiFn({
                  id: props.item.operationId,
                  sid: props.item.publishId,
                  pid: ''
                }),
                '操作失败'
              )
              if (d) {
                notification.success({
                  message: '组件更新成功'
                })
                props.item.version = props.item.publishVersion
              }
            })
          }}
        >
          可更新
        </div>
      ) : (
        <div
          class="version-wrapper version-wrapper-example"
          style="cursor:auto;"
        >
          V
          {props.item.version > 100
            ? props.item.version
            : ' ' + props.item.version}
        </div>
      )
    } else {
      return <div class="version-wrapper version-wrapper-example">未发布</div>
    }
  }
}
// 预览
const previewExample = {
  functional: true,
  props: { item: Object, option: Object },
  render(h, { props }) {
    return (
      <div class="tool-inner">
        <a-button
          class="tool-item tool-link"
          type="link"
          size="small"
          title="预览"
          onClick={() => {
            let newUrl = router.resolve({
              path: '/previewComp',
              query: {
                id:
                  props.option.type === 'gallery'
                    ? props.item.publishId
                    : props.item.id,
                type: props.option.type
              }
            })
            window.open(newUrl.href, '_blank')
          }}
        >
          <i class="iconfont conch-previewComp"></i>
        </a-button>
      </div>
    )
  }
}

// 以某一个组件为模板写代码
export const pasteComponentExample = key => ({
  functional: true,
  props: { item: Object },
  render: (h, { props }) => {
    return (
      <a-button
        class="tool-item tool-link tool-item-example"
        type="link"
        size="small"
        title="以该组件为模版编辑"
        onClick={async e => {
          let d = await requestHandle(
            copyCompById({ id: props.item[key] }),
            '创建失败'
          )
          if (d) {
            notification.success({
              message: '复制组件成功,可进入开发页面编辑'
            })
          }
        }}
      >
        <i class="iconfont conch-editorComp"></i>
      </a-button>
    )
  }
})

// 复制组件ID
const copyCompIdExample = {
  functional: true,
  props: { item: Object, option: Object },
  render(h, { props }) {
    return (
      <a-button
        type="link"
        title="复制组件ID"
        class="tool-item tool-link tool-item-example"
        size="small"
        onClick={e => {
          copyString(
            'C' +
              (props.option.type === 'gallery'
                ? props.item.publishId
                : props.item.id)
          )
        }}
      >
        <i class="iconfont conch-copyCompId"></i>
      </a-button>
    )
  }
}

// 加入购物车
const _checkBox = fn => ({
  functional: true,
  props: { item: Object },
  render(h, { props }) {
    return (
      <a-checkbox
        checked={props.item._checked}
        onClick={e => {
          Vue.set(props.item, '_checked', !props.item._checked)
          if (fn && typeof fn === 'function') fn(props.item)
        }}
      ></a-checkbox>
    )
  }
})
const joinResourceCenter = _checkBox(item => {
  const { main } = Vuex.state
  if (item._checked) {
    main.resourceArr.push({
      sid: item.publishId,
      pid: item.id,
      sType: 2
    })
  } else {
    main.resourceArr.splice(
      main.resourceArr.findIndex(r => r.sid === item.publishId),
      1
    )
  }
  Vuex.commit(RESOURCE_ARR, main.resourceArr)
  localStorage.setItem('resourceArr', JSON.stringify(main.resourceArr))
})
// 选择框
const checkBox = _checkBox()

// 复制组件ID
const copyCompId = {
  functional: true,
  props: { item: Object, option: Object },
  render(h, { props }) {
    return (
      <a-button
        type="primary"
        title="复制组件ID"
        onClick={e => {
          copyString(
            'C' +
              (props.option.type === 'gallery'
                ? props.item.publishId
                : props.item.id)
          )
        }}
      >
        复制组件ID
      </a-button>
    )
  }
}

// 删除
const deleteObj = {
  myResource: {
    s: '移出收藏',
    innerTexts: '您确定将该组件移出收藏吗？',
    innerTextsII: '移出后可从图表市场中重新添加',
    deleteMsg: '移出收藏成功',
    parameter: props => ({
      sid: props.item.id
    }),
    handleFn: cancelStar
  },
  myProject: {
    s: '移出项目',
    innerTexts: '您确定将该组件移出项目吗？',
    innerTextsII: '移出后可从图表市场中重新添加',
    deleteMsg: '移出项目成功',
    parameter: props => ({
      pid: props.pid,
      sid: props.item.id
    }),
    handleFn: cancelFolder
  },
  myComponent: {
    s: '删除组件',
    innerTexts: '您确定将该组件删除吗？',
    innerTextsII: '删除后可在开发者页面重建哦',
    deleteMsg: '删除成功',
    parameter: props => props.item.id,
    handleFn: deleteCompById
  }
}
const deleteBtn = {
  functional: true,
  props: { list: Array, item: Object, pid: String, option: Object },
  render(h, { props }) {
    const {
      s,
      innerTexts,
      innerTextsII,
      deleteMsg,
      parameter,
      handleFn
    } = deleteObj[props.option.type]

    return (
      <div class="tool-inner">
        <a-button
          class="tool-item tool-link"
          type="link"
          size="small"
          title={s}
          onClick={e => {
            Modal.confirm({
              title: s,
              centered: true,
              content: h('p', {}, [
                h('span', {
                  domProps: {
                    innerText: innerTexts
                  }
                }),
                h('br'),
                h('span', {
                  style: {
                    fontSize: '12px',
                    color: '#999999'
                  },
                  domProps: {
                    innerText: innerTextsII
                  }
                })
              ]),
              okText: '确定',
              okType: 'primary',
              cancelText: '取消',
              onOk: async () => {
                let d = await requestHandle(
                  handleFn(parameter(props)),
                  '操作失败'
                )
                if (d) {
                  notification.success({
                    message: deleteMsg
                  })
                  if (
                    handleFn === deleteCompById &&
                    (localStorage.getItem('resourceArr') || '').includes(
                      props.item.id
                    )
                  ) {
                    try {
                      const resourceArrData = JSON.parse(
                        localStorage.getItem('resourceArr')
                      )
                      resourceArrData.splice(
                        resourceArrData.findIndex(l => l.sid === props.item.id),
                        1
                      )
                      localStorage.setItem(
                        'resourceArr',
                        JSON.stringify(resourceArrData)
                      )
                      Vuex.commit(RESOURCE_ARR, resourceArrData)
                    } catch (err) {
                      console.error(err)
                    }
                  }
                  Vue.delete(
                    props.list,
                    props.list.findIndex(item => item.id === props.item.id)
                  )

                  eventBus.$emit('loadDeleteData')
                }
              },
              onCancel() {}
            })
          }}
        >
          <i class="iconfont conch-icon-compdel-res"></i>
        </a-button>
      </div>
    )
  }
}

// 预览
const preview = {
  functional: true,
  props: { item: Object, option: Object },
  render(h, { props }) {
    return (
      <div class="tool-inner">
        <a-button
          class="tool-item tool-link"
          type="link"
          size="small"
          title="预览"
          onClick={() => {
            let newUrl = router.resolve({
              path: '/previewComp',
              query: {
                id:
                  props.option.type === 'gallery'
                    ? props.item.publishId
                    : props.item.id,
                type: props.option.type
              }
            })
            window.open(newUrl.href, '_blank')
          }}
        >
          <i class="iconfont conch-icon-compplay"></i>
        </a-button>
      </div>
    )
  }
}

// 以某一个组件为模板写代码
export const pasteComponent = key => ({
  functional: true,
  props: { item: Object },
  render: (h, { props }) => {
    return (
      <a-button
        class="tool-item tool-link"
        type="link"
        size="small"
        title="以该组件为模版编辑"
        onClick={async e => {
          let d = await requestHandle(
            copyCompById({ id: props.item[key] }),
            '创建失败'
          )
          if (d) {
            notification.success({
              message: '复制组件成功,可进入开发页面编辑'
            })
          }
        }}
      >
        <i class="iconfont conch-icon-scenectrol-play"></i>
      </a-button>
    )
  }
})

const handleBtn = {
  functional: true,
  props: { item: Object, option: Object },
  render: (h, { props }) => {
    const { title, icon, handle } = props.option.option
    return (
      <a-button
        class="tool-item tool-link"
        type="link"
        size="small"
        title={title}
        onClick={e => {
          handle(props.item)
        }}
      >
        <i class={`iconfont conch-${icon}`}></i>
      </a-button>
    )
  }
}

const handleBtnExample = {
  functional: true,
  props: { item: Object, option: Object },
  render: (h, { props }) => {
    const { title, icon, handle } = props.option.option
    return (
      <a-button
        class="tool-item tool-link tool-item-example"
        type="link"
        size="small"
        title={title}
        onClick={e => {
          handle(props.item)
        }}
      >
        <i class={`iconfont conch-${icon}`}></i>
      </a-button>
    )
  }
}

// 版本
const versionTag = {
  functional: true,
  props: { item: Object, pid: String, option: Object },
  render(h, { props }) {
    if (props.item.version > 0) {
      return props.item.version < props.item.publishVersion &&
        props.option.type !== 'myHistory' ? (
        <div
          class="version-wrapper"
          style="cursor:pointer;"
          onClick={e => {
            // eventBus.$emit('OPEN_NEWVERSION')
            Vue.confirmOk('确定要更新该组件吗', null, async () => {
              let apiFn =
                props.option.type === 'myProject' ? saveFolder : saveStar
              let d = await requestHandle(
                apiFn({
                  id: props.item.operationId,
                  sid: props.item.publishId,
                  pid: ''
                }),
                '操作失败'
              )
              if (d) {
                notification.success({
                  message: '组件更新成功'
                })
                props.item.version = props.item.publishVersion
              }
            })
          }}
        >
          可更新
        </div>
      ) : (
        <div class="version-wrapper" style="cursor:auto;">
          V
          {props.item.version > 100
            ? props.item.version
            : ' ' + props.item.version}
        </div>
      )
    } else {
      return <div class="version-wrapper">未发布</div>
    }
  }
}

// 热度
const hot = {
  functional: true,
  props: { item: Object },
  render(h, { props }) {
    return (
      <div class="hot-wrapper">
        <i class="iconfont conch-remen"></i>
        <span class="text">{props.item.hot || 0}</span>
      </div>
    )
  }
}
// 作者
const author = {
  functional: true,
  props: { item: Object },
  render(h, { props }) {
    return (
      <div class="author-wrapper">
        <p>作者: {props.item.owner}</p>
      </div>
    )
  }
}

// 收藏
const starObj = {
  save: {
    parameter: props => ({
      sType: 2,
      pid: props.item.id,
      sid: props.item.publishId
    }),
    msg: '加入收藏成功',
    handleFn: saveStar
  },
  cancel: {
    parameter: props => ({
      sid: props.item.publishId
    }),
    msg: '取消收藏成功',
    handleFn: cancelStar
  }
}
const star = {
  functional: true,
  props: { item: Object },
  render(h, { props }) {
    return (
      <div
        class={props.item.star ? 'starBtn active' : 'starBtn'}
        title="收藏"
        onClick={e => {
          const { parameter, handleFn, msg } = props.item.star
            ? starObj['cancel']
            : starObj['save']

          props.item.star = !props.item.star
          let d = requestHandle(handleFn(parameter(props)), '操作失败')
          d.then(res => {
            if (res) {
              notification.success({
                message: msg
              })
            }
          })
        }}
      >
        <i class="iconfont conch-icon-favcomp-t-big"></i>
      </div>
    )
  }
}

const starExample = {
  functional: true,
  props: { item: Object },
  render(h, { props }) {
    return (
      <div
        class={
          props.item.star
            ? 'starBtn starBtn-example active'
            : 'starBtn starBtn-example'
        }
        title="收藏"
        onClick={e => {
          const { parameter, handleFn, msg } = props.item.star
            ? starObj['cancel']
            : starObj['save']

          props.item.star = !props.item.star
          let d = requestHandle(handleFn(parameter(props)), '操作失败')
          d.then(res => {
            if (res) {
              notification.success({
                message: msg
              })
            }
          })
        }}
      >
        <i
          class={
            props.item.star
              ? 'iconfont conch-starCompActive'
              : 'iconfont conch-starComp'
          }
        ></i>
      </div>
    )
  }
}

// 编辑组件
const edit = {
  functional: true,
  props: { item: Object },
  render(h, { props }) {
    return (
      <div
        title="编辑"
        class="editComp"
        onClick={e => {
          let newUrl = router.resolve({
            path: '/editor?type=myComponent'
          })
          const url = window.open(newUrl.href, '_blank')
          url.queryId = props.item.id
        }}
      >
        <i class="iconfont conch-icon-edit"></i>
      </div>
    )
  }
}

// 最后下载时间
const lastDownloadTime = {
  functional: true,
  props: { item: Object },
  render(h, { props }) {
    return (
      <div class="slot-history-time">
        最后下载日期：{props.item.operationTime}
      </div>
    )
  }
}

// 下载
let paramer = [
  {
    name: '增量下载',
    title: '项目中已使用过Conch组件',
    increase: true
  },
  {
    name: '全量下载',
    title: '项目中第一次使用Conch组件',
    increase: false
  }
]
export const downloadBtn = {
  functional: true,
  props: { item: Object, option: Object },
  render(h, { props }) {
    return (
      <a-dropdown placement="topCenter">
        <a-button class="btn" type="link" title="下载">
          <i class="iconfont conch-icon-download"></i>
        </a-button>
        <a-menu slot="overlay">
          {paramer.map(({ name, title, increase }) => (
            <a-menu-item>
              <a
                rel="noopener noreferrer"
                title={title}
                onClick={async e => {
                  let params = { increase }
                  if (props.option.type === 'myComponent') {
                    params.sids = [props.item.id]
                  } else {
                    params = {
                      ids: [props.item.publishId || props.item.id],
                      sids:
                        props.option.type === 'myComponent'
                          ? [props.item.id]
                          : null,
                      increase
                    }
                  }
                  Vuex.dispatch(DOWNLOAD_COMPS, params)
                }}
              >
                {name}
              </a>
            </a-menu-item>
          ))}
        </a-menu>
      </a-dropdown>
    )
  }
}
export const downloadBtnExample = {
  functional: true,
  props: { item: Object, option: Object },
  render(h, { props }) {
    return (
      <a-dropdown placement="topCenter">
        <a-button
          class="btn"
          type="link"
          title="下载"
          style="background:transparent;"
        >
          <i class="iconfont conch-downloadComp conch-downloadComp-example"></i>
        </a-button>
        <a-menu slot="overlay" class="download-example">
          {paramer.map(({ name, title, increase }) => (
            <a-menu-item>
              <a
                rel="noopener noreferrer"
                title={title}
                onClick={async e => {
                  let params = { increase }
                  if (props.option.type === 'myComponent') {
                    params.sids = [props.item.id]
                  } else {
                    params = {
                      ids: [props.item.publishId || props.item.id],
                      sids:
                        props.option.type === 'myComponent'
                          ? [props.item.id]
                          : null,
                      increase
                    }
                  }
                  Vuex.dispatch(DOWNLOAD_COMPS, params)
                }}
              >
                {name}
              </a>
            </a-menu-item>
          ))}
        </a-menu>
      </a-dropdown>
    )
  }
}

const slots = {
  joinResourceCenter,
  checkBox,
  copyCompId,
  deleteBtn,
  preview,
  pasteComponent: pasteComponent('publishId'),
  versionTag,
  hot,
  author,
  star,
  edit,
  lastDownloadTime,
  downloadBtn,
  handleBtn,
  publishTimeExample,
  copyCompIdExample,
  previewExample,
  pasteComponentExample: pasteComponentExample('publishId'),
  starExample,
  downloadBtnExample,
  versionTagExample,
  handleBtnExample
}

export default {
  props: {
    options: Array, // 组件参数
    list: Array, // 列表数据
    item: Object, // 当前组件数据
    pid: String,
    compConentBackground: String,
    borderRadius: Number,
    titleColor: String
  },
  components: {
    ContentItem
  },
  render(h) {
    let obj = {}
    this.options.forEach(option => {
      const { name = 'default', slot } = option
      if (!obj[slot]) obj[slot] = []
      obj[slot].push({ s: slots[name], option })
    })

    Object.keys(obj).forEach(k => {
      const list = obj[k]
      obj[k] = props =>
        list.map(({ s, option }) =>
          h(s, {
            props: {
              option,
              list: this.list,
              item: this.item,
              pid: this.pid
            }
          })
        )
    })

    return h(ContentItem, {
      scopedSlots: obj,
      props: {
        item: this.item,
        compConentBackground: this.compConentBackground,
        borderRadius: this.borderRadius,
        titleColor: this.titleColor
      }
    })
  }
}
