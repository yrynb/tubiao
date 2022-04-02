import {
  SET_DIAGRAM_STATE,
  SET_Z_MODE,
  SET_LEFT_FOLD,
  SET_CODE_STATE,
  SET_PREVIEW_STATE,
  SET_PREVIEW_BLUE_PRINT_STATE,
  SET_CODE_CLOSE_STATE,
  IS_PREVIEW,
  OPEN_PROPS,
  PREVIEW_FULL
} from '../mutation-types'
import diagram from 'common/js/diagram'

const state = {
  showDiagram: false,
  zMode: false,
  leftFold: false,
  showCode: true,
  showPreview: false,
  showPreviewBluePrint: false,
  codeAllowClose: true,
  isPreview: false,
  openProps: false,
  previewFull: false
}

const getters = {}

const mutations = {
  [SET_DIAGRAM_STATE](state, bool) {
    if (diagram.bigDiagram) bool = false
    state.showDiagram = bool
  },
  [SET_Z_MODE](state, bool) {
    state.zMode = bool
  },
  [SET_LEFT_FOLD](state, bool) {
    state.leftFold = bool
  },
  [SET_CODE_STATE](state, bool) {
    state.showCode = bool
  },
  [SET_PREVIEW_STATE](state, bool) {
    state.showPreview = bool
  },
  [SET_PREVIEW_BLUE_PRINT_STATE](state, bool) {
    state.showPreviewBluePrint = bool
  },
  [SET_CODE_CLOSE_STATE](state, bool) {
    state.codeAllowClose = bool
  },
  [IS_PREVIEW](state, bool) {
    state.isPreview = bool
  },
  [OPEN_PROPS](state, bool) {
    state.openProps = bool
  },
  [PREVIEW_FULL](state, bool) {
    state.previewFull = bool
  }
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
