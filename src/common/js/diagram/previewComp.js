import diagramHandle from './diagramHandle'
import { loadDiagramScript } from 'common/js/util'
import comp from './index'

const compHandle = {
  comp: null,
  async useById(compId, dom) {
    // 加载 base
    await loadDiagramScript({ id: 'base', src: `/spray/compile` })
    // 加载 comp
    await loadDiagramScript({
      id: 'comp',
      src: `/s-static/component/${compId}.js`
    })
  },

  changeDoc(doc, id) {
    doc = this._changeDoc(doc, id)
    if (id && doc) {
      let list = ['sid', 'publishId', 'id']
      list.forEach(k => {
        k = this.comp[k]
        if (k !== id && doc.includes(k)) {
          doc = doc.replace(new RegExp(k, 'gm'), id)
          // doc = doc.replaceAll(k, id)
        }
      })
    }
    return doc
  }
}
export default Object.assign({}, diagramHandle, compHandle, {
  getCompData: comp.getCompData,
  parseConfig: comp.parseConfig,
  _changeDoc: comp.changeDoc,
  getDefaultConfig: comp.getDefaultConfig
})
