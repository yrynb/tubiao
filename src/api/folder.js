/**
 * 组件管理接口
 */
import { getApiHandler, sprayPrefix } from './config'
const folderPrefix = sprayPrefix + '/service/folder'

/**
 * 取消文件夹
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
export const cancelFolder = getApiHandler(folderPrefix + '/cancel')

/**
 * 保存或更新文件夹
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
export const saveFolder = getApiHandler(folderPrefix + '/save')

/**
 * 保存或更新文件夹
 * 参数 {
      "pid": "string",
      "sType": 0,
      "sids": [
        "string"
      ]
    }
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const saveBatchFolder = getApiHandler(folderPrefix + '/saveBatch')
