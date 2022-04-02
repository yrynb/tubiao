import axios from 'axios'
import './axiosinterceptors'

const CancelToken = axios.CancelToken

export function getApiHandler(url, options) {
  options = options || {}
  const method = String(options.method || 'post').toLowerCase()
  options.method = undefined
  if (!options.headers && method === 'post') {
    // post请求时默认为json格式
    options.headers = { 'Content-Type': 'application/json;charset=UTF-8' }
  }
  /**
   * 接口请求方法处理函数
   * @param {*} params 需传递的请求参数
   * @param {Function} cancelHandler 调用时，会传递一个可以取消当前请求的方法参数
   *   该方法体定义方式
   *   function (cancel) {
   *     //cancel()
   *   }
   * @returns {Promise}
   */
  return function(params, cancelHandler) {
    return axios[method](
      url,
      params,
      Object.assign(options, {
        cancelToken: CancelToken
          ? new CancelToken(cancel => {
              typeof cancelHandler === 'function' && cancelHandler(cancel)
            })
          : null
      })
    )
      .then(res => Promise.resolve(res.data))
      .catch(thrown => {
        if (axios.isCancel(thrown)) {
          console.error('Request canceled', thrown.message)
        }
        return Promise.reject(thrown)
      })
  }
}
