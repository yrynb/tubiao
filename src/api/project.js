/**
 * 组件管理接口
 */
import { getApiHandler, sprayPrefix } from './config'
const projectPrefix = sprayPrefix + '/service/project'

/**
 * 获取项目列表
 * 参数 {
      "query": {
        "createTime": 0,
        "desc": "string",
        "designer": "string",
        "developer": "string",
        "endTime": "string",
        "id": "string",
        "member": "string",
        "modifyTime": 0,
        "name": "string",
        "owner": "string",
        "proStatus": 0,
        "startTime": "string",
        "status": 0,
        "tester": "string",
        "trade": "string",
        "type": 0
      },
      "sort": "string",
      "supplement": {
        "categories": {},
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
export const getProjectList = getApiHandler(projectPrefix + '/getList')
export const myProjects = getApiHandler(
  '/spray/component/personalComponent/myProjects'
)
/**
 * 获取项目列表
 * 参数 {
      "query": {
        "createTime": 0,
        "desc": "string",
        "designer": "string",
        "developer": "string",
        "endTime": "string",
        "id": "string",
        "member": "string",
        "modifyTime": 0,
        "name": "string",
        "owner": "string",
        "proStatus": 0,
        "startTime": "string",
        "status": 0,
        "tester": "string",
        "trade": "string",
        "type": 0
      },
      "sort": "string",
      "supplement": {
        "categories": {},
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
export const getProjectPage = getApiHandler(projectPrefix + '/getPage')

/**
 * 保存或更新项目
 * 参数 {
      "createTime": 0,
      "desc": "string",
      "designer": "string",
      "developer": "string",
      "endTime": "string",
      "id": "string",
      "member": "string",
      "modifyTime": 0,
      "name": "string",
      "owner": "string",
      "proStatus": 0,
      "startTime": "string",
      "status": 0,
      "tester": "string",
      "trade": "string",
      "type": 0
    }
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const saveProject = getApiHandler(projectPrefix + '/save')

/**
 * 通过ID删除项目
 * 参数 {
      "id": "string"
    }
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const deleteByIdProject = getApiHandler(projectPrefix + '/deleteById')
