<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { site, type SidebarGroup } from '../site.config'
import {
  mobileNavOpen,
  closeMobileNav,
} from '../composables/useMobileNav'
import {
  setTheme,
  getTheme,
  resetThemeToDefault,
  THEME_REMEMBER_MS,
  THEME_ICONS,
  THEME_LABELS,
  THEME_ORDER,
  type ThemeMode,
} from '../theme'

const groups = site.sidebar
const year = new Date().getFullYear()
const active = ref('top')
const theme = ref<ThemeMode>(getTheme())
const activeIndex = computed(() => THEME_ORDER.indexOf(theme.value))

// 可折叠分组：测试区，默认折叠
const COLLAPSIBLE_TITLES = new Set(['测试区'])
const collapsedGroups = ref<Record<string, boolean>>({ 测试区: true })
const isCollapsible = (title?: string) => !!title && COLLAPSIBLE_TITLES.has(title)
const isCollapsed = (title: string) => !!collapsedGroups.value[title]
const toggleGroup = (title: string) => {
  collapsedGroups.value[title] = !collapsedGroups.value[title]
}

const clock = ref('--')
const respTime = ref('--')
const loadTime = ref('--')
let clockTimer: number | undefined
let pingTimer: number | undefined

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function formatMs(ms: number): string {
  return (Math.round(ms * 10) / 10).toFixed(1)
}

function updateClock() {
  const d = new Date()
  clock.value =
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ` +
    `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

/** 页面加载总耗时（navigationStart → loadEventEnd），load 未完成时延迟重试 */
function updateLoadTime(): boolean {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    if (nav && nav.loadEventEnd > 0) {
      loadTime.value = formatMs(nav.loadEventEnd - nav.startTime)
      return true
    }
  } catch {
    /* 忽略 */
  }
  setTimeout(updateLoadTime, 500)
  return false
}

async function measureLatency() {
  try {
    const t0 = performance.now()
    const sep = location.search ? '&' : '?'
    await fetch(`${location.pathname}${sep}ping=${Date.now()}`, {
      cache: 'no-store',
    })
    respTime.value = formatMs(performance.now() - t0)
  } catch {
    respTime.value = '--'
  }
}

const route = useRoute()
const router = useRouter()

// 手动选择 10 分钟后自动回到默认深色（页面持续打开期间也生效）
let themeResetTimer: number | undefined

const onPickTheme = (mode: ThemeMode, e: MouseEvent) => {
  // 圆形释放动画以被点击格子的中心为扩散起点
  let x = innerWidth / 2
  let y = innerHeight / 2
  const btn = e.currentTarget as HTMLElement | null
  if (btn) {
    const r = btn.getBoundingClientRect()
    x = r.left + r.width / 2
    y = r.top + r.height / 2
  }
  theme.value = setTheme(mode, { x, y })
  if (themeResetTimer !== undefined) window.clearTimeout(themeResetTimer)
  themeResetTimer = window.setTimeout(() => {
    theme.value = resetThemeToDefault()
  }, THEME_REMEMBER_MS)
}

const isTheme = (
  it: SidebarGroup['items'][number],
): it is { type: 'theme' } => 'type' in it && it.type === 'theme'

type RenderItem =
  | { kind: 'link'; label: string; icon?: string; href: string }
  | { kind: 'theme' }
  | {
      kind: 'submenu'
      label: string
      icon?: string
      items: { label: string; icon?: string; href: string }[]
    }

const renderGroups = groups.map((g) => ({
  title: g.title,
  items: g.items.map((it) =>
    isTheme(it)
      ? ({ kind: 'theme' } as const)
      : 'type' in it && it.type === 'submenu'
        ? ({
            kind: 'submenu',
            label: it.label,
            icon: it.icon,
            items: it.items,
          } as const)
        : ({ kind: 'link', ...it } as const),
  ),
})) as { title?: string; items: RenderItem[] }[]

/* 组内可展开子菜单（如：工具区 / 3D工具），默认折叠 */
const submenuOpen = ref<Record<string, boolean>>({})
const toggleSubmenu = (key: string) => {
  submenuOpen.value[key] = !isSubmenuOpen(key)
}
const isSubmenuOpen = (key: string) => submenuOpen.value[key] ?? false

const spyIds = ['top', 'about', 'skills', 'contact']

const onScroll = () => {
  let cur = 'top'
  for (const id of spyIds) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= 140) cur = id
  }
  active.value = cur
}

// 侧边栏链接高亮判断：href 为 '/' 的首页链接在所有内部页面都高亮
const isLinkActive = (href: string) => {
  if (href.startsWith('/')) {
    if (href === '/') return true // 博客首页链接：所有博客页面都高亮
    return route.path === href.split('#')[0]
  }
  return href === '#' + active.value
}

const go = (href: string) => {
  closeMobileNav()
  // 外部链接：当前窗口打开
  if (href.startsWith('http')) {
    window.location.href = href
    return
  }
  if (href.startsWith('/')) {
    router.push(href)
    return
  }
  if (route.path !== '/') {
    router.push({ path: '/', hash: href })
    return
  }
  if (href === '#top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}

watch(
  () => route.path,
  () => {
    closeMobileNav()
    if (route.path === '/') onScroll()
    else active.value = route.path.slice(1)
  },
)

// 抽屉打开期间锁定背景滚动；切到桌面尺寸时自动收起
watch(mobileNavOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMobileNav()
}

const onResize = () => {
  if (window.innerWidth >= 1200) closeMobileNav()
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
  onScroll()
  if (route.path !== '/') active.value = route.path.slice(1)
  updateClock()
  clockTimer = window.setInterval(updateClock, 1000)
  measureLatency()
  pingTimer = window.setInterval(measureLatency, 30000)
  updateLoadTime()
})
onBeforeUnmount(() => {
  if (themeResetTimer !== undefined) window.clearTimeout(themeResetTimer)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
  if (clockTimer !== undefined) window.clearInterval(clockTimer)
  if (pingTimer !== undefined) window.clearInterval(pingTimer)
})
</script>

<template>
  <div
    class="side-backdrop"
    :class="{ 'is-open': mobileNavOpen }"
    @click="closeMobileNav"
  ></div>
  <aside class="sidebar" :class="{ 'is-open': mobileNavOpen }">
    <button
      class="side-close"
      type="button"
      aria-label="关闭导航菜单"
      @click="closeMobileNav"
    >
      ✕
    </button>
    <div v-for="(g, gi) in renderGroups" :key="g.title || 'g' + gi" class="side-group">
      <button
        v-if="g.title && isCollapsible(g.title)"
        type="button"
        class="side-group-head"
        :aria-expanded="!isCollapsed(g.title)"
        @click="toggleGroup(g.title)"
      >
        <span>{{ g.title }}</span>
        <span
          class="side-group-chevron"
          :class="{ 'is-collapsed': isCollapsed(g.title) }"
          aria-hidden="true"
        >
          ▾
        </span>
      </button>
      <div v-else-if="g.title" class="side-group-title">{{ g.title }}</div>
      <div
        class="side-collapse"
        :class="{
          'is-collapsed': !!g.title && isCollapsible(g.title) && isCollapsed(g.title),
        }"
      >
      <nav class="side-items">
        <template v-for="(item, ii) in g.items" :key="g.title + '-' + ii">
          <div v-if="item.kind === 'theme'" class="theme-row">
            <span class="theme-row-label">主题选择</span>
            <div
              class="theme-seg"
              role="group"
              aria-label="主题模式切换"
              :style="{ '--i': activeIndex }"
            >
              <span class="theme-seg-thumb" aria-hidden="true"></span>
              <button
                v-for="m in THEME_ORDER"
                :key="m"
                type="button"
                class="theme-seg-btn"
                :class="{ 'is-active': theme === m }"
                :aria-pressed="theme === m"
                :aria-label="THEME_LABELS[m] + '模式'"
                :title="THEME_LABELS[m] + '模式'"
                @click="onPickTheme(m, $event)"
              >
                <span class="theme-seg-icon">{{ THEME_ICONS[m] }}</span>
              </button>
            </div>
          </div>
          <div v-else-if="item.kind === 'submenu'" class="side-submenu">
            <button
              type="button"
              class="side-item side-submenu-head"
              :aria-expanded="isSubmenuOpen(g.title + '/' + item.label)"
              @click="toggleSubmenu(g.title + '/' + item.label)"
            >
              <span v-if="item.icon" class="side-item-icon">{{ item.icon }}</span>
              <span class="side-item-label">{{ item.label }}</span>
              <span
                class="side-submenu-chevron"
                :class="{ 'is-open': isSubmenuOpen(g.title + '/' + item.label) }"
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
            <div
              class="side-submenu-body"
              :class="{ 'is-open': isSubmenuOpen(g.title + '/' + item.label) }"
            >
              <div class="side-submenu-inner">
                <a
                  v-for="child in item.items"
                  :key="child.href"
                  :href="child.href"
                  class="side-item side-submenu-item"
                  :class="{
                    'is-active': isLinkActive(child.href),
                  }"
                  @click.prevent="go(child.href)"
                >
                  <span v-if="child.icon" class="side-item-icon">{{ child.icon }}</span>
                  <span class="side-item-label">{{ child.label }}</span>
                </a>
              </div>
            </div>
          </div>
          <a
            v-else
            :href="item.href"
            class="side-item"
            :class="{
              'is-active': isLinkActive(item.href),
            }"
            @click.prevent="go(item.href)"
          >
            <span v-if="item.icon" class="side-item-icon">{{ item.icon }}</span>
            <span class="side-item-label">{{ item.label }}</span>
          </a>
        </template>
      </nav>
      </div>
    </div>
    <div class="side-footer-note">{{ site.contact.footerNote }}</div>

    <div class="side-footer-bottom">
      <div class="side-status">
        <div class="status-row status-clock">🕐 {{ clock }}</div>
        <div class="status-row status-latency">[响应时间: {{ respTime }}ms 加载时间: {{ loadTime }}ms]</div>
      </div>
      <div v-if="site.contact.icp || site.contact.policeIcp" class="side-beian">
        <a
          v-if="site.contact.icp"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="side-beian-link"
        ><span class="side-beian-icp" aria-hidden="true"></span>{{ site.contact.icp }}</a>
        <a
          v-if="site.contact.policeIcp"
          href="https://beian.mps.gov.cn/#/query/webSearch?code"
          target="_blank"
          rel="noopener noreferrer"
          class="side-beian-link"
        ><img class="side-beian-shield" src="/beian-police.png" alt="">{{ site.contact.policeIcp }}</a>
      </div>
      <p class="side-copy">Copyright © {{ year }} {{ site.name }} · 046699.xyz</p>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-w);
  padding: calc(var(--nav-h) + 10px) 16px 24px;
  overflow-y: auto;
  z-index: 200;
  border-right: 1px solid var(--card-border);
  background: var(--sidebar-bg);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  visibility: hidden;
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear 0.32s, box-shadow 0.32s;
  box-shadow: none;
}

.sidebar.is-open {
  transform: translateX(0);
  visibility: visible;
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s;
  box-shadow: 24px 0 60px -20px rgba(0, 0, 0, 0.6);
}

/* 抽屉遮罩：仅窄屏。用 100vw 而非 inset:0，盖满 scrollbar-gutter 预留槽，避免右侧亮条 */
.side-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100vw;
  z-index: 150;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.32s ease, visibility 0s linear 0.32s;
}

.side-backdrop.is-open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.32s ease, visibility 0s;
}

/* 抽屉内关闭按钮：仅窄屏 */
.side-close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 18px;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
}

.side-close:active {
  background: var(--white-06);
  color: var(--text);
}

@media (min-width: 1200px) {
  .sidebar {
    top: 0;
    width: var(--sidebar-w);
    padding: calc(var(--nav-h) + 10px) 16px 24px;
    z-index: 90;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    transform: none;
    visibility: visible;
    transition: none;
    box-shadow: none;
  }

  .side-backdrop,
  .side-close {
    display: none;
  }
}

.side-footer-note {
  padding: 14px 10px 0;
  border-top: 1px solid var(--card-border);
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-faint);
  transition: opacity 0.25s ease;
}

/* 主题选择：左侧文字 + 右侧图标两格（浅色 / 深色） */
.theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 6px 6px 10px;
  min-height: 48px;
}

.theme-row-label {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-dim);
  white-space: nowrap;
}

.theme-seg {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 40px);
  gap: 3px;
  padding: 3px;
  border-radius: 11px;
  background: var(--white-04);
  border: 1px solid var(--card-border);
  flex-shrink: 0;
}

/* 滑动高亮块：按当前激活索引 --i(0/1) 平滑滑动 */
.theme-seg-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 40px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent), #0ea5a0);
  box-shadow: 0 4px 12px -5px rgba(45, 212, 191, 0.6);
  transform: translateX(calc(var(--i, 0) * (100% + 3px)));
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-seg-btn {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 34px;
  padding: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-dim);
  font-family: var(--font);
  transition: color 0.2s;
}

.theme-seg-icon {
  font-size: 16px;
  line-height: 1;
}

.theme-seg-btn:active {
  color: var(--text);
}

.theme-seg-btn.is-active {
  color: #04211d;
}

.side-footer-bottom {
  margin-top: auto;
  padding: 14px 10px 0;
  border-top: 1px solid var(--card-border);
  font-size: 12px;
  color: var(--text-faint);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: opacity 0.25s ease;
}

.side-status {
  margin: 0 -10px;
  padding: 0 10px 8px;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-faint);
  transition: opacity 0.25s ease;
}

.status-row {
  white-space: nowrap;
}

/* 时间行（🕐 日期时间）单独控制字号 */
.status-clock {
  font-size: 18px;
}

/* 响应时间/加载时间行单独控制字号 */
.status-latency {
  font-size: 12px;
}

/* 防止 flex 压缩导致折叠/展开时位置上下变动 */
.sidebar > * {
  flex-shrink: 0;
}

.side-beian {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-beian-link {
  color: var(--text-faint);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.side-beian-link:hover {
  color: var(--accent);
}

.side-beian-shield,
.side-beian-icp {
  width: 15px;
  height: 16px;
  flex: none;
  display: block;
}

.side-beian-shield {
  object-fit: contain;
}

.side-copy {
  margin: 0;
  font-size: 16px;
}

.side-group {
  margin-bottom: 28px;
}

.side-group-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--text-faint);
  padding: 0 10px;
  margin-bottom: 10px;
  transition: opacity 0.25s ease;
}

/* 可折叠分组标题（测试区） */
.side-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
  margin: 0 0 10px;
  background: none;
  border: 0;
  cursor: pointer;
  font-family: var(--font);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--text-faint);
  transition: color 0.2s ease, opacity 0.25s ease;
}

.side-group-head:hover {
  color: var(--text-dim);
}

.side-group-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 26px;
  line-height: 1;
  /* 展开时箭头朝下 */
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}

.side-group-chevron.is-collapsed {
  transform: rotate(90deg);
}

/* 折叠/展开平滑高度过渡（grid 0fr -> 1fr） */
.side-collapse {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.3s ease;
}

.side-collapse.is-collapsed {
  grid-template-rows: 0fr;
}

.side-collapse > .side-items {
  overflow: hidden;
  min-height: 0;
}

.side-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 组内可展开子菜单（如：工具区 / 3D工具） */
.side-submenu-chevron {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 26px;
  line-height: 1;
  opacity: 1;
  /* 折叠时朝左 */
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}

/* 展开时朝下 ▾，与“测试区”一致 */
.side-submenu-chevron.is-open {
  transform: rotate(0deg);
}

.side-submenu-body {
  display: grid;
  grid-template-rows: 1fr;
  min-height: 0;
  overflow: hidden;
  transition: grid-template-rows 0.3s ease;
}

.side-submenu-body:not(.is-open) {
  grid-template-rows: 0fr;
}

/* 0fr 的直接子项必须是普通块（不能是 flex 链接本身），再由它裁剪内部链接；
   结构同“测试区”的 .side-collapse > .side-items */
.side-submenu-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 子菜单里的链接整体缩进，表示归属 */
.side-item.side-submenu-item {
  /* 与父项“3D工具”的文字起点对齐：父左padding10 + 图标20 + gap11 = 41 */
  padding-left: 41px;
  height: 36px;
}

.side-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 10px;
  height: 42px;
  box-sizing: border-box;
  line-height: 1;
  border-radius: 9px;
  font-size: 18px;
  color: var(--text-dim);
  transition: color 0.2s, background 0.2s;
}

.side-item:hover {
  color: var(--text);
  background: var(--white-06);
}

.side-item.is-active {
  color: var(--accent);
  background: rgba(45, 212, 191, 0.1);
}

.side-item-icon {
  width: 20px;
  text-align: center;
  font-size: 17px;
  flex-shrink: 0;
}

/* 窄屏抽屉：宽度与字号均与桌面一致；仅保留分组间距与响应时间行自动换行防溢出 */
@media (max-width: 1199px) {
  .side-group {
    margin-bottom: 22px;
  }

  .status-latency {
    white-space: normal;
    line-height: 1.5;
  }
}
</style>