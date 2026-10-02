<script setup lang="ts">
import { onMounted } from 'vue'
import BlogList from '../components/BlogList.vue'
import { initReveal } from '../composables/useReveal'

onMounted(() => {
  initReveal()
})
</script>

<template>
  <div class="app-shell">
    <main>
      <div class="blog-page">
        <!-- 标题区 -->
        <div class="page-head" data-reveal>
          <span class="kicker">Blog</span>
          <h1 class="title">博客</h1>
          <p class="subtitle">记录折腾的过程，分享技术与生活</p>
        </div>

        <!-- 文章列表 -->
        <BlogList />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

@media (min-width: 1200px) {
  .app-shell {
    padding-left: var(--sidebar-w);
  }
}

.blog-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 96px 24px 64px;
}

/* 标题区 */
.page-head {
  margin-bottom: 32px;
}

.kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 12px;
}

.kicker::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 1px;
  background: var(--text-dim);
}

.title {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0 0 12px;
  line-height: 1.15;
}

.subtitle {
  font-size: 17px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
  max-width: 640px;
}

/* 移动端 */
@media (max-width: 768px) {
  .blog-page {
    padding: 72px 20px 48px;
  }
  .title {
    font-size: 32px;
  }
  .subtitle {
    font-size: 15px;
  }
}
</style>
