/**
 * 博客文章数据
 * 新增文章时，在这里添加一条即可
 */
export interface Post {
  slug: string
  title: string
  date: string
  words: number
  description: string
  tags: string[]
  content: string // HTML 格式的文章正文
}

export const posts: Post[] = [
  {
    slug: 'hello-world',
    title: '你好，博客',
    date: '2026-10-02',
    words: 353,
    description: '博客开张第一篇，记录这个博客是怎么搭起来的，以及以后打算写些什么。',
    tags: ['日志', '站点'],
    content: `
<h2>前言</h2>
<p>这是博客的第一篇文章。在这里记录折腾的过程，分享技术与生活。</p>
<h2>关于这个博客</h2>
<p>这个博客集成在主站里，用 Vue 3 实现，文章数据集中管理。</p>
<ul>
<li>文章列表支持搜索</li>
<li>卡片式布局，和主站风格统一</li>
<li>新增文章只需在数据文件里添加一条</li>
</ul>
<h2>以后打算写什么</h2>
<p>主要会写这些方向：</p>
<ul>
<li>NAS 与自托管折腾记录</li>
<li>3D 打印与建模实践</li>
<li>嵌入式开发（ESP32 等）</li>
<li>Web 前端与 UI 精细化</li>
<li>硬件维修与改造</li>
</ul>
<p>博客会持续更新，慢慢来。</p>
    `,
  },
]
