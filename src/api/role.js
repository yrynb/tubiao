/**
 * 权限接口管理
 */
import { getApiHandler, sprayPrefix } from './config'
const rolePrefix = sprayPrefix + '/auth/role'

/**
 * 通过ID删除权限
 * 参数: id(string)
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const deleteRoleById = getApiHandler(rolePrefix + '/deleteById')
/**
 * 通过ID获取权限
 * 参数: id(string)
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const getRoleById = getApiHandler(rolePrefix + '/getById')
/**
 * 获取权限列表
 * 参数: {
    "query"?: {
      "createTime": 0,
      "download": true,
      "edit": true,
      "id": "string",
      "userName": "string"
    },
    "sort"?: "string"
  }
 * 返回值 { "code": 200, "data": [{
      "createTime": 0,
      "download": true,
      "edit": true,
      "id": "string",
      "userName": "string"
    }], "message": "string" }
 */
export const getRoleList = getApiHandler(rolePrefix + '/getList')
/**
 * 分页获取权限列表
 * 参数: {
    "size": 0, // 每页的数量
    "page": 0, // 当前页数
    "query"?: {
      "createTime": 0,
      "download": true,
      "edit": true,
      "id": "string",
      "userName": "string"
    },
    "sort"?: "string"
  }
 * 返回值 { "code": 200, "data": [{
    "createTime": 0,
    "download": true,
    "edit": true,
    "id": "string",
    "userName": "string"
  }], "message": "string" }
 */
export const getRoleListByPage = getApiHandler(rolePrefix + '/getPage')
/**
 * 保存或更改权限
 * 参数：{
    "download": true, // 能否下载
    "edit": true, // 能否编辑
    "id": "string", // id
    "userName": "string" // 用户名称
  }
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const saveRole = getApiHandler(rolePrefix + '/save')
