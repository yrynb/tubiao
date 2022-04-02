import { notification } from 'ant-design-vue'
import { OPEN_COMP } from 'common/js/event-types'
import bus from 'common/js/eventBus'

const externalHandle = {
  getImportList() {
    return (
      this.comp.code.match(/import (.*?) from ('|")(.*?)('|")(.*?)\n/g) || []
    )
  },
  /**
   * 添加额外的 js 库
   * @param {*} name js库名字
   */
  addCompScript(name) {
    if (!name) return
    if (name.endsWith('.js')) {
      name = name.slice(0, name.length - 3)
    }

    const list = this.getImportList()
    let newName = name.replace(/\./g, '')

    const dirty = ['@', '=', '-', '+']

    dirty.forEach(item => {
      if (newName.includes(item)) {
        const nameList = newName.split(item)
        newName = nameList.join('')
      }
    })

    let temp = newName.split('')
    let index = 0
    for (index = 0; index < temp.length; index++) {
      if (isNaN(parseInt(temp[index]))) {
        break
      }
    }

    if (index > 0) {
      newName = newName.slice(index)
    }

    const newScript = `import ${newName || name} from 'lib/${name}'\n`
    if (
      list.some(k => k.includes(`'lib/${name}'`) || k.includes(`"lib/${name}"`))
    ) {
      notification.info({
        message: '不可重复添加'
      })
      return
    }
    let code = this.comp.code
    if (list.length > 0) {
      const lastItem = list[list.length - 1]
      let index = code.indexOf(lastItem) + lastItem.length
      code = code.slice(0, index) + newScript + code.slice(index)
    } else {
      code = newScript + code
    }
    this.updateCompProps('code', code)
    bus.$emit(OPEN_COMP)
  },
  /**
   * 添加额外的 css 库
   * @param {*} name css库名字
   */
  addCompCss(name) {
    if (!name) return
    if (name.endsWith('.css')) {
      name = name.slice(0, name.length - 4)
    }

    const list = this.getImportList()

    let newName = name.replace(/\./g, '')

    const dirty = ['@', '=', '-', '+']

    dirty.forEach(item => {
      if (newName.includes(item)) {
        const nameList = newName.split(item)
        newName = nameList.join('')
      }
    })

    let temp = newName.split('')
    let index = 0
    for (index = 0; index < temp.length; index++) {
      if (isNaN(parseInt(temp[index]))) {
        break
      }
    }

    if (index > 0) {
      newName = newName.slice(index)
    }

    const newCss = `import ${newName || name} from 'css/${name}'\n`
    if (
      list.some(k => k.includes(`'css/${name}'`) || k.includes(`"css/${name}"`))
    ) {
      notification.info({
        message: '不可重复添加'
      })
      return
    }
    let code = this.comp.code
    if (list.length > 0) {
      const lastItem = list[list.length - 1]
      let index = code.indexOf(lastItem) + lastItem.length
      code = code.slice(0, index) + newCss + code.slice(index)
    } else {
      code = newCss + code
    }

    this.updateCompProps('code', code)
    bus.$emit(OPEN_COMP)
  },
  addCompImg(item) {
    if (this.comp.code.includes(`import I${item.id} from`)) {
      notification.info({ message: '请勿重复添加图片' })
      return
    }
    let code = `import I${item.id} from '${item.url.replace(
      '/s-static/',
      ''
    )}'// ${item.displayName}\n${this.comp.code}`
    this.updateCompProps('code', code)
    bus.$emit(OPEN_COMP)
  },
  _getUtilLib(code) {
    const reg = /import {(.*?)} from ('|")util\/(.*?)('|")/g
    return reg.exec(code)
  },
  getUtilLib() {
    let code = this.comp.code
    let result = this._getUtilLib(code)
    if (Array.isArray(result) && typeof result[1] === 'string') {
      return result[1].split(',').map(item => item.trim())
    }
    return []
  },
  addUtilLib(utils) {
    let code = this.comp.code
    let result = this._getUtilLib(code)
    utils = utils.map(item => item.value).join(', ')
    if (Array.isArray(result) && typeof result[0] === 'string') {
      code = code.replace(result[0], `import { ${utils} } from 'util/util'`)
    } else {
      code = `import { ${utils} } from 'util/util'\n${code}`
    }
    this.updateCompProps('code', code)
    bus.$emit(OPEN_COMP)
  },
  addCompFont({ psName, file }) {
    let title = file.split('.')[0]
    if (title) title = title.replace(/-/g, '')
    if (this.comp.code.includes(`import ${title} from`)) {
      notification.info({ message: '请勿重复添加字体' })
      return
    }
    let code = `import ${title} from 'fonts/${file}&&${psName}'// font-family:'${psName}'\n${this.comp.code}`
    this.updateCompProps('code', code)
    bus.$emit(OPEN_COMP)
  }
}

export default externalHandle
