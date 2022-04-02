/**
 * 属性接口管理
 */
import { getApiHandler, sprayPrefix } from './config'
const propPrefix = sprayPrefix + '/common/prop'

/**
 * 通过ID删除属性
 * 参数: id(string)
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const deletePropById = getApiHandler(propPrefix + '/deleteById')
/**
 * 通过ID获取属性
 * 参数: id(string)
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const getPropById = getApiHandler(propPrefix + '/getById')
/**
 * 获取属性列表
 * 参数: {
    "query"?: {
      "desc": "string",
      "display": "string",
      "id": "string",
      "name": "string",
      "type": "string",
      "value": "string"
    },
    "sort"?: "string"
  }
 * 返回值 { "code": 200, "data": [{
    "desc": "string",
    "display": "string",
    "id": "string",
    "name": "string",
    "type": "string",
    "value": "string"
  }], "message": "string" }
 */
export const getPropList = getApiHandler(propPrefix + '/getList')
/**
 * 分页获取属性列表
 * 参数: {
    "size": 0, // 每页的数量
    "page": 0, // 当前页数
    "query"?: {
      "desc": "string",
      "display": "string",
      "id": "string",
      "name": "string",
      "type": "string",
      "value": "string"
    },
    "sort"?: "string"
  }
 * 返回值 { "code": 200, "data": [{
    "desc": "string",
    "display": "string",
    "id": "string",
    "name": "string",
    "type": "string",
    "value": "string"
  }], "message": "string" }
 */
export const getPropListByPage = getApiHandler(propPrefix + '/getPage')
/**
 * 保存或更自定义属性
 * 参数：{
    "desc": "string",
    "id": "string", // id
    "name": "string", // 属性名称
    "type": "string", // 属性类型
    "value": "string" // 标识字段
  }
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const saveProp = getApiHandler(propPrefix + '/save')
