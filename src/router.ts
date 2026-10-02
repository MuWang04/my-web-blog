import { createRouter, createWebHistory } from 'vue-router'

import BPage from './views/BPage.vue'
import PostPage from './views/PostPage.vue'

const BASE_TITLE = 'MuWang 的博客'
const BASE_DESC = '记录折腾的过程，分享技术与生活'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'blog',
      component: BPage,
      meta: {
        title: '博客 · MuWang',
        description: 'MuWang 的博客：记录折腾的过程，分享技术与生活。',
      },
    },
    {
      path: '/:slug',
      name: 'post',
      component: PostPage,
      meta: {
        title: '文章 · MuWang',
        description: '博客文章详情页。',
      },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, top: 72, behavior: 'smooth' }
    }
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// 切换路由后同步：浏览器标签标题、页面描述
const upsertMeta = (
  selector: string,
  attr: 'property' | 'name',
  key: string,
  content: string,
) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

router.afterEach((to) => {
  const title = (to.meta.title as string) || BASE_TITLE
  const desc = (to.meta.description as string) || BASE_DESC

  document.title = title

  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'description'
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', desc)

  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', desc)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', `https://www.046699.xyz/blog${to.fullPath}`)
})

export default router
