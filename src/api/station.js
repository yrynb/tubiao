/**
 * 中转站/资源 管理接口
 */
import { getApiHandler, sprayPrefix } from './config'
const stationPrefix = sprayPrefix + '/service/station'

/**
 * 分页获取中转站列表
 */
export const getStationPage = getApiHandler(stationPrefix + '/getPage')

/**
 * 保存或更新中转站
 */
export const saveStation = getApiHandler(stationPrefix + '/save')

/**
 * 取消中转
 */
export const cancelStation = getApiHandler(stationPrefix + '/cancel')
/**
 * 批量保存或更新中转站
 */
export const saveBatchStation = getApiHandler(stationPrefix + '/saveBatch')
