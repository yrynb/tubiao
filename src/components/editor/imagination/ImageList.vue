<template>
  <div>
    <img class="img-list-big-img" :src="imgUrl" v-if="visible && imgUrl" />
    <a-drawer
      class="dark-drawer img-drawer my-scroll"
      width="330"
      :visible="visible"
      :closable="false"
      :mask="false"
      @close="handleCancel"
    >
      <template slot="title">
        <ul>
          <li
            v-for="item in list"
            :key="item.key"
            :class="{ active: selectItem === item }"
            @click="open(item)"
          >
            {{ item.name }}
          </li>
        </ul>
      </template>
      <div
        class="img-container"
        @drop="dropImgRemove"
        @dragover="e => e.preventDefault()"
      >
        <header class="child-between" v-if="this.selectItem.key === 'owner'">
          <span>
            图片资源
            <i
              @click="$refs.GroupControl.showModal()"
              class="iconfont conch-zuguanli"
            ></i>
          </span>
          <a-upload
            :customRequest="saveImgAction"
            :showUploadList="false"
            accept=".jpg,.jpeg,.png,.bmp"
          >
            上传图片
          </a-upload>
        </header>
        <template v-if="this.selectItem.key === 'project'">
          <div>
            <a-select
              show-search
              style="width: 300px;"
              class="dark-select"
              option-label-prop="label"
              placeholder="请输入搜索关键词"
              :filter-option="filterOption"
              option-filter-prop="children"
              v-model="search"
              @change="changeHandle"
              @keyup.enter.native="$event.target.blur"
            >
              <a-select-option
                v-for="i in projectList"
                :key="i.id"
                :label="i.name"
              >
                {{ i.name }}
              </a-select-option>
            </a-select>

            <a-input
              v-if="searchProject || showList.length"
              placeholder="请输入资源关键词"
              class="dark-input"
              ref="input"
              type="text"
              v-model="searchKey"
              @keyup.enter.native="$event.target.blur"
            />
          </div>
        </template>
        <div class="refresh-wrapper" v-if="this.selectItem.key === 'share'">
          <a-icon type="sync" title="刷新" @click="getShareList" />
        </div>
        <ul v-if="this.selectItem.key === 'owner'">
          <li
            v-for="group in groupList"
            :key="group.id"
            @click="groupHandle(group)"
            @dragover="e => e.preventDefault()"
            @drop.stop="dropImgGroup($event, group)"
          >
            <a-icon
              type="right"
              :style="{ transform: `rotate(${group.collapse ? 90 : 0}deg)` }"
            />
            <span>{{ group.group }}</span>
            <ImgList
              v-if="group.children && group.collapse"
              tabKey="owner"
              :list="group.children"
              :useImg="useImg"
              :deleteImg="deleteImg"
              :shareImg="shareImg"
              :enter="url => (imgUrl = url)"
              :leave="() => (imgUrl = '')"
            />
          </li>
        </ul>
        <ImgList
          v-if="imageList.list"
          :tabKey="this.selectItem.key"
          :list="showList"
          :useImg="useImg"
          :deleteImg="deleteImg"
          :shareImg="shareImg"
          :enter="url => (imgUrl = url)"
          :leave="() => (imgUrl = '')"
        />
      </div>
    </a-drawer>
    <GroupControl
      ref="GroupControl"
      :groupList="groupList"
      type="img"
      @addGroup="addGroup"
      @deleteGroup="deleteGroup"
    />
  </div>
</template>

<script>
import {
  saveImg,
  deleteImgById,
  getImgList,
  getImgListByGroup,
  getImgUpdate
} from 'api/resource'
import { addToGroup, removeToGroup } from 'api/group'
import { getProjectPage } from 'api/project'
import { requestHandle } from 'common/js/util'
import {
  OPEN_EDITOR_LOADING,
  CLOSE_EDITOR_LOADING
} from 'common/js/event-types'
import { mapGetters } from 'vuex'
import GroupControl from '@/modal/editor/GroupControl'

let dragNode = null

const ImgList = {
  functional: true,
  props: {
    tabKey: String,
    list: Array,
    useImg: Function,
    deleteImg: Function,
    shareImg: Function,
    enter: Function,
    leave: Function
  },
  render: (h, { props }) => {
    const { tabKey, list, useImg, deleteImg, shareImg, enter, leave } = props
    return (
      <div class="img-body">
        {list.map(item => (
          <div
            draggable="true"
            onMouseenter={() => enter(item.url)}
            onMouseleave={leave}
            onDragstart={() => (dragNode = item)}
          >
            <img src={item.snapshot} />
            <div
              class="mask child-between"
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <div onClick={e => useImg(item)}></div>
              {tabKey === 'owner' ? (
                <i
                  class="iconfont conch-icon-compdel-res"
                  title="删除"
                  onClick={e => deleteImg(item)}
                ></i>
              ) : (
                ''
              )}
              {tabKey !== 'share' ? (
                <i
                  class="iconfont conch-icon-scenectrol-play"
                  title="共享"
                  onClick={e => shareImg(item)}
                ></i>
              ) : (
                ''
              )}
            </div>
            <p title={item.displayName}>{item.displayName}</p>
          </div>
        ))}
      </div>
    )
  }
}
export default {
  inject: ['diagram'],
  data() {
    const list = [
      {
        name: '我的资源',
        key: 'owner',
        data: {
          list: [],
          groups: []
        }
      },
      {
        name: '项目资源',
        key: 'project',
        data: {
          list: []
        }
      },
      {
        name: '共享资源',
        key: 'share',
        data: {
          list: []
        }
      }
    ]
    return {
      visible: false,
      list,
      selectItem: list[0],
      search: undefined,
      searchKey: '',
      imageList: {},
      projectList: [],
      loaded: false,
      imgUrl: '',
      searchProject: false
      // 防抖输入
      // debounceSearch: debounce(this.init, 200)
    }
  },
  computed: {
    groupList() {
      return this.imageList.groups || []
    },
    showList() {
      return (this.imageList.list || []).filter(item =>
        item.name.includes(this.searchKey)
      )
    },
    ...mapGetters({
      userInfo: 'userInfo'
    })
  },
  methods: {
    async showModal() {
      if (!this.loaded) {
        await this.searchHandle()
        await this.getShareList()
        await this.getImageList()
      }
      this.visible = true
    },
    handleCancel() {
      this.imgUrl = ''
      this.visible = false
      this.selectItem = this.list[0]
      this.imageList = this.list[0].data
      this.$emit('close')
    },
    open(item) {
      this.selectItem = item
      this.searchKey = ''
      this.imageList = item.data
    },
    addGroup(id, group) {
      this.imageList.groups.unshift({ id, group })
    },
    deleteGroup(group) {
      this.imageList.groups.splice(this.imageList.groups.indexOf(group), 1)
    },
    async saveImgAction(e) {
      this.$bus.$emit(OPEN_EDITOR_LOADING)
      let form = new FormData()
      form.append('file', e.file)
      let d = await requestHandle(saveImg(form), '上传失败')
      if (d) {
        this.$notification.success({
          message: '上传成功'
        })
        await this.getImageList()
      }
      this.$bus.$emit(CLOSE_EDITOR_LOADING)
    },
    async getImageList() {
      let d = await requestHandle(
        getImgListByGroup({
          query: { owner: this.userInfo.userName },
          supplement: { owner: this.userInfo.userName, sType: 4 },
          group: 'group'
        }),
        '获取列表错误'
      )
      if (d) {
        d.groups = d.groups.map(g =>
          Object.assign(g, {
            collapse: false,
            children: null
          })
        )
        this.imageList = d
        this.list[0].data = d
        this.loaded = true
      }
    },
    deleteImg(item) {
      const key = `open${Date.now()}`
      this.$notification.open({
        message: '是否删除图片',
        duration: null,
        key,
        btn: h => {
          return (
            <a-button
              type="primary"
              onClick={async () => {
                let d = await requestHandle(
                  deleteImgById(item.id),
                  '删除图片失败'
                )
                if (d) {
                  this.$notification.success({
                    message: '删除成功'
                  })
                  if (item.group) {
                    const group = this.imageList.groups.find(
                      g => g.group === item.group
                    )
                    if (group) {
                      group.children.splice(group.children.indexOf(item), 1)
                    }
                  } else {
                    this.imageList.list.splice(
                      this.imageList.list.indexOf(item),
                      1
                    )
                  }
                  // this.imageList.splice(this.imageList.indexOf(item), 1)
                  this.$notification.close(key)
                }
              }}
            >
              确认
            </a-button>
          )
        }
      })
    },
    useImg(item) {
      this.diagram.addCompImg(item)
    },
    async shareImg(item) {
      let d = await requestHandle(
        getImgUpdate({ id: item.id, share: 1 }),
        '共享资源失败'
      )
      if (d) {
        this.$notification.success({
          message: '加入共享资源成功'
        })
      }
    },
    async groupHandle(group) {
      this.$set(group, 'collapse', !group.collapse)
      if (!group.children) {
        const list = await requestHandle(
          getImgList({
            query: { owner: this.userInfo.userName, group: group.group }
          }),
          '获取列表错误'
        )
        if (Array.isArray(list)) {
          list.forEach(l => (l.parent = group))
          group.children = list
        }
      }
    },
    async dropImgGroup(event, group) {
      if (!dragNode) return
      if (dragNode.group === group.group) return
      const d = await requestHandle(
        addToGroup({
          pid: group.id,
          sids: [dragNode.id]
        }),
        '移动失败'
      )
      if (d) {
        this.$notification.success({ message: '移动成功' })
        // 外层向组内移动
        if (!dragNode.group && group.group) {
          this.imageList.list.splice(this.imageList.list.indexOf(dragNode), 1)
        }
        // 组内向外层移动
        // 组内向组内移动
        if (dragNode.group && group.group) {
          dragNode.parent.children.splice(
            dragNode.parent.children.indexOf(dragNode),
            1
          )
        }
        if (group.children) {
          dragNode.parent = group
          group.children.push(dragNode)
        }
      }
    },
    async dropImgRemove() {
      if (dragNode && dragNode.parent) {
        const d = await requestHandle(
          removeToGroup({
            pid: dragNode.parent.id,
            sids: [dragNode.id]
          }),
          '组件移动失败'
        )
        if (d) {
          this.$notification.success({ message: '组件移动成功' })
          dragNode.parent.children.splice(
            dragNode.parent.children.indexOf(dragNode),
            1
          )
          dragNode.parent = null
          dragNode.group = null
          this.imageList.list.splice(0, 0, dragNode)
        }
      }
    },
    // select框
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      )
    },
    async searchHandle(value) {
      // this.debounceSearch()
      this.search = undefined
      this.searchProject = false
      let data = await requestHandle(
        getProjectPage({
          // query: { name: value || null, publish: '1' },
          query: { name: value || null, owner: this.userInfo.userName },
          page: 1,
          size: 10,
          source: true
        }),
        '获取项目列表失败'
      )
      if (data) {
        this.projectList = data.content
        this.list[1].data.list = []
      }
    },
    async changeHandle(value) {
      let d = await requestHandle(
        getImgList({ query: { oid: value, sType: 2 } }),
        '获取资源列表失败'
      )
      if (d) {
        this.searchProject = true
        this.imageList.list = d
        this.list[1].data.list = d
      }
    },
    async getShareList() {
      let d = await requestHandle(
        getImgList({ query: { share: '1' } }),
        '获取资源列表失败'
      )
      if (d) {
        this.imageList.list = d
        this.list[2].data.list = d
      }
    }
  },
  components: { GroupControl, ImgList }
}
</script>

<style lang="stylus">
@import '~@/common/stylus/index';
.img-list-big-img {
  position: fixed;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
}
.img-drawer {
  color: #fff;
  .ant-drawer-header {
    padding: 0
    ul {
      line-height: 47px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      font-size: 14px;
      color: #999999;
      li {
        margin: 0 20px;
        cursor: pointer;
        &.active {
          border-bottom 2px solid rgba(0, 122, 255, 1);
        }
      }
    }
  }
  .ant-drawer-body {
    padding 12px 15px;
    height: calc(100% - 56px);
    background: rgba(255, 255, 255, 0.05);
    margin-top: 3px;
    .img-container {
      height: 100%;
      width: 100%;
      background-color: rgba(48,48,49,1);
      header {
        font-size: 12px;
        .ant-upload {
          color: #FFFFFF;
          cursor: pointer;
        }
        >span {
          color: #999999;
          >i {
            cursor: pointer;
          }
        }
      }
      .dark-input.ant-input {
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin: 19px 0;
      }
      >ul {
        margin-top: 5px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-bottom 0;
        >li {
          padding: 12px 16px 12px 0;
          line-height: 22px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          >i {
            transition: all .3s;
          }
        }
      }
      .refresh-wrapper{
        display:flex;
        justify-content: flex-end;
        font-size: 17px;
      }
    }
    .img-body {
      gridWrapper(89px)
      >div {
        padding: 10px;
        height: 80px;
        text-align: center;
        position: relative;
        &:hover {
          >div {
            display: flex;
          }
        }
        >img {
          width: 89px;
          height: 50px;
        }
        >div {
          position: absolute;
          width: 89px;
          height: 50px;
          top: 10px;
          left: 10px;
          display: none;
          background: rgba(0, 0, 0, 0.4);
          >div {
            line-height: 50px;
            width: 100%;
            cursor: pointer;
            &:hover {
              background: rgba(0, 0, 0, 0.5);
            }
          }
          i:nth-child(2){
            position: absolute;
            top: -2px;
            right: 3px;
            z-index: 10;
            font-size: 10px;
            cursor: pointer;
          }
          i:nth-child(3){
            position: absolute;
            top: -2px;
            right: 20px;
            z-index: 10;
            font-size: 10px;
            cursor: pointer;
          }
        }
        >p {
          line-height: 30px;
          color: rgba(153, 153, 153, 1);
          width: 85px;
          overflow: hidden;
          display:inline-block;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
