/**
 * 组件管理接口
 */
import { getApiHandler, sprayPrefix } from './config'
const compPrefix = sprayPrefix + '/component/component'
/**
  * 获取组件数量
  * 参数: {
     "query"?: {
       "category": "string",
       "code": "string",
       "createTime": 0,
       "desc": "string",
       "hot": 0,
       "id": "string",
       "modifyTime": 0,
       "name": "string",
       "owner": "string",
       "snapshot": "string",
       "tag": "string",
       "type": "string"
     },
     "sort"?: "string"
   }
  * 返回值 {"code": 0,"data": 0,"message": "string"}
  */

export const getCompCount = getApiHandler(compPrefix + '/count')

/**
 * 通过ID删除组件
 * 参数: id(string)
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const deleteCompById = getApiHandler(compPrefix + '/deleteById')

/**
 * 通过ID复制组件
 * 参数: id(string)
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const copyCompById = getApiHandler(compPrefix + '/copy')

/**
 * 通过ID获取组件
 * 参数: id(string)
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const getCompById = getApiHandler(compPrefix + '/getById')
/**
  * 获取全部组件
  * 参数: {
     "query"?: {
       "category": "string",
       "code": "string",
       "createTime": 0,
       "desc": "string",
       "hot": 0,
       "id": "string",
       "modifyTime": 0,
       "name": "string",
       "owner": "string",
       "snapshot": "string",
       "tag": "string",
       "type": "string"
     },
     "sort"?: "string"
   }
  * 返回值 { "code": 200, "data": [{
     "category": "string",
     "code": "string",
     "createTime": 0,
     "desc": "string",
     "hot": 0,
     "id": "string",
     "modifyTime": 0,
     "name": "string",
     "owner": "string",
     "snapshot": "string",
     "tag": "string",
     "type": "string"
  }], "message": "string" }
  */
export const getCompList = getApiHandler(compPrefix + '/getList')
export const myLogs = getApiHandler('/spray/component/personalComponent/myLogs')
export const getCompListByGroup = getApiHandler(compPrefix + '/getListByGroup')
/**
  * 分页获取组件列表
  * 参数: {
     "size": 0, // 每页的数量
     "page": 0, // 当前页数
     "query"?: {
       "category": "string",
       "code": "string",
       "createTime": 0,
       "desc": "string",
       "hot": 0,
       "id": "string",
       "modifyTime": 0,
       "name": "string",
       "owner": "string",
       "snapshot": "string",
       "tag": "string",
       "type": "string"
     },
     "sort"?: "string"
   }
  * 返回值 { "code": 200, "data": [{
     "category": "string",
     "code": "string",
     "createTime": 0,
     "desc": "string",
     "hot": 0,
     "id": "string",
     "modifyTime": 0,
     "name": "string",
     "owner": "string",
     "snapshot": "string",
     "tag": "string",
     "type": "string"
  }], "message": "string" }
  */
export const getCompListByPage = getApiHandler(compPrefix + '/getPage')
export const getCompListByAgg = getApiHandler(compPrefix + '/getAggPage')
export const mystars = getApiHandler(
  '/spray/component/personalComponent/myStars'
)
export const myComponents = getApiHandler(
  '/spray/component/personalComponent/myComponents'
)
/**
  * 保存或更新组件
  * 参数：{
     "category": "string", // 一级分类
     "code": "string", // 组件代码
     "desc": "string", // 组件描述
     "id"?: "string", // 组件id（保存时为空，更新时要有）
     "name": "string", // 组件名称
     "snapshot": "string", // 组件截图
     "tag": "string", // 组件标签（关键字）
     "type": "string" // 二级分类
     "config": "string"
   }
  * 返回值 { "code": 200, "data": {}, "message": "string" }
  */
export const saveComp = getApiHandler(compPrefix + '/save')
export const compileComp = getApiHandler(sprayPrefix + '/compile')

export const downloadComps = getApiHandler(compPrefix + '/download')

// 获取资源数据
export const getResourceList = getApiHandler(compPrefix + '/resource')

// 获取资源数据
export const publishComp = getApiHandler(compPrefix + '/publish')

export const cooperationComp = getApiHandler(compPrefix + '/cooperation')
