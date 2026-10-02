<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostBySlug, renderPostContent } from '../utils/posts'
import { initReveal } from '../composables/useReveal'

const route = useRoute()
const router = useRouter()

const post = computed(() => {
  const slug = route.params.slug as string
  return getPostBySlug(slug)
})

const renderedContent = ref('')
const loading = ref(false)

async function loadContent() {
  if (!post.value) {
    renderedContent.value = ''
    return
  }
  loading.value = true
  renderedContent.value = await renderPostContent(post.value)
  loading.value = false
}

watch(() => route.params.slug, () => {
  loadContent()
}, { immediate: true })

onMounted(() => {
  initReveal()
})

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="app-shell">
    <main>
      <div v-if="post" class="post-page" data-reveal>
        <!-- 返回按钮 -->
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          返回列表
        </button>

        <!-- 文章元信息 -->
        <div class="post-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {{ post.date }}
          </span>
          <span class="meta-dot">·</span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            {{ post.words }}字
          </span>
        </div>

        <!-- 文章标题 -->
        <h1 class="post-title">{{ post.title }}</h1>

        <!-- 文章标签 -->
        <div v-if="post.tags.length" class="post-tags">
          <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
        </div>

        <!-- 文章正文 -->
        <div v-if="loading" class="post-loading">正在加载文章...</div>
        <div v-else class="post-content" v-html="renderedContent"></div>
      </div>

      <!-- 文章不存在 -->
      <div v-else class="not-found">
        <h1>文章不存在</h1>
        <p>找不到这篇文章，可能已被删除或链接有误。</p>
        <button class="back-btn" @click="goBack">返回列表</button>
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

.post-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 96px 24px 64px;
}

/* 返回按钮 */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-dim);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.back-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

/* 文章元信息 */
.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-dim);
  margin-bottom: 16px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.meta-dot {
  opacity: 0.5;
}

/* 文章标题 */
.post-title {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0 0 16px;
  line-height: 1.2;
}

/* 文章标签 */
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.post-tag {
  padding: 4px 12px;
  font-size: 14px;
  color: var(--accent);
  background: rgba(45, 212, 191, 0.12);
  border-radius: 999px;
}

/* 文章加载中 */
.post-loading {
  padding: 40px 0;
  text-align: center;
  color: var(--text-secondary);
  font-size: 16px;
}

/* 文章正文 */
.post-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.post-content :deep(h2) {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 32px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--card-border);
}

.post-content :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 24px 0 12px;
}

.post-content :deep(p) {
  margin: 0 0 16px;
}

.post-content :deep(ul),
.post-content :deep(ol) {
  margin: 0 0 16px;
  padding-left: 24px;
}

.post-content :deep(li) {
  margin-bottom: 8px;
}

.post-content :deep(a) {
  color: var(--accent);
  text-decoration: none;
}

.post-content :deep(a:hover) {
  text-decoration: underline;
}

.post-content :deep(code) {
  padding: 2px 6px;
  font-size: 14px;
  background: var(--card-bg);
  border-radius: 4px;
  font-family: var(--font-mono);
}

.post-content :deep(pre) {
  padding: 16px;
  background: var(--card-bg);
  border-radius: 8px;
  overflow-x: auto;
  margin: 0 0 16px;
}

.post-content :deep(pre code) {
  padding: 0;
  background: transparent;
}

.post-content :deep(blockquote) {
  margin: 0 0 16px;
  padding: 12px 20px;
  border-left: 3px solid var(--accent);
  background: var(--card-bg);
  border-radius: 0 8px 8px 0;
}

/* 文章不存在 */
.not-found {
  max-width: 600px;
  margin: 0 auto;
  padding: 120px 24px;
  text-align: center;
}

.not-found h1 {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.not-found p {
  font-size: 16px;
  color: var(--text-dim);
  margin: 0 0 24px;
}

/* 移动端 */
@media (max-width: 768px) {
  .post-page {
    padding: 72px 20px 48px;
  }
  .post-title {
    font-size: 28px;
  }
  .post-content :deep(h2) {
    font-size: 20px;
  }
}
</style>
