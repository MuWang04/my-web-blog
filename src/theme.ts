export type ThemeMode = 'light' | 'dark'
/** 落到页面上的实际主题（只保留浅色 / 深色两态，已移除“自动”）*/
export type ResolvedTheme = 'light' | 'dark'

/** 手动选择的记忆时长：10 分钟；过期后回到默认深色 */
export const THEME_REMEMBER_MS = 10 * 60 * 1000
/** 无记忆或记忆过期时的默认主题 */
const DEFAULT_THEME: ThemeMode = 'dark'

const KEY = 'site-theme'

interface StoredChoice {
  m: ThemeMode
  /** 本次手动选择的时间戳（ms） */
  t: number
}

export const THEME_LABELS: Record<ThemeMode, string> = {
  light: '浅色',
  dark: '深色',
}

export const THEME_ICONS: Record<ThemeMode, string> = {
  light: '☀️',
  dark: '🌙',
}

/** 分段控件的展示顺序：浅色 → 深色 */
export const THEME_ORDER: ThemeMode[] = ['light', 'dark']

const VALID: string[] = ['light', 'dark']

/** 读取仍在 10 分钟有效期内的手动选择；缺失 / 非法 / 过期则清除并返回 null */
function readStored(): StoredChoice | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<StoredChoice>
    if (
      typeof data.m !== 'string' ||
      !VALID.includes(data.m) ||
      typeof data.t !== 'number'
    ) {
      localStorage.removeItem(KEY)
      return null
    }
    if (Date.now() - data.t > THEME_REMEMBER_MS) {
      localStorage.removeItem(KEY)
      return null
    }
    return { m: data.m as ThemeMode, t: data.t }
  } catch {
    // 兼容旧版裸字符串（light/dark/auto）等非法格式：清除并走默认
    localStorage.removeItem(KEY)
    return null
  }
}

/** 当前应使用的主题：10 分钟内沿用上次手动选择，否则默认深色 */
export function getTheme(): ThemeMode {
  return readStored()?.m ?? DEFAULT_THEME
}

function apply(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode === 'dark' ? 'dark' : 'light'
}

export function initTheme(): ThemeMode {
  const mode = getTheme()
  apply(mode)
  return mode
}

/** 圆形释放动画的起点（视口像素坐标，clientX/clientY 风格） */
export interface ThemeOrigin {
  x: number
  y: number
}

/** 直接应用主题（供动画兜底） */
export function applyMode(mode: ThemeMode): void {
  apply(mode)
}

/** 记忆到期复位：清除手动选择，静默（无圆形动画）回到默认深色 */
export function resetThemeToDefault(): ThemeMode {
  localStorage.removeItem(KEY)
  apply(DEFAULT_THEME)
  return DEFAULT_THEME
}

interface ViewTransitionLike {
  finished: Promise<void>
}

function startViewTransition(cb: () => void): ViewTransitionLike | undefined {
  const doc = document as unknown as {
    startViewTransition?: (fn: () => void) => ViewTransitionLike
  }
  return doc.startViewTransition ? doc.startViewTransition(cb) : undefined
}

export function setTheme(mode: ThemeMode, origin?: ThemeOrigin): ThemeMode {
  localStorage.setItem(KEY, JSON.stringify({ m: mode, t: Date.now() }))
  const doApply = () => apply(mode)

  // 用户开启“减弱动态效果”时，不播放圆形动画，直接切换
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    doApply()
    return mode
  }

  const root = document.documentElement
  const x = origin?.x ?? innerWidth / 2
  const y = origin?.y ?? innerHeight / 2
  const radius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )

  // 纯 CSS 方案（Element Plus 同款）：方向标记与圆心/半径必须在
  // startViewTransition 之前写好，让 CSS 动画从过渡第一帧就生效，不闪白。
  root.dataset.themeTransition =
    mode === 'dark' ? 'to-dark' : 'to-light'
  root.style.setProperty('--theme-transition-x', `${x}px`)
  root.style.setProperty('--theme-transition-y', `${y}px`)
  root.style.setProperty('--theme-transition-radius', `${radius}px`)

  const clearMark = () => {
    delete root.dataset.themeTransition
    root.style.removeProperty('--theme-transition-x')
    root.style.removeProperty('--theme-transition-y')
    root.style.removeProperty('--theme-transition-radius')
  }

  const transition = startViewTransition(doApply)
  if (transition) {
    transition.finished.then(clearMark, clearMark)
  } else {
    clearMark()
    doApply()
  }
  return mode
}

export function cycleTheme(current?: ThemeMode, origin?: ThemeOrigin): ThemeMode {
  const cur = current ?? getTheme()
  const next = THEME_ORDER[(THEME_ORDER.indexOf(cur) + 1) % THEME_ORDER.length]!
  return setTheme(next, origin)
}