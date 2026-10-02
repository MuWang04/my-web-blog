import { onMounted, onBeforeUnmount } from 'vue'

/**
 * 卡片鼠标光斑（spotlight border / glow）。
 *
 * 纯事件委托：不改动任何卡片组件模板，鼠标进入 .card 时按需注入
 * 两个 absolute 层（.spot-glow 内部柔光 + .spot-ring 跟随光标的渐变描边），
 * 坐标通过 CSS 变量 --spot-x / --spot-y 传给样式（见全局 style.css）。
 *
 * - 仅精细指针（鼠标 / 触控板）启用，触屏无 hover，直接跳过；
 * - 路由切换重建 DOM 后，下次 hover 会按需重新注入，无需额外监听；
 * - 所有层 pointer-events:none，不影响卡片内按钮 / 链接点击。
 */
export function useSpotlight() {
  let current: HTMLElement | null = null
  let rafPending = false
  let lastX = 0
  let lastY = 0

  const ensureLayers = (card: HTMLElement) => {
    if (card.querySelector(':scope > .spot-glow')) return
    const glow = document.createElement('span')
    glow.className = 'spot-glow'
    glow.setAttribute('aria-hidden', 'true')
    const ring = document.createElement('span')
    ring.className = 'spot-ring'
    ring.setAttribute('aria-hidden', 'true')
    card.appendChild(glow)
    card.appendChild(ring)
  }

  const setVars = () => {
    rafPending = false
    if (!current) return
    const rect = current.getBoundingClientRect()
    current.style.setProperty('--spot-x', `${lastX - rect.left}px`)
    current.style.setProperty('--spot-y', `${lastY - rect.top}px`)
  }

  const onOver = (e: PointerEvent) => {
    const card = (e.target as Element | null)?.closest?.('.card') as
      | HTMLElement
      | null
    if (!card || card === current) return
    current?.classList.remove('is-spotlight')
    current = card
    ensureLayers(card)
    card.classList.add('is-spotlight')
    lastX = e.clientX
    lastY = e.clientY
    rafPending = false
    requestAnimationFrame(setVars)
  }

  const onMove = (e: PointerEvent) => {
    if (!current) return
    // 路由切换后旧卡片可能已脱离文档，丢弃悬空引用
    if (!document.contains(current)) {
      current = null
      return
    }
    lastX = e.clientX
    lastY = e.clientY
    if (!rafPending) {
      rafPending = true
      requestAnimationFrame(setVars)
    }
  }

  const onOut = (e: PointerEvent) => {
    if (!current) return
    const related = e.relatedTarget as Node | null
    if (related && current.contains(related)) return
    current.classList.remove('is-spotlight')
    current = null
  }

  onMounted(() => {
    // 触屏 / 笔等粗指针没有 hover，不启用
    if (window.matchMedia('(pointer: coarse)').matches) return
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onOut, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pointerover', onOver)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerout', onOut)
  })
}
