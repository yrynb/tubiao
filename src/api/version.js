/**
 * 预览组件接口
 */
import { getApiHandler, sprayPrefix } from './config'
const versionPrefix = sprayPrefix + '/component/componentVersion'
/**
 * 通过ID预览组件 gallery使用publishID,其他为ID
 * 参数 { string }
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const getByIdVersion = getApiHandler(versionPrefix + '/getById')
/**
 * 获取列表
 * 参数 { string }
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const getListVersion = getApiHandler(versionPrefix + '/getList')
