import Vue from 'vue'
import Router from 'vue-router'
import { decodeURL, encodeURL } from 'common/js/util'
Vue.use(Router)
// 进行拆包，减少白屏时间
function loadView(viewPath) {
  return () => import(`@/pages/` + viewPath)
}
function loadViewC(viewPath) {
  return () => import(`@/components/scenes/` + viewPath)
}
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const router = new Router({
  base: 'conch',
  mode: 'history',
  routes: [
    { path: '/', redirect: '/main' },
    { path: '/gallery', component: loadView('Main') },
    { path: '/main', component: loadView('Example') },
    
    {
      path: '/resource',
      component: loadView('ResourceCenter'),
      redirect: '/resource/repository',
      children: [
        {
          path: 'repository',
          component: loadViewC('controller/MyResource'),
          meta: {
            messageList: [
              '朋友，这是您使用组件库开始的地方，组件使用过程中遇到问题可以“<a href="https://wiki.uino.com/book/61518cd1d7588a2ffde08415/book-cover.html" target="_blank" style="color: #007AFF;">戳 我</a>”。',
              '<em style="color: white; font-style: normal;">我的收藏：</em>存放的是您在图表市场中进行收藏的组件，您可以在右侧资源列表中左上角选择后批量下载使用，也可以单个下载使用。'
            ]
          }
        },
        {
          path: 'project',
          component: loadViewC('controller/MyProjects'),
          meta: {
            messageList: [
              '朋友，这是您使用组件库开始的地方，组件使用过程中遇到问题可以“<a href="https://wiki.uino.com/book/61518cd1d7588a2ffde08415/book-cover.html" target="_blank" style="color: #007AFF;">戳 我</a>”。',
              '<em style="color: white; font-style: normal;">我的项目：</em>这里记录的是您添加的项目，通过浏览项目也许您可以回忆出点什么。'
            ]
          }
        },
        {
          path: 'component',
          component: loadViewC('controller/MyComponents'),
          meta: {
            messageList: [
              '朋友，这是您使用组件库开始的地方，组件使用过程中遇到问题可以“<a href="https://wiki.uino.com/book/61518cd1d7588a2ffde08415/book-cover.html" target="_blank" style="color: #007AFF;">戳 我</a>”。',
              '<em style="color: white; font-style: normal;">我的组件：</em>这里记录的是您创建的组件，通过浏览组件也许您可以回忆出点什么。'
            ]
          }
        },
        {
          path: 'history',
          component: loadViewC('controller/DownloadHistory'),
          meta: {
            messageList: [
              '朋友，这是您使用组件库开始的地方，组件使用过程中遇到问题可以“<a href="https://wiki.uino.com/book/61518cd1d7588a2ffde08415/book-cover.html" target="_blank" style="color: #007AFF;">戳 我</a>”。',
              '<em style="color: white; font-style: normal;">下载历史：</em>这里记录的是您下载过的组件资源，通过浏览下载记录也许您可以回忆出点什么。'
            ]
          }
        }
      ]
    },
    { path: '/editor', component: loadView('Editor') },
    {
      path: '/cooperation',
      component: loadView('Cooperation'),
      meta: {
        isCooperation: true
      }
    },
    { path: '/previewComp', component: loadView('PreviewComp') },
    { path: '/previewSnapshot', component: loadView('PreviewSnapshot') }
  ]
})

router.beforeEach((to, from, next) => {
  if (window.location.href.includes('Authorization')) {
    const params = decodeURL()
    window.localStorage.setItem('Authorization', params.Authorization)
    delete params.Authorization
    window.location.href = encodeURL(params)
    return
  }
  next()
})

export default router
