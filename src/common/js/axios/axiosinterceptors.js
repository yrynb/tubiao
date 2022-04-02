import axios from 'axios'
import ssoLogin from './ssoLogin'

const getItem = key => {
  return window.localStorage.getItem(key)
}

// http 请求拦截,给config添加头信息等
axios.interceptors.request.use(
  function(config) {
    // s-static加上后Authorization,会被minio拦截报错
    if (config.url.search('/s-static/') === -1) {
      config.headers.Authorization =
        window.localStorage.getItem('Authorization') ||
        window.localStorage.getItem('token') ||
        ''
    }
    return config
  },
  function(err) {
    return Promise.reject(err)
  }
)

axios.interceptors.response.use(
  async function(response) {
    if (response.data.code === 200) {
      return response
    } else if (response.data.code === 401 || response.data.code === 403) {
      if (getItem('Authorization') && getItem('token')) {
        try {
          const lastQ = await ssoLogin.refreshToken()
          await ssoLogin.setItemToken(lastQ)
          const res = await ssoLogin.requestAgain(response.config)
          res && (response.data = res)
          return response
        } catch (error) {
          await ssoLogin.getClientInfo()
        }
      } else {
        await ssoLogin.getClientInfo()
      }
    }
    return response
  },
  function(err) {
    return Promise.reject(err)
  }
)
