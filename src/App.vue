<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteNav from './components/SiteNav.vue'
import SidebarNav from './components/SidebarNav.vue'
import ParticleBg from './components/ParticleBg.vue'
import { useScrollGutter } from './composables/useScrollGutter'
import { useSpotlight } from './composables/useSpotlight'

const route = useRoute()
// 文章详情页显示毛玻璃背景（独立层，始终渲染，用CSS过渡切换，不闪烁）
const showGlass = computed(() => route.name === 'post')

useScrollGutter()
useSpotlight()
</script>

<template>
  <ParticleBg />
  <!-- 文章详情页毛玻璃背景：独立层，始终渲染，用opacity过渡，不随路由切换闪烁 -->
  <div class="app-glass-bg" :class="{ 'is-visible': showGlass }"></div>
  <SiteNav />
  <SidebarNav />
  <router-view v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
</template>

<style>
/* 全局毛玻璃背景层：覆盖整个内容区域（侧边栏右侧），固定定位不随滚动 */
.app-glass-bg {
  position: fixed;
  top: 0;
  left: var(--sidebar-w, 240px);
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px) saturate(1.2);
  -webkit-backdrop-filter: blur(8px) saturate(1.2);
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}
.app-glass-bg.is-visible {
  opacity: 1;
  visibility: visible;
}
html[data-theme='light'] .app-glass-bg {
  background: rgba(255, 255, 255, 0.85);
}
@media (max-width: 768px) {
  .app-glass-bg {
    left: 0;
  }
}
</style>
