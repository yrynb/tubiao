import store from '@/store'
import router from '@/router'
import Vue from 'vue'
import { requestHandle } from 'common/js/util'
import { getCompListByGroup } from 'api/comp'
import { addToGroup, removeToGroup } from 'api/group'
import { notification } from 'ant-design-vue'

export default {
  groupList: null,
  openGroup: null,
  expandedKeys: [localStorage.getItem('group')],
  changeGroupToTree({ groups = [], list = [] }) {
    return groups
      .map(g =>
        Object.assign(g, {
          name: g.group,
          key: g.group,
          isGroup: true,
          slots: { icon: 'folder' }
        })
      )
      .concat(this.changeListToTree(list))
  },
  changeListToTree(list) {
    const cacheId =
      window.queryId ||
      router.currentRoute.query.queryId ||
      this.getItem('compId')
    list = list.map(item => {
      const id = item.id
      if (cacheId === id) {
        Promise.resolve(1).then(() => this.getComp(id))
      }
      return Object.assign(item, {
        key: item.id,
        slots: {
          icon: item.category
        },
        children: this.pageList
      })
    })
    this.compList = (this.compList || []).concat(list)
    return list
  },
  async getListByGroup() {
    const d = await requestHandle(
      getCompListByGroup({
        query: { owner: store.getters.userInfo.userName },
        supplement: { owner: store.getters.userInfo.userName, sType: 2 },
        group: 'group'
      }),
      '自身列表获取错误'
    )
    if (d) {
      this.groupList = this.changeGroupToTree(d)
    }
  },
  async openListByGroup(group) {
    const g = this.groupList.find(g => g.isGroup && g.group === group)
    if (g && !g.children) {
      let list = await this.getCompList({ group: (this.openGroup = group) })
      if (list) {
        Vue.set(g, 'children', this.changeListToTree(list))
      }
    }
  },
  async moveNodeToGroup(node, group) {
    if (node.group === group.group) return
    const d = await requestHandle(
      addToGroup({
        pid: group.id,
        sids: [node.id]
      }),
      '组件保存失败'
    )
    if (d) {
      this.expandedKeys.push(group.id)
      node.group = group.name
      notification.success({ message: '组件移动成功' })
      this.groupList.splice(this.groupList.indexOf(node), 1)
      if (group.children) group.children.push(node)
    }
  },
  async removeNodeFromGroup(node) {
    const group = this.groupList.find(g => g.isGroup && g.group === node.group)
    const d = await requestHandle(
      removeToGroup({
        pid: group.id,
        sids: [node.id]
      }),
      '组件保存失败'
    )
    if (d) {
      notification.success({ message: '组件移动成功' })
      node.group = undefined
      group.children.splice(group.children.indexOf(node), 1)
      this.groupList.splice(
        this.groupList.findIndex(item => !item.isGroup),
        0,
        node
      )
    }
  }
}
