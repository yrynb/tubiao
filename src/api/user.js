/**
 * 用户管理接口
 */
import { getApiHandler, sprayPrefix } from './config'
const userPrefix = sprayPrefix + '/auth/user'

/**
 * 用户登陆
 */
export const userLogin = getApiHandler(userPrefix + '/login')
/**
 * 获取用户信息
 */
export const getUserInfo = getApiHandler(userPrefix + '/getInfo')
