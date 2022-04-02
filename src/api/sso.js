/**
 * 用户管理接口
 */
import { getApiHandler, sprayPrefix } from './config'
const ssoPrefix = sprayPrefix + '/auth/oauth2'

/**
 * sso登陆
 */
export const getClientInfo = getApiHandler(ssoPrefix + '/getClientInfo/conch', {
  method: 'get'
})

/**
 * 获取sso token
 */
export const ssoToken = getApiHandler(ssoPrefix + '/token/conch')
/**
 * 刷新sso token
 */
export const refreshToken = getApiHandler(ssoPrefix + '/refresh/conch')
/**
 * 退出登录 logout
 */
export const logout = getApiHandler(ssoPrefix + '/logout/conch')
export { getApiHandler }
