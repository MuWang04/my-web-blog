<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { posts, type Post } from '../utils/posts'

const router = useRouter()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return posts
  return posts.filter((p) => {
    const hay = [p.title, p.description, p.tags.join(' '), p.rawContent]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

function goToPost(post: Post) {
  router.push(`/post/${post.slug}`)
}
</script>

<template>
  <div class="blog-list">
    <!-- 搜索框 -->
    <div class="search-bar">
      <div class="search-box">
        <svg
          class="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="keyword"
          class="search-input"
          type="search"
          placeholder="搜索标题、摘要、标签和正文..."
          aria-label="搜索文章"
        />
      </div>
      <span class="search-count">{{ filtered.length }} 篇</span>
    </div>

    <!-- 空状态 -->
    <p v-if="!filtered.length" class="empty-state">
      没有找到与「{{ keyword }}」相关的文章哦~
    </p>

    <!-- 文章卡片列表 -->
    <div v-else class="card-grid">
      <a
        v-for="post in filtered"
        :key="post.slug"
        class="post-card"
        :href="`/blog/post/${post.slug}`"
        @click.prevent="goToPost(post)"
      >
        <div class="post-meta">
          <span>{{ post.date }}</span>
          <span class="meta-dot">·</span>
          <span>{{ post.words }}字</span>
        </div>
        <div class="post-title">{{ post.title }}</div>
        <p class="post-desc">{{ post.description }}</p>
        <div v-if="post.tags.length" class="post-tags">
          <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 搜索框 */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 0;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-dim);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 56px 10px 38px;
  font-size: 16px;
  letter-spacing: 1px;
  color: var(--text-primary);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.18);
}

.search-input::placeholder {
  color: var(--text-faint);
}

.search-count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
  font-size: 16px;
  color: var(--text-dim);
  pointer-events: none;
}

/* 空状态 */
.empty-state {
  padding: 48px 0;
  text-align: center;
  font-size: 18px;
  color: var(--text-dim);
}

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  align-items: stretch;
}

/* 文章卡片 */
.post-card {
  display: flex;
  flex-direction: column;
  padding: 18px 20px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s, background 0.2s;
}

.post-card:hover {
  border-color: rgba(45, 212, 191, 0.45);
  background: var(--card-hover);
  transform: translateY(-2px);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 1px;
  color: var(--text-dim);
}

.meta-dot {
  opacity: 0.6;
}

.post-title {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 650;
  line-height: 28px;
  letter-spacing: 1px;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 56px;
}

.post-card:hover .post-title {
  color: var(--accent);
}

.post-desc {
  margin: 6px 0 0;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 1px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 48px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  min-height: 22px;
}

.post-tag {
  padding: 2px 10px;
  font-size: 14px;
  line-height: 22px;
  color: var(--accent);
  background: rgba(45, 212, 191, 0.12);
  border-radius: 999px;
}

/* 移动端 */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
