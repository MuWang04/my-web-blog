<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { site } from '../site.config'
import { toggleMobileNav } from '../composables/useMobileNav'

const scrolled = ref(false)
const router = useRouter()

const onScroll = () => {
  scrolled.value = window.scrollY > 24
}

const goHome = () => {
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="nav" :class="{ 'nav--scrolled': scrolled }">
    <div class="nav-inner">
      <button
        class="nav-burger"
        type="button"
        aria-label="打开导航菜单"
        @click="toggleMobileNav"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <a class="nav-brand" href="#top" @click.prevent="goHome">
        <span class="nav-brand-mark">{{ site.brandIcon }}</span>
        <span class="nav-brand-name">{{ site.brand }}</span>
      </a>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 100;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  transition: background 0.35s, border-color 0.35s, backdrop-filter 0.35s;
  border-bottom: 1px solid transparent;
}

.nav--scrolled {
  background: rgba(10, 14, 19, 0.72);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border-bottom-color: var(--card-border);
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 0 24px;
  box-sizing: border-box;
  transition: padding-left 0.3s ease;
}

/* 汉堡按钮：仅窄屏显示 */
.nav-burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}

.nav-burger span {
  display: block;
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: var(--text);
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.nav-burger:active {
  background: var(--white-06);
}

@media (max-width: 1199px) {
  .nav-burger {
    display: flex;
  }

  .nav-inner {
    padding: 0 16px;
  }
}

@media (min-width: 1200px) {
  .nav-inner {
    padding-left: calc(var(--sidebar-w) + 24px);
  }
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.01em;
}

.nav-brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), #0e9f8e);
  color: #04211d;
  font-family: var(--font);
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 4px 14px -4px rgba(45, 212, 191, 0.5);
}
</style>
