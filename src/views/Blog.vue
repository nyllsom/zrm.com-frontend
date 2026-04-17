<template>
  <main class="max-w-4xl mx-auto px-6 pt-24 pb-20">
    <div class="mb-16 text-center">
      <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-4">Blog</p>
      <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 text-balance">
        博客文章
      </h1>
      <p class="mt-4 text-base text-gray-500 dark:text-gray-400">
        技术探索、学习笔记与零散的思考。
      </p>
    </div>

    <div v-if="isLoading && posts.length === 0"
      class="text-center py-20 text-sm text-gray-400">
      正在加载文章...
    </div>

    <div v-else-if="posts.length === 0"
      class="text-center py-20 text-sm text-gray-400">
      暂无文章
    </div>

    <div v-else class="space-y-3">
      <router-link v-for="post in posts" :key="post.id" :to="`/reader?id=${post.id}`"
        class="flex items-center justify-between p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group">
        <div class="flex items-center gap-4 min-w-0">
          <div class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <div class="min-w-0">
            <h2
              class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#40B3FF] transition-colors truncate">
              {{ post.title }}
            </h2>

            <div class="flex items-center gap-2 mt-1">
              <span v-if="post.category"
                class="text-xs text-gray-400 font-mono px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                {{ post.category }}
              </span>
              <span class="text-xs text-gray-400">{{ post.date || '暂无日期' }}</span>
            </div>

            <p v-if="post.author" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {{ post.author }}
            </p>
          </div>
        </div>

        <span
          class="flex-shrink-0 flex items-center gap-0.5 text-xs font-medium text-[#40B3FF] opacity-0 group-hover:opacity-100 transition-opacity ml-4">
          阅读
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </router-link>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { articlesApi, type Article } from '@/api/articles'

interface PostItem {
  id: string
  title: string
  date: string
  category: string
  author: string
}

const posts = ref<PostItem[]>([])
const isLoading = ref(false)

function formatDate(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await articlesApi.getArticles()
    posts.value = (res.data?.items || []).map((a: Article) => ({
      id: a.id,
      title: a.title,
      date: formatDate(a.date || a.createdAt || a.updatedAt),
      category: a.category,
      author: a.author,
    }))
  } catch {
    // silently fail
  } finally {
    isLoading.value = false
  }
})
</script>
