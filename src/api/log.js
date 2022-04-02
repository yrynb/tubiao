/**
 * 日志管理接口
 */
import { getApiHandler, sprayPrefix } from './config'
const userPrefix = sprayPrefix + '/service/log'

/**
 * 分页获取下载内容
 */
export const getLogContentPage = getApiHandler(userPrefix + '/getContent')
