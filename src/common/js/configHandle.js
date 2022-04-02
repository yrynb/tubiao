import index from './diagram/index'
import { determineDataType } from './util'
import { notification } from 'ant-design-vue'

const configType = {
  String: function(key, value) {
    return {
      // 类型
      type: 'string',
      // 标题
      caption: '输入框类型',
      // 描述
      description: '描述文字',
      // key
      key: key,
      // value（默认值）
      value: value,
      // 元素前置文字
      beforeElement: '',
      // 元素后置文字
      afterElement: '后置文字',
      // 必填
      required: true,
      // 指定其父级元组件在当前数组中的下标
      parent: 0,
      // 该值与父级元组件的value值相同，才会显示当前元组件
      isShow: ''
    }
  }
}

/**
 * 所有的解析过程都是按照，opts为复杂类型进行解析的
 */
export default {
  examineConfigKey() {
    let objOpts = this.drawOpts(index.comp.code)
    const objConfig = this.drawConfig(index.comp.options.propertyPanel)

    if (!objOpts || !objConfig || !(determineDataType(objConfig) === 'Array'))
      return
    let abnormalKey = []

    let parseConfig = cfg => {
      if (cfg.type === 'group') {
        for (let ele of cfg.children) {
          parseConfig(ele)
        }
      } else {
        if (!(typeof cfg.key === 'string' && cfg.key !== '')) {
          abnormalKey.push(cfg.key)
          return
        }
        let keyArr = cfg.key.split('.')

        if (keyArr.length >= 1) keyArr.shift()

        let value = JSON.parse(JSON.stringify(objOpts))

        for (let k of keyArr) {
          value = value[k]

          // 数据检测可以使用这种方式，但不一定加在这里，加在Conch端体验会好一些
          // 如果value等于false时，条件也会成立
          if (!value && value !== false) {
            // 如果进了这里，说明key有问题，没有取到最终的值
            value = undefined
            break
          }
        }

        // 把有问题的key给存起来
        if (value === undefined) {
          abnormalKey.push(cfg.key)
        }
      }
    }

    for (let cfg of objConfig) {
      parseConfig(cfg)
    }

    if (abnormalKey.length > 0) {
      notification.warning({
        message: `config.js中部分key在opts中没找到${abnormalKey.join('\n')}`
      })
      if (abnormalKey.includes('')) {
        setTimeout(() => {
          notification.warning({
            message: '存在为空值的key值'
          })
        }, 0)
      }
    }
  },

  drawConfig(config) {
    // eslint-disable-next-line
    let objConfig = new Function('return ' + config)()

    return objConfig
  },

  /**
   * 提取opts
   * @param {string} code
   * @returns object类型的opts
   */
  drawOpts(code) {
    let strCode = code

    let str = code.match(/([\s\S]*?)return class item extends Base/)[1]

    strCode = code.replace(str, 'class Base {}' + '\n')

    let index = strCode.indexOf('render(h, data, opts)')
    if (index > 0) {
      strCode = strCode.slice(0, index) + '};'
    }
    let objOpts = null
    try {
      // 将字符串装换成对象
      // eslint-disable-next-line
      objOpts = new (new Function(strCode)())().opts
    } catch (e) {
      console.warn('打印了一个错误：', e)
      return {}
    }
    return objOpts
  },

  drawData(code) {
    let strCode = code

    let str = code.match(/([\s\S]*?)return class item extends Base/)[1]

    strCode = code.replace(str, 'class Base {}' + '\n')

    let index = strCode.indexOf('render(h, data, opts)')
    if (index > 0) {
      strCode = strCode.slice(0, index) + '};'
    }
    let objData = null
    try {
      // 将字符串装换成对象
      // eslint-disable-next-line
      objData = new (new Function(strCode)())().data
    } catch (e) {
      console.error('打印了一个错误：', e)
    }
    return objData
  },

  /**
   * 通过opts输出config配置
   * @param {object} opts
   * @returns config配置
   */
  exportConfig(opts) {
    const optsKeys = Object.keys(opts)
    let arr = []

    for (let key of optsKeys) {
      let type = determineDataType(opts[key])

      if (configType[type]) {
        arr.push(configType[type](key, opts[key]))
      } else {
        if (type === 'Object') {
          arr.push(this.exportConfig(opts[key]))
        } else {
          arr.push({
            type: '其他类型',
            caption: '其他类型',
            description: '',
            key: key,
            value: opts[key].toString()
          })
        }
      }
    }
    return arr
  },

  /**
   * @desc 检查数据中是否有null值
   */
  checkNull(data) {
    let b = false

    let checkValue = array => {
      if (!array.length) return false
      for (let v of array) {
        const type = determineDataType(v)
        if (type === 'Object') {
          checkValue(Object.values(v))
        } else if (type === 'Array') {
          checkValue(v)
        } else {
          if (v === null) b = true
        }
      }
    }

    // opts和data分开检测
    const type = determineDataType(data)
    if (type === 'Object') {
      checkValue(Object.values(data))
    } else if (type === 'Array') {
      checkValue(data)
    }

    return b
  },

  // 检查data和opts中是否有null值
  checkDataAndOpts(code) {
    /* const b1 = this.checkNull(this.drawOpts(code))
    const b2 = this.checkNull(this.drawData(code))

    if (b1 || b2) {
      notification.warn({
        message:
          '组件的opts和data属性中有属性值为null，可能会在场景编辑器中发生报错或者无法渲染组件的问题'
      })
    } */
  },

  // 检查config是否是JSON格式
  checkoutConfig(cfg) {
    try {
      JSON.parse(cfg)
      return true
    } catch (error) {
      console.error(error)
      notification.error({
        message: 'config.js文件格式有误，详情请参考控制台信息'
      })
      return false
    }
  },

  // 通过config生成opts
  generateOpts(cfg) {
    const config = cfg
    let opts = {}

    const configKeys = Object.keys(config)

    configKeys.forEach(key => {
      func(key, config, opts)
    })

    function func(key, cc, co) {
      let currentObj = cc
      let currentOptsObj = co

      if (!currentObj[key]['default'] && currentObj[key]['children']) {
        // 标识当前控件是个集合
        if (!currentOptsObj[key]) currentOptsObj[key] = {}

        currentOptsObj = currentOptsObj[key]
        currentObj = currentObj[key].children
        const keys = Object.keys(currentObj)

        keys.forEach(k => {
          func(k, currentObj, currentOptsObj)
        })
      } else {
        // 表示常规控件
        // color需要特殊处理
        // let currentValue = currentObj[key].default
        // if (key === 'color' && currentObj[key].default.style === 'single') {
        //   currentValue = currentValue.value
        // }
        // currentOptsObj[key] = currentValue

        currentOptsObj[key] = currentObj[key].default
      }
    }
    return opts
  }
}
