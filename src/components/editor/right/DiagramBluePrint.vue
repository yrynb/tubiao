<template>
  <div class="blueprint-wrapper">
    <div class="el-code-header">
      <span>蓝图</span>
    </div>
    <div id="blueprint_diagrame"></div>
  </div>
</template>

<script>
import Blueprint, {
  BaseNode,
  NullNode,
  BooleanNode,
  NumberNode,
  StringNode,
  BooleanVarGetterNode,
  BooleanVarSetterNode,
  NumberVarGetterNode,
  NumberVarSetterNode,
  StringVarGetterNode,
  StringVarSetterNode,
  Vec3Node,
  BeginNode,
  BranchNode,
  SwitchNode,
  DelayNode,
  TickNode,
  OpNode,
  PrintNode,
  ProxyNode,
  ArrayNode,
  SequenceNode
} from '@uino/thing-blueprint-editor'
import '@uino/thing-blueprint-editor/dist/style.css'
window.BaseNode = BaseNode
export default {
  name: 'DiagramBluePrint',
  props: {
    compInstance: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      conchBlueprintNode: null
    }
  },
  mounted() {
    this.initBlueprintNode()
  },
  destroyed() {
    this.conchBlueprintNode = null
  },
  methods: {
    initBlueprintNode() {
      const blueprint = new Blueprint()

      // 拿到conch蓝图节点 并传入随机的Name和ID
      // let conchNodeId = +new Date() + ''
      this.conchBlueprintNode = this.compInstance.getBlueprintNode()

      // 3.注册conch节点
      blueprint.registerNode(this.conchBlueprintNode)

      // 3.注册蓝图自带的节点
      blueprint.registerNode([
        NullNode,
        BooleanNode,
        NumberNode,
        StringNode,
        BooleanVarGetterNode,
        BooleanVarSetterNode,
        NumberVarGetterNode,
        NumberVarSetterNode,
        StringVarGetterNode,
        StringVarSetterNode,
        Vec3Node,
        BeginNode,
        BranchNode,
        SwitchNode,
        DelayNode,
        TickNode,
        OpNode,
        PrintNode,
        ProxyNode,
        ArrayNode,
        SequenceNode
      ])
      const getName = node => node.config.name

      const data = {
        children: [
          {
            foldername: 'root',
            nodes: [
              BeginNode,
              PrintNode,
              StringNode,
              ArrayNode,
              SequenceNode
            ].map(getName),
            children: [
              {
                foldername: 'common',
                nodes: [NullNode, BooleanNode, NumberNode].map(getName)
              },
              {
                foldername: 'vars',
                nodes: [
                  'BooleanVarGetter',
                  'BooleanVarSetter',
                  'NumberVarGetter',
                  'NumberVarSetter',
                  'StringVarGetter',
                  'StringVarSetter'
                ]
              },
              {
                foldername: 'others',
                nodes: [
                  'Vec3',
                  'Branch',
                  'Switch',
                  'Delay',
                  'Tick',
                  'Op',
                  'Proxy'
                ]
              }
            ]
          }
        ]
      }

      const editor = blueprint.getEditor()
      editor.enableContextMenu = true
      editor.enableSaveLocal = true
      editor.enableToolbar = true
      editor.domElement = document.getElementById('blueprint_diagrame')

      editor.loadFolder(data)
      editor.loadLocalData(
        {
          Print: '打印',
          String: '字符串',
          Begin: '开始',
          exec: '执行',
          start: '开始',
          value: '值',
          next: '下一步',

          root: '默认',
          common: '常用',
          others: '其他',
          vars: '变量'
        },
        'zh-CN'
      )
      // 设置蓝图定义文件
      const blueprintConfig = this.setBlueprintConfig()

      editor.render().then(() => {
        editor.load(blueprintConfig)
      })

      // 监听蓝图节点连线发生变化
      editor.addEventListener('change', () => {
        editor.stop()
        editor.run()
      })
      // editor用于在浏览器调试
      window.editor = editor
    },
    setBlueprintConfig() {
      const inputs = {}
      const outputs = {}
      // 默认连接第一个节点
      this.conchBlueprintNode.config.inputs.forEach((v, k) => {
        if (k === 0) {
          inputs[v.name] = {
            connections: [
              {
                node: -1,
                output: 'start',
                data: {}
              }
            ]
          }
        } else {
          inputs[v.name] = {
            connections: []
          }
        }
      })
      this.conchBlueprintNode.config.outputs.forEach(v => {
        outputs[v.name] = {
          connections: []
        }
      })
      const json = {
        id: '75644582-587b-476f-bd33-9a9a343bafd9',
        name: '蓝图文件2021/09/16 10:27:49',
        info: {
          folders: {},
          files: {
            '243bc45c-512e-49af-a016-3940c924fa85': {
              id: '243bc45c-512e-49af-a016-3940c924fa85',
              name: '蓝图文件1',
              body: {
                id: 'todo',
                nodes: {
                  '-1': {
                    id: -1,
                    data: {},
                    inputs: {},
                    outputs: {
                      start: {
                        connections: [
                          {
                            node: -2,
                            input: '显示',
                            data: {}
                          }
                        ]
                      }
                    },
                    position: ['-100', '0'],
                    name: 'Begin'
                  },
                  '-2': {
                    id: -2,
                    data: {},
                    inputs,
                    outputs,
                    position: ['100', '-0'],
                    name: this.conchBlueprintNode.config.name,
                    title: this.conchBlueprintNode.config.name
                  }
                },
                comments: [],
                collapse: []
              }
            }
          }
        }
      }

      return json
    },
    resize() {
      // document
      //   .querySelector('#blueprint_diagrame .menu-container')
      //   .nextSibling.click()
    }
  }
}
</script>

<style lang="stylus" scoped>
.blueprint-wrapper {
  height 100%
}
#blueprint_diagrame {
  width: 100%;
  height: calc(100% - 36px);
  background-color: rgb(42, 46, 51);
  background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 0),
  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 0);
  background-size: 30px 30px;
}
.el-code-header
    height 36px
    background-color: #242528
    display flex;
    align-items center
    padding 0 10px
    justify-content space-between
</style>
