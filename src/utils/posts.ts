import MarkdownIt from 'markdown-it'

export interface Post {
  slug: string
  title: string
  date: string
  words: number
  description: string
  tags: string[]
  content: string
}

// 用 import.meta.glob 在构建时把所有 .md 文件作为原始字符串导入
const mdModules = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// 简单的 frontmatter 解析（不依赖 gray-matter，避免浏览器兼容问题）
function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) {
    return { data: {}, content: raw }
  }

  const data: Record<string, any> = {}
  const lines = match[1].split('\n')
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    const key = line.slice(0, colonIndex).trim()
    let value: any = line.slice(colonIndex + 1).trim()

    // 解析数组：[标签1, 标签2]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    }

    data[key] = value
  }

  return { data, content: match[2] }
}

// 统计纯文本字数（去掉 HTML 标签和空白）
function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '')
  return text.length
}

// 解析所有文章
function parsePosts(): Post[] {
  const posts: Post[] = []

  for (const [path, raw] of Object.entries(mdModules)) {
    // 从路径提取 slug：../posts/hello-world.md → hello-world
    const slug = path.split('/').pop()?.replace(/\.md$/, '') || ''
    if (!slug) continue

    // 解析 frontmatter 和正文
    const { data, content } = parseFrontmatter(raw)
    const html = md.render(content)

    posts.push({
      slug,
      title: data.title || slug,
      date: data.date || '',
      words: countWords(html),
      description: data.description || content.replace(/\s+/g, ' ').slice(0, 80) + '...',
      tags: Array.isArray(data.tags) ? data.tags : [],
      content: html,
    })
  }

  // 按日期倒序排列
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export const posts: Post[] = parsePosts()

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}
