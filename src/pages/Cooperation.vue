<template>
  <div class="ed-container">
    <Loading v-if="isLoading" size="large" />
    <template v-else>
      <Loading size="large" v-if="loading !== 0" />
      <Header @openImagination="showImagination = true" />
      <Right
        v-if="comp"
        ref="right"
        style="height: calc(100% - 60px);width:100%;"
      />
      <Imagination v-show="showImagination" @close="showImagination = false" />
    </template>
  </div>
</template>

<script>
import EditorMixins from '@/components/editor/EditorMixins'
import { mapMutations } from 'vuex'
import { SET_CODE_CLOSE_STATE } from 'store/mutation-types'
export default {
  mixins: [EditorMixins],
  created() {
    this.codeAllowClose(false)
  },
  methods: {
    ...mapMutations({
      codeAllowClose: SET_CODE_CLOSE_STATE
    }),
    async loadHandle() {
      await this.diagram.getCompByCooperation(this.$route.query.code)
    }
  }
}
</script>
