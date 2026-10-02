export interface Post {
  slug: string
  title: string
  date: string
  words: number
  description: string
  tags: string[]
  rawContent: string  // 原始 Markdown，不预先渲染
}

// 用 import.meta.glob 在构建时把所有 .md 文件作为原始字符串导入（支持子文件夹分类）
const mdModules = import.meta.glob('../posts/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// 简单的 frontmatter 解析
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

// 统计纯文本字数（去掉 Markdown 语法符号）
function countWords(markdown: string): number {
  const text = markdown
    .replace(/^#{1,6}\s+/gm, '')       // 标题
    .replace(/\*\*(.+?)\*\*/g, '$1')    // 加粗
    .replace(/\*(.+?)\*/g, '$1')        // 斜体
    .replace(/`[^`]+`/g, '')            // 行内代码
    .replace(/```[\s\S]*?```/g, '')     // 代码块
    .replace(/!\[.*?\]\(.*?\)/g, '')    // 图片
    .replace(/\[(.+?)\]\(.*?\)/g, '$1') // 链接
    .replace(/^[-*+]\s+/gm, '')          // 列表
    .replace(/^>\s+/gm, '')              // 引用
    .replace(/<[^>]*>/g, '')             // HTML 标签
    .replace(/\s+/g, '')
  return text.length
}

// 解析所有文章（不渲染 Markdown，只解析 frontmatter）
function parsePosts(): Post[] {
  const posts: Post[] = []

  for (const [path, raw] of Object.entries(mdModules)) {
    // 从路径提取 slug：../posts/hello-world.md → hello-world
    // 子文件夹：../posts/nas/my-post.md → nas-my-post
    const slug = path.replace('../posts/', '').replace(/\.md$/, '').replace(/\//g, '-')
    if (!slug) continue

    const { data, content } = parseFrontmatter(raw)

    posts.push({
      slug,
      title: data.title || slug,
      date: data.date || '',
      words: countWords(content),
      description: data.description || content.replace(/\s+/g, ' ').slice(0, 80) + '...',
      tags: Array.isArray(data.tags) ? data.tags : [],
      rawContent: content,
    })
  }

  // 按日期倒序排列
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export const posts: Post[] = parsePosts()

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

// 动态导入 markdown-it 并渲染文章正文（只在详情页调用）
let mdRenderer: any = null

export async function renderPostContent(post: Post): Promise<string> {
  if (!mdRenderer) {
    const MarkdownIt = (await import('markdown-it')).default
    mdRenderer = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })
  }
  return mdRenderer.render(post.rawContent)
}
