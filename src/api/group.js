/**
 * 组件管理接口
 */
import { getApiHandler, sprayPrefix } from './config'
const groupPrefix = sprayPrefix + '/service/group'

export const deleteGroupById = getApiHandler(groupPrefix + '/deleteById')

export const getGroupById = getApiHandler(groupPrefix + '/getById')
export const getGroupList = getApiHandler(groupPrefix + '/getList')
export const saveGroup = getApiHandler(groupPrefix + '/save')

export const addToGroup = getApiHandler(groupPrefix + '/add')
export const removeToGroup = getApiHandler(groupPrefix + '/remove')
