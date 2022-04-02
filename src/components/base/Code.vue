<template>
  <div class="code-body" ref="container"></div>
</template>

<script>
import * as monaco from 'monaco-editor'
import j from 'jscodeshift'
import MonacoJSXHighlighter from 'monaco-jsx-highlighter'
import { FORMAT_CODE } from 'common/js/event-types'
import { prettierCode } from 'common/js/util'
// import configHandle from '../../common/js/configHandle'

export default {
  name: 'codeEditor',
  inject: ['diagram'],
  props: {
    value: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    theme: {
      type: String,
      default: 'vs-dark'
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isWrap: true,
      cssAction: null,
      jsonAction: null,
      optsAction: null
    }
  },
  watch: {
    language(nv) {
      if (nv) {
        monaco.editor.setModelLanguage(this.instance.getModel(), nv)
        this.initFormat()
      }
    }
  },
  mounted() {
    this.formatCode = this.formatCode.bind(this)
    this.init()
    this.initFormat()
    this.$bus.$on('formatJsonCode', data => {
      if (this.language === 'json') {
        this.instance.setValue(data)
      }
    })
  },
  methods: {
    initFormat() {
      this.language === 'javascript'
        ? this.addGenerateOptsAction()
        : this.optsAction && this.optsAction.dispose()

      this.language === 'scss'
        ? this.addCssAction()
        : this.cssAction && this.cssAction.dispose()

      this.language === 'json'
        ? this.addJsonAction()
        : this.jsonAction && this.jsonAction.dispose()
    },
    addCssAction() {
      this.cssAction = this.instance.addAction({
        id: 'format-code', // 菜单项 id
        label: 'Format Css', // 菜单项名称
        // keybindings: [this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KEY_J], // 绑定快捷键
        contextMenuGroupId: '1_modification', // 所属菜单的分组
        contextMenuOrder: 3,
        run: () => {
          this.instance.setValue(prettierCode(this.instance.getValue(), 'css'))
        }
      })
    },
    addJsonAction() {
      this.jsonAction = this.instance.addAction({
        id: 'format-code', // 菜单项 id
        label: 'Format Json', // 菜单项名称
        contextMenuGroupId: '1_modification', // 所属菜单的分组
        contextMenuOrder: 3,
        run: () => {
          this.instance.setValue(prettierCode(this.instance.getValue(), 'json'))
        }
      })
    },
    addGenerateOptsAction() {
      this.optsAction = this.instance.addAction({
        id: 'format-code', // 菜单项 id
        label: 'Generate Opts', // 菜单项名称
        contextMenuGroupId: '1_modification', // 所属菜单的分组
        contextMenuOrder: 4,
        run: () => {
          let config = JSON.parse(this.diagram.comp.options)
          if (config.propertyPanel) {
            // const val = configHandle.generateOpts(config.propertyPanel)
            const val = this.getConfig(config.propertyPanel)
            const pos = this.instance.getPosition()
            this.instance.executeEdits('', [
              {
                range: {
                  startLineNumber: pos.lineNumber,
                  startColumn: pos.column,
                  endLineNumber: pos.lineNumber,
                  endColumn: pos.column
                },
                // text:
                //   `this.${
                //     this.diagram.comp.category === 'echarts' ? 'config' : 'opts'
                //   } = ` + JSON.stringify(val, null, 2)
                text: JSON.stringify(val, null, 2)
              }
            ])
          }
        }
      })
    },
    dispose() {
      this.$bus.$off(FORMAT_CODE, this.formatCode)
      if (this.instance) {
        if (this.instance.getModel()) {
          this.instance.getModel().dispose()
        }
        this.instance.dispose()
        this.instance = null
      }
    },
    layout() {
      this.instance.layout()
    },
    init() {
      this.dispose()
      this.$bus.$on(FORMAT_CODE, this.formatCode)

      monaco.editor.defineTheme('conchTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ background: '1B1C1F' }],
        colors: {
          'editor.background': '#1B1C1F'
        }
      })

      // 初始化编辑器实例
      this.instance = (this.diagram || {}).editor = monaco.editor.create(
        this.$refs['container'],
        {
          value: this.value,
          theme: 'conchTheme',
          // theme: 'vs-dark',
          readOnly: this.readOnly,
          language: this.language,
          automaticLayout: true, // 跟随父节点调整大小
          wordWrap: 'on', // wordWrap: 'wordWrapColumn', // wordWrapColumn: 80,
          wrappingIndent: 'indent',
          scrollbar: {
            horizontalHasArrows: false,
            horizontal: 'hidden'
          }
        }
      )
      this.model = this.instance.getModel()
      const defaultOptions = {
        isHighlightGlyph: true,
        iShowHover: false,
        isUseSeparateElementStyles: true
      }
      const monacoJSXHighlighter = new MonacoJSXHighlighter(
        monaco,
        j,
        this.instance,
        defaultOptions
      )
      monacoJSXHighlighter.highlightCode()
      if (this.value) this.formatCode()
      // 监听编辑器content变化事件
      this.instance.onDidChangeModelContent(() => {
        if (this.language === 'javascript') monacoJSXHighlighter.highlightCode()
        let val = this.instance.getValue()
        this.$emit('input', val)
      })
    },
    setValue(v) {
      if (typeof v === 'string') this.instance.setValue(v)
    },
    formatCode() {
      this.$nextTick(() => {
        if (this.instance) {
          this.instance.trigger('anyString', 'editor.action.formatDocument')
          // this.instance.getAction('editor.action.formatDocument')._run()
        }
      })
    },
    focus() {
      this.instance.focus()
    },
    getCurrentLineText() {
      return this.model.getLineContent(this.model.getLineCount())
    },
    /**
     * monaco自动换行
     */
    isOpenWrap() {
      this.isWrap = !this.isWrap
      if (this.isWrap) {
        this.instance.updateOptions({
          wordWrap: 'off'
        })
      } else {
        this.instance.updateOptions({
          wordWrap: 'on', // wordWrap: 'wordWrapColumn', // wordWrapColumn: 80,
          wrappingIndent: 'indent',
          scrollbar: {
            horizontalHasArrows: false,
            horizontal: 'hidden'
          } // mouseWheelZoom: true,
        })
      }
    },
    getTop() {
      return this.instance.getScrollTop()
    },
    setTop(n) {
      this.instance.setScrollTop(n)
    },
    getLeft() {
      return this.instance.getScrollLeft()
    },
    setLeft(n) {
      this.instance.setScrollLeft(n)
    }
  },
  beforeDestroy() {
    this.dispose()
  }
}
</script>

<style lang="stylus" scoped>
.code-body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.monaco-editor .scroll-decoration {
  box-shadow: none;
}
</style>
