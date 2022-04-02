import {
  GET_FIRST_PROP,
  SET_FIRST_PROP,
  GET_USER_INFO,
  SET_USER_INFO
} from '../mutation-types'
import { requestHandle } from 'common/js/util'
import { getPropList } from 'api/prop'
import { getUserInfo } from 'api/user'

const state = {
  propList: null,
  userInfo: null
}

const getters = {}

const mutations = {
  [SET_FIRST_PROP](state, obj) {
    state.propList = obj
  },
  [SET_USER_INFO](state, obj) {
    state.userInfo = obj
  }
}

const actions = {
  async [GET_FIRST_PROP]({ commit }) {
    const getPromise = type =>
      requestHandle(
        getPropList({ query: { type }, sort: 'index,DESC' }),
        '获取属性列表失败'
      )
    let data = await getPromise('base')
    let childList = []

    if (Array.isArray(data)) {
      data.forEach(child => {
        childList = [...childList, ...child.children]
        child.children.forEach(item => {
          item._active = false
        })
        child._active = false
      })
      childList
        .sort((a, b) => {
          return b.index - a.index
        })
        .splice(9, childList.length - 10)
    } else {
      data = []
    }

    data.unshift({
      id: 0,
      name: '全部',
      value: null,
      _active: false,
      children: []
    })
    commit(SET_FIRST_PROP, data)
  },
  async [GET_USER_INFO]({ commit }) {
    const d = await requestHandle(getUserInfo(), '获取用户信息失败')
    if (d) commit(SET_USER_INFO, d)
  }
}
export default {
  state,
  getters,
  mutations,
  actions
}
