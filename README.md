# my-web-blog · 个人博客

基于 **Vue 3 + TypeScript + Vite + Vue Router** 的独立博客系统。
深色科技风、网络粒子背景、浅色 / 深色双态主题，完整响应式（含移动端），与主站风格统一但完全独立部署。

部署地址：**https://www.046699.xyz/blog/**

---
---

## 主要功能

- **文章列表**：卡片式布局，多列自适应，展示日期、字数、标题、摘要、标签。
- **全文搜索**：支持搜索标题、摘要、标签和正文，实时过滤并显示结果计数。
- **文章详情**：返回列表按钮、日期 + 字数（带图标）、标题、标签、HTML 正文渲染。
- **三态主题**：浅色 / 深色切换，与主站主题一致。
- **背景粒子**：网络节点粒子动画，按屏幕尺寸自适应数量。
- **侧边栏导航**：与主站完全一致（主页区 / 工作区 / 更多区 / 主题选择），除博客首页外其他链接跳转主站对应页面。
- **字体**：鸿蒙 Sans SC，已子集化并转为 woff2。
- **响应式**：桌面左侧固定侧边栏，移动端侧边栏折叠为汉堡按钮。

---
---

## 页面与路由

| 路径 | 页面 |
| --- | --- |
| `/` | 博客首页（文章列表 + 搜索） |
| `/post/:slug` | 文章详情页 |

> 部署在子路径 `/blog/` 下，实际访问地址为 `https://www.046699.xyz/blog/`

---
---

## 新增文章

所有文章数据集中在：**`src/data/posts.ts`**

在 `posts` 数组中添加一条即可，字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `slug` | string | 文章唯一标识，用于 URL（如 `hello-world`） |
| `title` | string | 文章标题 |
| `date` | string | 发布日期（如 `2026-10-02`） |
| `words` | number | 正文字数 |
| `description` | string | 文章摘要（列表页展示） |
| `tags` | string[] | 标签数组 |
| `content` | string | 文章正文（HTML 格式） |

新增文章后执行 `npm run build` 重新构建部署即可，**不影响主站**。

---
---

## 修改站点配置

侧边栏、品牌名、底部备案等配置集中在：**`src/site.config.ts`**

| 配置块 | 作用 |
| --- | --- |
| `brandIcon` / `brand` | 左上角图标与站点名 |
| `sidebar` | 侧边栏分组与导航（外部链接指向主站对应页面） |
| `contact` | 底部信息：GitHub / 邮箱 / B 站 / QQ 链接、页脚标语、ICP / 公安备案号 |

---
---

## 目录结构

```
my-web-blog/
├── index.html              # 入口：标题 / SEO / OG / favicon / 字体预载
├── vite.config.ts          # Vite 配置（base: '/blog/'）
├── esa.jsonc               # 阿里云 ESA Pages 构建配置
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router.ts           # 路由（/ → 列表，/post/:slug → 详情）
│   ├── site.config.ts      # ★ 侧边栏与站点配置在这里改
│   ├── style.css           # 全局样式：主题变量 / 颜色 / 卡片 / 响应式
│   ├── data/
│   │   └── posts.ts        # ★ 文章数据在这里改
│   ├── views/
│   │   ├── BPage.vue       # 博客列表页
│   │   └── PostPage.vue    # 文章详情页
│   ├── components/
│   │   ├── BlogList.vue    # 文章列表（搜索 + 卡片网格）
│   │   ├── SidebarNav.vue  # 侧边栏导航
│   │   ├── SiteNav.vue     # 顶部导航栏
│   │   └── ParticleBg.vue  # 粒子背景
│   └── composables/        # useMobileNav 等
└── public/
    ├── fonts/              # 子集化后的鸿蒙 Sans SC（woff2）
    ├── favicon.svg / favicon.png
    └── og-cover.jpg
```

---
---

## 更新记录     （新增；优化；修复；修改。）

- `26.10.02_1`  启动仓库。
- `26.10.02_2`  **修复：** 博客文章跳转打开新网页。
- `26.10.02_3`  **修复：** 博客文章路径 `dist/blog/`。
- `26.10.02_4`  **修复：** 侧边栏异常高亮。

---
---

## 部署

静态站点，无需服务端：

1. 本地执行 `npm run build` 生成 `dist/`；
2. 将产物推送到 GitHub 仓库 **MuWang04/my-web-blog**；
3. 由 **阿里云 ESA Pages** 绑定该仓库做静态托管：
   - 安装命令：`npm install`
   - 构建命令：`npm run build`
   - 静态资源目录：`./dist`
   - Node.js 版本：`22.x`
4. ESA 路由配置：前缀 `www` + 后缀 `blog*`，即 `www.046699.xyz/blog*`。

---
---

## 与主站的关系

| 项目 | 仓库 | 部署地址 | 说明 |
| --- | --- | --- | --- |
| 主站 | MuWang04/my-web | https://www.046699.xyz/ | 个人主页 / 项目展示 |
| 博客 | MuWang04/my-web-blog | https://www.046699.xyz/blog/ | 独立博客，与主站完全分离 |
| 3D 子站 | MuWang04/my-web-3d | https://3d.046699.xyz/ | 3D 工具与文档 |

博客更新文章只需重新构建博客项目，**不会触发主站重构**。
