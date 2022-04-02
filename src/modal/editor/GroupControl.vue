<template>
  <a-modal
    v-model="visible"
    @cancel="handleCancel"
    class="dark-modal "
    width="600px"
    :footer="null"
  >
    <template slot="closeIcon">
      <i class="iconfont conch-icon-homepage-closeitem"></i>
    </template>
    <template slot="title">
      <span>分组</span>
      <i class="iconfont conch-conch-newcomp" @click="addNew = true"></i>
      <a-input
        placeholder="请输入分组名"
        class="dark-input input-blue"
        style="width: 300px"
        v-model="groupName"
        @pressEnter="addNewGroupHandle"
        v-show="addNew"
      />
    </template>
    <div class="group-container my-scroll">
      <ul>
        <li v-for="item in groupList" :key="item.group" class="child-between">
          <a-input
            placeholder="请输入分组名"
            class="dark-input input-blue"
            style="width: 300px"
            :value="item.group"
            @pressEnter="changeGroupHandle"
            v-if="editId === item.id"
          />
          <span v-else>{{ item.group }}</span>
          <span>
            <i class="iconfont conch-icon-edit" @click="editId = item.id"></i>
            <i
              class="iconfont conch-icon-compdel-res"
              @click="deleteGroup(item)"
            ></i>
          </span>
        </li>
      </ul>
    </div>
  </a-modal>
</template>
<script>
import { saveGroup, deleteGroupById } from 'api/group'
import { requestHandle } from 'common/js/util'

const compMixins = {
  sType: 2,
  deleteGroupHandle(group) {
    this.diagram.groupList.splice(this.diagram.groupList.indexOf(group), 1)
  },
  addGroupHandle(d) {
    this.diagram.groupList.unshift({
      id: d,
      name: this.groupName,
      key: this.groupName,
      group: this.groupName,
      isGroup: true,
      slots: { icon: 'folder' }
    })
  }
}
const imgMixins = {
  sType: 4,
  addGroupHandle(d) {
    this.$emit('addGroup', d, this.groupName)
  },
  deleteGroupHandle(group) {
    this.$emit('deleteGroup', group)
  }
}
const mapping = {
  img: imgMixins,
  comp: compMixins
}

export default {
  props: {
    type: {
      type: String,
      default: 'comp'
    },
    groupList: Array
  },
  inject: ['diagram'],
  data() {
    return Object.assign(
      {
        visible: false,
        addNew: false,
        groupName: '',
        editId: ''
      },
      mapping[this.type]
    )
  },
  methods: {
    async showModal() {
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.addNew = false
      this.$emit('close')
    },
    checkGroup(value, item) {
      if (!value) {
        this.$notification.warn({ message: '名称不可为空' })
        return
      }
      if (this.groupList.some(k => k.group === value && item !== k)) {
        this.$notification.error({ message: '名称不可重复' })
        return
      }
      return true
    },
    async addNewGroupHandle() {
      if (this.checkGroup(this.groupName)) {
        const d = await requestHandle(
          saveGroup({
            name: this.groupName,
            sType: this.sType
          }),
          '添加分组失败'
        )
        if (d) {
          this.$notification.success({ message: '添加成功' })
          this.addGroupHandle(d)
          this.addNew = false
          this.groupName = ''
        }
      }
    },
    async changeGroupHandle(e) {
      const value = e.target.value
      const item = this.groupList.find(i => i.id === this.editId)
      if (this.checkGroup(value, item)) {
        const d = await requestHandle(
          saveGroup({
            id: item.id,
            name: (item.key = item.group = item.name = value),
            sType: this.sType
          }),
          '修改分组失败'
        )
        if (d) {
          this.$notification.success({ message: '修改成功' })
          this.editId = ''
        }
      }
    },
    deleteGroup(group) {
      this.confirmOk('是否删除' + group.group, null, async () => {
        const id = group.id
        let d = await requestHandle(deleteGroupById(id), '删除错误')
        if (d) {
          this.deleteGroupHandle(group)
          this.$notification.success({ message: '删除成功' })
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.group-container {
  width: 100%;
  height: 400px;
  padding:0 0 20px 20px;
  color: #fff;
  ul {
    padding-right: 20px;
    height: 100%;
    overflow: auto;
    li {
      line-height: 30px;
      i {
        margin-left: 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
