<template>
  <a-drawer
    title="信息"
    class="dark-drawer prop-drawer"
    width="300"
    :visible="openProps"
    :get-container="false"
    :wrap-style="{ position: 'absolute' }"
    :closable="true"
    @close="closeDrawer"
  >
    <a-form-model
      ref="ruleForm"
      :model="comp"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18 }"
      :disabled="true"
    >
      <label><span class="dark">＊ </span>组件名称：</label>
      <a-form-model-item prop="name">
        <a-input
          ref="level1"
          :value="comp.name"
          placeholder="组件名称"
          class="dark-input"
          @change="e => updateCompProps(e, 'name')"
          :disabled="readOnly"
        />
      </a-form-model-item>
      <label><span class="dark">＊ </span>一级分类</label>
      <a-form-model-item>
        <a-select
          :value="comp.category"
          style="width: 252px"
          class="dark-select"
          dropdownClassName="dark-select-option"
          @change="e => updateCompProps(e, 'category')"
          :disabled="readOnly"
          :getPopupContainer="triggerNode => triggerNode.parentNode"
        >
          <a-select-option
            v-for="item in propListCopy"
            :key="item.id"
            :value="item.value"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <label><span class="dark">＊ </span>二级分类</label>
      <a-form-model-item prop="level1">
        <a-select
          :defaultActiveFirstOption="false"
          ref="level2"
          :value="comp.type"
          style="width: 252px"
          class="dark-select"
          dropdownClassName="dark-select-option"
          @change="e => updateCompProps(e, 'type')"
          :disabled="readOnly"
          :getPopupContainer="triggerNode => triggerNode.parentNode"
        >
          <a-select-option
            v-for="item in secondLevel"
            :key="item.id"
            :value="item.value"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <label>关键词</label>
      <a-form-model-item>
        <a-input
          :value="comp.tag"
          placeholder="关键词以逗号分隔"
          class="dark-input"
          @change="e => updateCompProps(e, 'tag')"
          :disabled="readOnly"
        />
      </a-form-model-item>
      <label>描述</label>
      <a-form-model-item>
        <a-textarea
          :value="comp.desc"
          placeholder="请输入组件的描述信息"
          :auto-size="{ minRows: 3, maxRows: 5 }"
          class="dark-input"
          @change="e => updateCompProps(e, 'desc')"
          :disabled="readOnly"
        />
      </a-form-model-item>
      <label>缩略图</label>
      <a-form-model-item>
        <a-upload
          :beforeUpload="beforeUpload"
          accept=".jpg,.jpeg,.png,.bmp"
          :disabled="uploadSwitchChecked || readOnly"
        >
          <img
            :src="
              comp.snapshot +
                (comp.snapshot.includes('/s-static/snapshot')
                  ? '?t=' + new Date().getTime()
                  : '')
            "
            style="cursor: pointer;"
          />
        </a-upload>
      </a-form-model-item>
      <a-form-model-item>
        <label style="margin-right: 10px">自动生成封面</label>
        <a-switch
          checked-children=" "
          un-checked-children=" "
          :default-checked="uploadSwitchChecked"
          @change="onUploadTypeChange"
          :disabled="readOnly"
        />
      </a-form-model-item>

      <a-form-model-item>
        <a-button type="primary" v-if="!readOnly" @click="saveComp"
          >保存</a-button
        >
      </a-form-model-item>
    </a-form-model>
  </a-drawer>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { toBase64, deepCopy } from 'common/js/util'
import { IS_PREVIEW, OPEN_PROPS } from 'store/mutation-types'

export default {
  inject: ['diagram'],
  props: {
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      backupKeys: [
        'name',
        'category',
        'type',
        'tag',
        'desc',
        'snapshot',
        'snapshotType'
      ],
      backupObj: {},
      saveState: false,
      rules: {
        name: [
          {
            required: true,
            message: '名称不可为空',
            trigger: 'blur'
          }
        ]
      },
      alartState: false,
      propListCopy: []
    }
  },
  watch: {
    openProps() {
      // 如果是打开面板，则记录相关属性
      if (this.openProps) {
        this.saveState = false
        for (let key of this.backupKeys) {
          this.backupObj[key] = this.diagram.comp[key]
        }
      }
    }
  },
  computed: {
    secondLevel() {
      let item = this.propListCopy.find(
        item => item.value === this.comp.category
      )
      return item ? item.children : []
    },
    comp() {
      return this.diagram.comp
    },
    uploadSwitchChecked() {
      return this.diagram.comp.snapshotType !== 1
    },
    ...mapGetters({
      propList: 'propList',
      openProps: 'openProps',
      isPreview: 'isPreview'
    })
  },
  mounted() {
    this.propListCopy = deepCopy(this.propList)
    if (this.propListCopy.length > 0 && this.propListCopy[0].name === '全部') {
      this.propListCopy.shift()
    }
  },
  methods: {
    ...mapMutations({
      setOpenProps: OPEN_PROPS,
      setIsPreview: IS_PREVIEW
    }),
    /**
     * 是否自动上传缩略图开关
     */
    onUploadTypeChange(checked) {
      this.diagram.updateCompProps('snapshotType', Number(!checked))

      // 判断是否切换过，切换过，且为自动生成缩略图
      this.comp.config.isUpload = !checked
    },

    async beforeUpload(file) {
      // eslint-disable-next-line prefer-promise-reject-errors
      const buffer = await file.arrayBuffer()
      this.diagram.updateCompProps(
        'snapshot',
        await toBase64(new Blob([buffer]), 1)
      )
      // 状态调整为手动上传
      this.diagram.updateCompProps('snapshotType', 1)
      this.diagram.updateCompProps('config', this.comp.config)
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('更新图片')
    },
    updateCompProps(e, k) {
      if (typeof e !== 'string') e = e.target.value
      this.diagram.updateCompProps(k, e)
    },
    checkData(data, msg = '') {
      const checks = [
        {
          k: 'name',
          m: '名称',
          r: 'level1'
        },
        {
          k: 'type',
          m: '二级分类',
          r: 'level2'
        }
      ]
      let no = checks.find(item => !data[item.k])
      if (no) {
        if (!this.alartState) {
          this.alartState = true

          this.$notification.error({
            message: no.m + '不可为空' + msg
          })

          this.$refs[no.r].$el.style.animation = 'twinkle 1s infinite'
          setTimeout(() => {
            this.alartState = false
            this.$refs[no.r].$el.style.animation = null
          }, 5000)
        }

        return false
      }

      return true
    },
    async saveComp() {
      if (this.checkData(this.comp)) {
        this.setOpenProps(false)

        if (!this.readOnly) {
          let d = await this.diagram.saveComp()
          if (d) {
            this.saveState = true
            // 同步备份数据
            for (let key of this.backupKeys) {
              this.backupObj[key] = this.diagram.comp[key]
            }
            this.$notification.success({
              message: '信息保存成功'
            })
          }
          // this.updateData()
        }
        this.$emit('input', false)
      }
    },
    async closeDrawer() {
      if (this.readOnly) {
        this.setOpenProps(false)
      } else {
        await this.saveComp()
      }
    }
  }
}
</script>

<style lang="stylus" scope>
@keyframes twinkle{
  0% {
    box-shadow: 0px 0px 10px red;
  }
  50% {
    box-shadow: 0px 0px 10px darkred;
  }
  100% {
    box-shadow: 0px 0px 10px red;
  }
}
.prop-drawer {
  label {
    color: #fff;
    line-height: 1px;
    .dark {
      color: red;
      font-size: 10px;
    }
  }
  img {
    width: 270px;
    height: 140px;
  }
  .ant-drawer-body {
    padding-top: 0;
  }
}
.ant-drawer-wrapper-body::-webkit-scrollbar{
              display: none;
          }
  .ant-drawer-wrapper-body:hover::-webkit-scrollbar{
      display:block;
      width: 8px;
      height:8px;
  }
  .ant-drawer-wrapper-body::-webkit-scrollbar-thumb{
      background: gray;
      border-radius: 8px;
  }
  .ant-drawer-wrapper-body::-webkit-scrollbar-corner{
      background-color:#1e1e1e;
  }
</style>
