import marked from 'marked'
import hljs from 'highlight.js'
// import jsLanguage from 'highlight.js/lib/languages/javascript'
// import cssLanguage from 'highlight.js/lib/languages/css'
import 'highlight.js/styles/vs2015.css'
import 'common/stylus/md-themes/github.css'

// hljs.registerLanguage('javascript', jsLanguage)
// hljs.registerLanguage('css', cssLanguage)

// highlight.js的同步高亮
marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false, // 只解析符合Markdown定义的
  gfm: true, // 启动类似Github样式的Markdown
  tables: true, // 支持Github形式的表格，必须打开gfm选项
  breaks: false, // 支持Github换行符
  sanitize: false, // 原始输出，忽略HTML标签
  smartLists: true, // 优化列表输出
  smartypants: false,
  xhtml: false
})
export default {
  marked,
  setCode(dom) {
    dom.querySelectorAll('pre code').forEach(x => {
      hljs.highlightBlock(x)
    })
  }
}
