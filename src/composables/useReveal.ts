/**
 * 滚动渐显 —— 页面加载后观察所有 [data-reveal] 元素，
 * 进入视口时添加 .is-visible。由 App.vue 在 onMounted 中调用一次。
 */
export function initReveal(root: HTMLElement | Document = document): () => void {
  const els = Array.from(
    root.querySelectorAll<HTMLElement>('[data-reveal]'),
  )

  // 不支持 IntersectionObserver 时直接全部显示
  if (typeof IntersectionObserver === 'undefined') {
    els.forEach((el) => el.classList.add('is-visible'))
    return () => undefined
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )

  els.forEach((el) => observer.observe(el))
  return () => observer.disconnect()
}

/**
 * 打字机 —— 轮换显示多段文字
 */
export function useTypewriter(
  el: () => HTMLElement | null,
  texts: string[],
  typeMs = 70,
  eraseMs = 38,
  holdMs = 1800,
): () => void {
  let textIndex = 0
  let charIndex = 0
  let deleting = false
  let timer: ReturnType<typeof setTimeout> | undefined

  const tick = () => {
    const node = el()
    if (!node) return

    const current = texts[textIndex] ?? ''
    if (!deleting) {
      charIndex++
      node.textContent = current.slice(0, charIndex)
      if (charIndex === current.length) {
        deleting = true
        timer = setTimeout(tick, holdMs)
        return
      }
      timer = setTimeout(tick, typeMs)
    } else {
      charIndex--
      node.textContent = current.slice(0, charIndex)
      if (charIndex === 0) {
        deleting = false
        textIndex = (textIndex + 1) % texts.length
        timer = setTimeout(tick, 350)
        return
      }
      timer = setTimeout(tick, eraseMs)
    }
  }

  timer = setTimeout(tick, 600)
  return () => {
    if (timer) clearTimeout(timer)
  }
}
