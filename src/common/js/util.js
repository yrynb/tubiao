/**
 * 存放工具的工具库
 */
'use strict'
import { notification } from 'ant-design-vue'
import html2canvas from 'html2canvas'

const prettier = require('prettier/standalone')
const prettierCss = require('prettier/parser-postcss')
const prettierJSON = require('prettier/parser-babylon')

/**
 * 加载字体
 * @param {*} list 字体列表
 * @param {*} prefix 字体资源地址前缀
 */
export const loadFonts = (list, prefix) => {
  return new Promise(async resolve => {
    const fontList = Array.from(window.document.fonts.values())
    for (let i = 0; i < list.length; i++) {
      const { file, psName } = list[i]
      if (fontList.some(f => f.family === psName)) return
      const fontFace = new window.FontFace(
        psName,
        `url('${prefix}/fonts/${file}')`
      )
      fontFace.load().then(font => {
        window.document.fonts.add(font)
      })
      await fontFace.loaded
    }
    resolve()
  })
}
/**
 * 将时间戳转换为时间格式
 * @param {*} time 时间戳
 */
export const formatTime = time => {
  var date = new Date(time)
  var y = date.getFullYear()
  var m = date.getMonth() + 1
  m = m < 10 ? '0' + m : m
  var d = date.getDate()
  d = d < 10 ? '0' + d : d
  var h = date.getHours()
  h = h < 10 ? '0' + h : h
  var minute = date.getMinutes()
  // var second = date.getSeconds()
  minute = minute < 10 ? '0' + minute : minute
  // second = second < 10 ? '0' + second : second
  var timeStr = y + '-' + m + '-' + d + ' ' + h + ':' + minute
  return timeStr
}
/**
 * 避免频繁输入导致的频繁请求
 * @param {*} fn 执行方法
 * @param {*} delay 延迟时间
 */
export const debounce = (fn, delay) => {
  let timer
  return function(...args) {
    return new Promise(resolve => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        fn.apply(this, args)
        resolve(1)
      }, delay)
    })
  }
}
/**
 * 一段时间内执行一次,当持续触发事件时，保证一定时间内只调用一次事件处理函数
 * @param {*} fn 执行方法
 * @param {*} delay 延迟时间
 */
export const throttle = (fn, delay) => {
  let timer = null
  // 标志是否可以执行函数
  let flag = true
  return function(...args) {
    if (!flag) return
    if (timer) clearTimeout(timer)
    flag = false
    timer = setTimeout(() => {
      fn(...args)
      flag = true
    }, delay)
  }
}

/**
 * 深度拷贝数组和对象
 * @param {*} source 目标对象
 */
export const deepCopy = source => {
  if (!source) {
    return source
  }
  let sourceCopy = source instanceof Array ? [] : {}
  for (let item in source) {
    sourceCopy[item] =
      typeof source[item] === 'object' ? deepCopy(source[item]) : source[item]
  }
  return sourceCopy
}

export const getArray = arr => (Array.isArray(arr) ? arr : [])

/**
 * 首字母大写
 * @param {*} str 目标字符串
 */
export const titleCase = str =>
  str.substring(0, 1).toUpperCase() + str.substring(1)

/**
 * 加载 script
 * @param {*} url script 的链接或者内容
 * @param {*} callback 加载后的回调函数
 * @param {*} id script 的id
 * @param {*} bool 是否是文本 默认是链接
 */
export const loadScript = (url, callback, id, bool = false, myWindow) => {
  myWindow = myWindow || window
  const _body = myWindow.document.head
  let script = id ? _body.querySelector('#' + id) : null
  if (script) {
    _body.removeChild(script)
    script = null
  }
  if (!script) {
    script = myWindow.document.createElement('script')
    script.type = 'text/javascript'
    if (callback && typeof callback === 'function') script.onload = callback
    _body.appendChild(script)
  } else {
    if (callback && typeof callback === 'function') callback()
  }
  if (id && script.id !== id) script.id = id
  bool
    ? script.appendChild(myWindow.document.createTextNode(url))
    : (script.src = url)
}

/**
 *
 * @param {*} dom 需要截图的DOM
 * @param {*} scale 缩放比
 * @returns
 */
export const getSnapshot = async (dom, scale) => {
  const { clientWidth, clientHeight } = dom
  scale = scale || 1

  let img = null

  // 先转换图片，防止有跨域图片导致截图失败
  // await setImageSrc(dom)

  // 正常获取截图
  const canvas = await html2canvas(dom, {
    width: clientWidth * scale,
    height: clientHeight * scale,
    allowTaint: true,
    taintTest: false,
    logging: false,
    scale: 1 / scale,
    backgroundColor: '#1E1E1E'
  })

  try {
    img = canvas.toDataURL()
  } catch (error) {
    console.warn(error)
  }

  // 获取节点中的video标签
  let videoDoms = dom.getElementsByTagName('video')
  if (videoDoms.length > 0) {
    const videoSnapshot = await getVedioSnapshot(dom, videoDoms, canvas)
    if (videoSnapshot) {
      img = videoSnapshot
    }
  }

  if (!img) {
    img = urlToBase64('static/img/加载失败.png')
  }
  return img
}

export const getVedioSnapshot = async (dom, videoDoms, canvas) => {
  let domRect = dom.getBoundingClientRect()
  let ctx = canvas.getContext('2d')

  for (let videoDom of videoDoms) {
    let videoRect = videoDom.getBoundingClientRect()
    let top = videoRect.top - domRect.top
    let left = videoRect.left - domRect.left

    // 只保留在当前可视区域内的
    if (
      !(
        top + videoRect.height > domRect.top &&
        top < domRect.top + domRect.height &&
        left + videoRect.width > domRect.left &&
        left < domRect.left + domRect.width
      )
    )
      continue

    ctx.drawImage(
      videoDom,
      videoRect.left - domRect.left,
      videoRect.top - domRect.top,
      videoDom.clientWidth,
      videoDom.clientHeight
    )
  }

  try {
    return canvas.toDataURL('image/jpeg', 0.4)
  } catch (error) {
    notification.warn({
      message: '视频截图失败！'
    })
  }
}

export const setImageSrc = async dom => {
  let imgDoms = dom.getElementsByTagName('img')
  if (imgDoms.length > 0) {
    for (let imgDom of imgDoms) {
      const b = imgDom.src.includes('http') || imgDom.src.includes('https')
      if (b && !imgDom.src.includes('s-static/img')) {
        let baseImg = await urlToBase64(imgDom.src)
        imgDom.setAttribute('src', baseImg)
      }
    }
  }
}

/**
 * 根据图片链接获取base64
 * @param {*} url 图片的 url 对象
 * @param {*} multiple 压缩倍数，默认为1
 */
export const urlToBase64 = async (url, multiple = 1) => {
  return new Promise((resolve, reject) => {
    let image = new Image()
    image.crossOrigin = 'anonymouse'
    image.src = url
    image.onload = function() {
      let canvas = document.createElement('canvas')
      let context = canvas.getContext('2d')
      let imageWidth = image.width / multiple
      let imageHeight = image.height / multiple
      canvas.width = imageWidth
      canvas.height = imageHeight
      context.drawImage(image, 0, 0, imageWidth, imageHeight)
      resolve(canvas.toDataURL('image/jpeg'))
    }
  })
}

/**
 * 获取base64
 * @param {*} blob 图片的 blob 对象
 * @param {*} multiple 压缩倍数，默认为1
 */
export const toBase64 = (blob, multiple = 1) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onload = e => {
      if (multiple === 1) {
        resolve(reader.result)
      } else {
        let image = new Image()
        image.src = reader.result
        image.onload = function() {
          let canvas = document.createElement('canvas')
          let context = canvas.getContext('2d')
          let imageWidth = image.width / multiple
          let imageHeight = image.height / multiple
          canvas.width = imageWidth
          canvas.height = imageHeight
          context.drawImage(image, 0, 0, imageWidth, imageHeight)
          resolve(canvas.toDataURL('image/jpeg'))
        }
      }
    }
    reader.onerror = error => reject(error)
  })
}

/**
 * 分析 URL
 * @param {*} href 要解析的url默认是浏览器地址
 * @param {*} sep 分隔符
 * @param {*} eq 分隔符
 */
export const decodeURL = (href, sep = '&', eq = '=') => {
  href = href || window.location.href
  const obj = Object.create(null)
  let params = href.split('?')[1]
  if (href.includes('?') && typeof params === 'string' && params.length !== 0) {
    const regexp = /\+/g
    params.split(sep).forEach(item => {
      let x = item.replace(regexp, '%20')
      let idx = x.indexOf(eq)
      let { kstr, vstr } =
        idx >= 0
          ? {
              kstr: x.substr(0, idx),
              vstr: x.substr(idx + 1)
            }
          : {
              kstr: x,
              vstr: ''
            }

      let k = decodeURIComponent(kstr)
      let v = decodeURIComponent(vstr)
      if (!Object.prototype.hasOwnProperty.call(obj, k)) {
        obj[k] = v
      } else if (Array.isArray(obj[k])) {
        obj[k].push(v)
      } else {
        obj[k] = [obj[k], v]
      }
    })
  }
  return obj
}

const stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v

    case 'boolean':
      return v ? 'true' : 'false'

    case 'number':
      return isFinite(v) ? v : ''

    default:
      return ''
  }
}
/**
 * 编译URL
 * @param {*} obj 参数
 * @param {*} bool 是否是当前 location
 */
export const encodeURL = (obj, bool) => {
  let s = ''
  if (obj && typeof obj === 'object') {
    s = Object.entries(obj)
      .map(([k, v]) => {
        k = k + '='
        return k + stringifyPrimitive(v)
      })
      .join('&')
  }

  return (bool ? '' : window.location.href.split('?')[0]) + (s ? '?' + s : s)
}
/**
 * 将对象转换为 字符串
 * @param {*} obj 目标对象
 */
export const obj2Str = obj => {
  switch (typeof obj) {
    case 'object':
      if (Array.isArray(obj)) {
        return '[' + obj.map(item => obj2Str(item)).join(',') + ']'
      } else if (obj instanceof RegExp) {
        return obj.toString()
      } else {
        return (
          '{' +
          Object.entries(obj)
            .map(([k, v]) => k + ':' + obj2Str(v))
            .join(',') +
          '}'
        )
      }
    case 'string':
      return `'${obj}'`
    default:
      return obj.toString()
  }
}

export const requestHandle = async (req, errorMessage) => {
  try {
    const res = await req
    if (res.code === 200) {
      return res.data
    } else {
      throw new Error(res && res.message)
    }
  } catch (error) {
    if ('' + error === 'Cancel') return
    console.error(error)
    notification.error({
      message: errorMessage,
      description: '' + error
    })
  }
}

export const requestHandleByID = async (req, errorMessage) => {
  try {
    const res = await req
    if (res.code === 200) {
      return res.data
    } else {
      throw new Error(res && res.message)
    }
  } catch (error) {
    if ('' + error === 'Cancel') return
    console.error(error)
    notification.error({
      message: errorMessage,
      description: '请输入有效的组件ID!'
    })
  }
}

export const getListSize = el => {
  const contentWidth = el.clientWidth
  const contentHeight = el.clientHeight
  const WN = Math.floor(contentWidth / 340)
  const w = 340 + (contentWidth % 340) / WN
  const h = (w / 16) * 9
  const HN = Math.floor(contentHeight / (h + 90)) + 2
  return WN * HN
}
export const getCookie = name => {
  let arr
  let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = document.cookie.match(reg))) return unescape(arr[2])
  return null
}
let input
export const copyString = s => {
  if (!input) input = document.querySelector('#copyString')
  input.value = s
  input.select()
  if (document.execCommand('copy')) {
    notification.success({
      message: '复制成功'
    })
  } else {
    notification.error({
      message: '复制失败'
    })
  }
}
export const loadDiagramScript = ({ id, src }, myWindow = window) => {
  return new Promise(resolve => {
    let script = myWindow.document.head.querySelector('#' + id)
    if (!script) {
      script = document.createElement('script')
      script.src = src
      script.type = 'text/javascript'
      script.onload = () => {
        script.isLoading = true
        resolve(1)
      }
      script.id = id
      myWindow.document.head.appendChild(script)
    } else {
      resolve(1)
    }
  })
}
export const determineDataType = data => {
  return Object.prototype.toString.call(data).slice(8, -1)
}

export const prettierCode = (code, type) => {
  const formatConfig = {
    css: prettierCss,
    json: prettierJSON
  }
  try {
    return prettier.format(code, {
      parser: type,
      plugins: [formatConfig[type]]
    })
  } catch (error) {
    console.error(error)
    notification.error({
      message: 'config.json文件格式有误，详情请参考控制台信息'
    })
    return code
  }
}
