import { DOWNLOAD_COMPS, SAVEBATCH_STAR, RESOURCE_ARR } from '../mutation-types'
import { downloadComps } from 'api/comp'
import { saveBatchStar } from 'api/star'
import { requestHandle } from 'common/js/util'
import { notification } from 'ant-design-vue'

const state = {
  // 购物车数据
  resourceArr: JSON.parse(localStorage.getItem('resourceArr')) || []
}

const getters = {}

const mutations = {
  [RESOURCE_ARR](state, obj) {
    state.resourceArr = obj
  }
}

const actions = {
  async [DOWNLOAD_COMPS](s, obj) {
    if (Array.isArray(obj.ids) || Array.isArray(obj.sids)) {
      const url = await requestHandle(downloadComps(obj), '组件下载错误')
      if (url) window.open(url)
    }
  },
  async [SAVEBATCH_STAR](s, [ids, listData]) {
    if (Array.isArray(ids) && ids.length) {
      const data = await requestHandle(saveBatchStar(ids), '加入收藏失败')
      if (data) {
        listData.forEach(item => {
          if (data.includes(item.publishId)) item.star = true
        })
        notification.success({
          message: '加入收藏成功'
        })
      }
    }
  }
}
export default {
  state,
  getters,
  mutations,
  actions
}
