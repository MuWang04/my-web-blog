<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/** 全局科技感粒子网络背景（全站固定背景层） */
const canvasEl = ref<HTMLCanvasElement | null>(null)
let particleRaf = 0
let particles: { x: number; y: number; vx: number; vy: number; bvx: number; bvy: number }[] = []
const pMouse = { x: -9999, y: -9999 }

/** 点击涟漪（冲击波）：{中心坐标, 当前半径, 不透明度} */
type Ripple = { x: number; y: number; r: number; a: number }
let ripples: Ripple[] = []
const MAX_RIPPLES = 3

/** 每个粒子受鼠标影响的强度 0~1（供连线提亮、粒子放大共用） */
let nearP = new Float32Array(0)

// 用户在系统里开启“减弱动态效果”时，不做持续动画（只画一帧静态画面）
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 触屏设备：不做持续跟随的鼠标力场（省电极），但仍保留点击涟漪
const finePointer =
  typeof window !== 'undefined' &&
  !window.matchMedia('(pointer: coarse)').matches

let ctx: CanvasRenderingContext2D | null = null
let W = 0
let H = 0
let dpr = 1
let LINK = 200

function draw() {
  if (!ctx) return
  const dark = document.documentElement.dataset.theme !== 'light'
  const lineA = dark ? 'rgba(45, 212, 191, 0.2)' : 'rgba(13, 148, 136, 0.24)'
  const mouseLine = dark ? 'rgba(125, 232, 218, 1)' : 'rgba(13, 148, 136, 1)'
  const ringColor = dark ? 'rgba(125, 232, 218, 1)' : 'rgba(13, 148, 136, 1)'
  const dotCore = dark ? 'rgba(186, 240, 235, 0.95)' : 'rgba(13, 148, 136, 0.9)'
  const dotHalo = dark ? 'rgba(125, 211, 252, 0.32)' : 'rgba(13, 148, 136, 0.3)'

  ctx.clearRect(0, 0, W, H)

  // 鼠标影响参数（物理像素，与粒子坐标系一致）
  const mouseActive = finePointer && pMouse.x > -1000
  const MR = LINK * 1.7 // 鼠标影响半径（仅用于连线提亮与粒子放大，不产生位移）
  const vmax = 2.6 * dpr // 速度上限，防止涟漪冲量累积导致飞太快

  // 推进涟漪
  for (let k = ripples.length - 1; k >= 0; k--) {
    const rp = ripples[k]!
    rp.r += 5 * dpr
    rp.a -= 0.02
    if (rp.a <= 0) ripples.splice(k, 1)
  }

  // 计算每个粒子受鼠标影响的强度
  if (mouseActive) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!
      const dx = pMouse.x - p.x
      const dy = pMouse.y - p.y
      const d = Math.hypot(dx, dy)
      nearP[i] = d < MR ? 1 - d / MR : 0
    }
  } else {
    nearP.fill(0)
  }

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]!

    // 点击涟漪波前：给扫过的粒子一个向外的径向冲量
    for (const rp of ripples) {
      const dx = p.x - rp.x
      const dy = p.y - rp.y
      const d = Math.hypot(dx, dy)
      const band = 110 * dpr
      const diff = d - rp.r
      if (Math.abs(diff) < band && d > 0.001) {
        const s = (1 - Math.abs(diff) / band) * rp.a
        p.vx += (dx / d) * s * 0.4 * dpr
        p.vy += (dy / d) * s * 0.4 * dpr
      }
    }

    // 涟漪冲量会叠加到速度上；每帧把速度拉回基础漂移速度，
    // 使粒子荡开后约半秒内恢复匀速漂浮，而不是带着冲量一直移动
    p.vx += (p.bvx - p.vx) * 0.05
    p.vy += (p.bvy - p.vy) * 0.05

    // 限速
    const sp = Math.hypot(p.vx, p.vy)
    if (sp > vmax) {
      p.vx = (p.vx / sp) * vmax
      p.vy = (p.vy / sp) * vmax
    }

    p.x += p.vx
    p.y += p.vy
    if (p.x < -40) p.x = W + 40
    if (p.x > W + 40) p.x = -40
    if (p.y < -40) p.y = H + 40
    if (p.y > H + 40) p.y = -40
  }

  // 粒子间连线
  ctx.lineWidth = 1.4
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i]!
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j]!
      const dx = a.x - b.x
      const dy = a.y - b.y
      const d2 = dx * dx + dy * dy
      if (d2 < LINK * LINK) {
        ctx.strokeStyle = lineA
        ctx.globalAlpha = (1 - Math.sqrt(d2) / LINK) * 0.6
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }

  // 鼠标连线：越靠近越亮、略变粗
  if (mouseActive) {
    for (let i = 0; i < particles.length; i++) {
      const n = nearP[i]!
      if (n <= 0) continue
      const p = particles[i]!
      ctx.strokeStyle = mouseLine
      ctx.globalAlpha = n * 0.4
      ctx.lineWidth = 1.2 + n * 0.7
      ctx.beginPath()
      ctx.moveTo(pMouse.x, pMouse.y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
    // 还原线宽，避免影响涟漪圆环
    ctx.lineWidth = 1.4
  }

  // 点击涟漪的扩散圆环
  for (const rp of ripples) {
    ctx.strokeStyle = ringColor
    ctx.globalAlpha = rp.a * 0.45
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // 粒子点（外圈光晕 + 亮核）；鼠标附近的粒子略微放大、更醒目
  ctx.globalAlpha = 1
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]!
    const n = nearP[i]!
    ctx.fillStyle = dotHalo
    ctx.beginPath()
    ctx.arc(p.x, p.y, (4.2 + n * 1.4) * dpr, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = dotCore
    ctx.beginPath()
    ctx.arc(p.x, p.y, (2.2 + n * 1.0) * dpr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/** 一帧动画：减弱动态 / 后台标签时不继续排下一帧 */
function frame() {
  draw()
  particleRaf = prefersReduced ? 0 : requestAnimationFrame(frame)
}

/** 启动（或恢复）渲染循环 */
function kick() {
  if (prefersReduced || document.hidden) return
  if (particleRaf) return
  particleRaf = requestAnimationFrame(frame)
}

function startParticles() {
  const cv = canvasEl.value
  if (!cv) return
  ctx = cv.getContext('2d')
  if (!ctx) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = cv.width = innerWidth * dpr
  H = cv.height = innerHeight * dpr
  // 触发规则与侧边栏折叠（汉堡）按钮一致：≤1199px 走稀疏 20~80，≥1200px 走密集 140~240
  const mobile = window.matchMedia('(max-width: 1199px)').matches
  const minN = mobile ? 50 : 160
  const maxN = mobile ? 150 : 260
  const density = mobile ? 40000 : 8000
  const N = Math.min(maxN, Math.max(minN, Math.floor((W * H) / density)))
  particles = Array.from({ length: N }, () => {
    const vx = (Math.random() - 0.5) * 0.55 * dpr
    const vy = (Math.random() - 0.5) * 0.55 * dpr
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx,
      vy,
      bvx: vx,
      bvy: vy,
    }
  })
  nearP = new Float32Array(N)
  ripples = []
  LINK = (mobile ? 150 : 200) * dpr

  if (prefersReduced) {
    // 静态模式：速度归零，只保留一帧静止的粒子网络
    for (const p of particles) {
      p.vx = 0
      p.vy = 0
    }
    draw()
    particleRaf = 0
  } else {
    kick()
  }
}

let resizeTimer = 0

function onResize() {
  cancelAnimationFrame(particleRaf)
  particleRaf = 0
  window.clearTimeout(resizeTimer)
  // 拖动窗口时 resize 高频触发，停稳 150ms 后只重建一次粒子
  resizeTimer = window.setTimeout(() => {
    startParticles()
  }, 150)
}

function onMove(e: MouseEvent) {
  if (!finePointer) return
  pMouse.x = e.clientX * dpr
  pMouse.y = e.clientY * dpr
}

// 鼠标离开窗口：清空坐标，停止吸附（否则会一直吸在最后停留的边缘）
function onLeave() {
  pMouse.x = -9999
  pMouse.y = -9999
}

// 点击产生涟漪（桌面 + 手机均生效；减弱动态模式下不产生）
function onClick(e: MouseEvent) {
  if (prefersReduced) return
  if (ripples.length >= MAX_RIPPLES) ripples.shift()
  ripples.push({ x: e.clientX * dpr, y: e.clientY * dpr, r: 0, a: 1 })
  kick()
}

// 切到后台标签时暂停 requestAnimationFrame，省 CPU / 电量；回来再恢复
function onVisibility() {
  if (document.hidden) {
    cancelAnimationFrame(particleRaf)
    particleRaf = 0
  } else {
    kick()
  }
}

// 静态（减弱动态）模式下不逐帧重绘，主题切换后需要补画一帧更新颜色
const themeObserver = new MutationObserver(() => {
  if (prefersReduced) draw()
})

onMounted(() => {
  startParticles()
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseleave', onLeave, { passive: true })
  window.addEventListener('click', onClick, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(particleRaf)
  window.clearTimeout(resizeTimer)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseleave', onLeave)
  window.removeEventListener('click', onClick)
  document.removeEventListener('visibilitychange', onVisibility)
  themeObserver.disconnect()
})
</script>

<template>
  <canvas ref="canvasEl" class="particle-bg"></canvas>
</template>

<style scoped>
.particle-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
