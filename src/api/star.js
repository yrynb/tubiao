/**
 * 收藏接口
 */
import { getApiHandler, sprayPrefix } from './config'
// const starPrefix = sprayPrefix + '/service/star'
const starPrefix = sprayPrefix + '/service/star'
/**
 * 取消收藏
 * 参数 {
    "createTime": 0,
    "id": "string",
    "modifyTime": 0,
    "owner": "string",
    "pid": "string",
    "sType": 0,
    "sid": "string",
    "status": 0
  }
  * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const cancelStar = getApiHandler(starPrefix + '/cancel')
/**
 * 批量取消收藏
 * 参数 {
    "createTime": 0,
    "id": "string",
    "modifyTime": 0,
    "owner": "string",
    "pid": "string",
    "sType": 0,
    "sid": "string",
    "status": 0
  }
  * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const cancelBatchStar = getApiHandler(starPrefix + '/cancelBatch')
/**
 * 通过page获取列表
 * 参数: {
      "page": 0,
      "query": {
        "createTime": 0,
        "id": "string",
        "modifyTime": 0,
        "owner": "string",
        "pid": "string",
        "sType": 0,
        "sid": "string",
        "status": 0
      },
      "size": 0,
      "sort": "string",
      "supplement": {
        "categories": {},
        "hiddenChildren": true,
        "ids": {},
        "pids": {},
        "proStatus": {},
        "sid": "string",
        "state": 0,
        "trades": {},
        "types": {}
      }
    }
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const getStarListByPage = getApiHandler(starPrefix + '/getPage')
/**
 * 保存或更新
 * 参数 {
    "createTime": 0,
    "id": "string",
    "modifyTime": 0,
    "owner": "string",
    "pid": "string",
    "sType": 0,
    "sid": "string",
    "status": 0
    }
  * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const saveStar = getApiHandler(starPrefix + '/save')
/**
 * 批量保存
 * 参数 {
    "createTime": 0,
    "id": "string",
    "modifyTime": 0,
    "owner": "string",
    "pid": "string",
    "sType": 0,
    "sid": "string",
    "status": 0
    }
  * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const saveBatchStar = getApiHandler(starPrefix + '/saveBatch')
