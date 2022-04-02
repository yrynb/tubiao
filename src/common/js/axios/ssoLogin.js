let lastQ = null
let timer = setTimeout(() => {
  lastQ = null
}, 20000)
let URI = ''
export default {
  /**
   * 通过封装fetch实现的网络请求方法
   *  @param {*} url 请求地址
   *  @param {*} method 请求方式 默认get
   *  @param {*} body 请求参数
   *  @param {*} header 请求头
   */
  async reqFn(url, method = 'get', body = null, headers = null) {
    headers = {
      Authorization: localStorage.getItem('Authorization'),
      'Content-Type': 'application/json'
    }
    let param = { method: method }

    const type = Object.prototype.toString.call(body).slice(8, -1)
    if (type === 'Object') {
      param['body'] = JSON.stringify(body)
    } else {
      param['body'] = body
    }
    headers && (param['headers'] = headers)
    let response = await fetch(url, param)
    if (response.ok) {
      let json = await response.json()
      return json
    } else {
      console.error('HTTP-Error: ' + response.status)
      return false
    }
  },
  async requestAgain(config) {
    const url = config.url
    const method = config.method
    // const type = Object.prototype.toString.call(config.data).slice(8, -1)
    // let body = null
    // if (type === 'Object') {
    //   body = config.data ? JSON.parse(config.data) : null
    // } else {
    //   body = config.data || null
    // }
    const body = config.data || null

    config.headers.Authorization = localStorage.getItem('Authorization')
    const headers = config.headers
    return this.reqFn(url, method, body, headers)
  },
  // 去除浏览器get请求参数
  removeGetParms() {
    let url = window.location.href
    let valiable = url.split('?')[0]
    window.history.pushState({}, 0, valiable)
  },
  // 获取url中get请求参数
  GetRequest() {
    // 获取url中"?"符后的字串
    let url = location.search
    let theRequest = {}
    if (url.indexOf('?') !== -1) {
      let str = url.substr(1)
      let strs = str.split('&')
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1])
      }
    }
    return theRequest
  },
  // 检查是否有token
  async checkToken() {
    let reqBody = this.GetRequest()
    if (reqBody.code && reqBody.state) {
      await this.ssoLogin()
    }
  },
  async ssoLogin() {
    let reqBody = this.GetRequest()
    // let res = await ssoToken(reqBody)
    let res = await this.reqFn(
      '/spray/auth/oauth2/token/conch',
      'post',
      reqBody
    )
    if (res.code === 200 && res.data.access_token) {
      window.localStorage.setItem(
        'Authorization',
        'sso ' + res.data.access_token
      )
      window.localStorage.setItem('token', JSON.stringify(res.data))
    }
    this.removeGetParms()
    this.jumpToURI()
  },
  async getClientInfo() {
    this.saveCurrentUrl()
    let res = await this.reqFn('/spray/auth/oauth2/getClientInfo/conch')
    if (res.code === 200 && res.data) {
      window.location.href = `https://sso.uino.com/oauth/authorize?response_type=code&client_id=${res.data.clientId}&redirect_uri=${res.data.callbackUrl}&state=${res.data.state}`
    } else {
      this.$notification.error({
        message: '登陆错误',
        description: res.message
      })
    }
  },
  /**
   *
   *
   */
  async refreshToken() {
    if (lastQ) {
      return lastQ
    }
    // 拿到之前存的token
    clearTimeout(timer)
    let oldToken = window.localStorage.getItem('token')
    lastQ = this.reqFn(
      '/spray/auth/oauth2/refresh/conch',
      'post',
      JSON.parse(oldToken)
    )
    timer = setTimeout(() => {
      lastQ = null
    }, 20000)
    return lastQ
  },
  async setItemToken(res) {
    if (!res) return
    if (res.code === 200 && res.data.access_token) {
      window.localStorage.setItem(
        'Authorization',
        'sso ' + res.data.access_token
      )
      window.localStorage.setItem('token', JSON.stringify(res.data))
    } else {
      await this.getClientInfo()
    }
  },
  saveCurrentUrl() {
    let reqBody = this.GetRequest()
    if (reqBody.code && reqBody.state) {
      this.removeGetParms()
    }
    URI = location.href
    URI && window.localStorage.setItem('currentUrl', URI)
  },
  jumpToURI() {
    URI = localStorage.getItem('currentUrl')
    URI && location.replace(URI)
  }
}
