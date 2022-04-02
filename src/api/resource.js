/**
 * 图片管理接口
 */
import { getApiHandler, sprayPrefix } from './config'
const resourcePrefix = sprayPrefix + '/common/resource'

/**
 * 保存或更新图片
   参数： file
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const saveImg = getApiHandler(resourcePrefix + '/save', {
  headers: { 'Content-Type': 'multipart/form-data' }
})

export const getImgList = getApiHandler(resourcePrefix + '/getList')
/**
 * 通过ID删除图片
 * 参数: id(string)
 * 返回值 { "code": 200, "data": {}, "message": "string" }
 */
export const deleteImgById = getApiHandler(resourcePrefix + '/deleteById')

export const getStaticList = getApiHandler(resourcePrefix + '/getNames')

export const getExternalData = getApiHandler(
  resourcePrefix + '/getExternalData'
)

export const getImgListByGroup = getApiHandler(
  resourcePrefix + '/getListByGroup'
)
export const getFonts = getApiHandler(resourcePrefix + '/getFonts')
export const getImgUpdate = getApiHandler(resourcePrefix + '/update')
