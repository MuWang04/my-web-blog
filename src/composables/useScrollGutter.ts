import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 仅当页面内容确实超出视口、需要垂直滚动时，才给 <html> 加上
 * .has-scroll（CSS 据此预留 scrollbar-gutter）。
 * 一屏可完整显示的短页面不预留槽位，也就不会出现滚动条；
 * 长页面保留槽位，避免滚动条出现瞬间内容横向跳动。
 *
 * 注意：[data-reveal] 元素初始带 translateY(26px)，其视觉位移会暂时撑大
 * scrollHeight，因此渐显 class 切换、字体加载、路由过渡后都要重新判定。
 */
export function useScrollGutter() {
  const route = useRoute()
  let lateTimers: number[] = []
  let observer: MutationObserver | undefined
  let rafPending = false

  const sync = () => {
    const de = document.documentElement
    const needScroll = de.scrollHeight > de.clientHeight + 1
    de.classList.toggle('has-scroll', needScroll)
  }

  const schedule = () => {
    if (rafPending) return
    rafPending = true
    requestAnimationFrame(() => {
      rafPending = false
      // 再等一帧，确保路由过渡 / 布局完成
      requestAnimationFrame(sync)
    })
    // 兜底：渐显动画(~0.7s)、字体、图片晚到后多次复核
    window.clearTimeout(lateTimers[0])
    window.clearTimeout(lateTimers[1])
    lateTimers = [
      window.setTimeout(sync, 420),
      window.setTimeout(sync, 1000),
    ]
  }

  // 渐显元素在滚动进入视口时会被加上 is-visible（transform 归位），
  // 监听 class 变化后重判，避免初始下移量把页面误判为可滚动。
  const onMutation = () => schedule()

  watch(() => route.path, schedule)

  onMounted(() => {
    schedule()
    window.addEventListener('resize', schedule)
    window.addEventListener('load', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule).catch(() => {})
    }
    observer = new MutationObserver(onMutation)
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', schedule)
    window.removeEventListener('load', schedule)
    window.removeEventListener('scroll', schedule)
    lateTimers.forEach((t) => window.clearTimeout(t))
    observer?.disconnect()
  })
}
