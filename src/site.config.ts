/**
 * 站点配置 —— 博客
 * 侧边栏导航与主站保持一致，链接指向主站对应页面
 */
export interface SidebarGroup {
  title?: string
  items: (
    | { label: string; icon?: string; href: string }
    | { type: 'theme' }
    | {
        type: 'submenu'
        label: string
        icon?: string
        items: { label: string; icon?: string; href: string }[]
      }
  )[]
}

const MAIN = 'https://www.046699.xyz'

export const site = {
  brandIcon: '</>',
  brand: '~ 爱折腾的 MuWang ~',

  sidebar: [
    {
      title: '主页区',
      items: [
        { label: '首页', icon: '🏠', href: `${MAIN}/` },
        { label: '关于', icon: '🪪', href: `${MAIN}/homepage` },
        { label: '技能', icon: '🪛', href: `${MAIN}/homepage` },
        { label: '博客', icon: '📝', href: '/' },
        { label: '联系', icon: '✉️', href: `${MAIN}/contact` },
      ],
    },
    {
      title: '工作区',
      items: [
        { label: '搭建项目', icon: '💾', href: `${MAIN}/projects` },
        { label: '3D 建模打印', icon: '❇️', href: `${MAIN}/modeling_printing` },
      ],
    },
    {
      title: '更多区',
      items: [
        { label: '网站归档', icon: '🌐', href: `${MAIN}/website` },
        { label: '问题反馈', icon: '📝', href: `${MAIN}/feedback` },
      ],
    },
    {
      items: [{ type: 'theme' }],
    },
    {
      title: '测试区',
      items: [],
    },
  ] as SidebarGroup[],

  contact: {
    gitHub: 'https://github.com/MuWang04',
    email: 'email',
    bilibili: 'bilibili',
    qq: 'qq',
    footerNote: '以折腾为乐 · 用代码解决问题',
    icp: '浙ICP备2026078780号-1',
    policeIcp: '浙公网安备33010502013556号',
  },

  builtWith: '',
}
