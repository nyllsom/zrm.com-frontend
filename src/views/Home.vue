<template>

  <!-- Hero Section -->
  <section class="min-h-[70vh] flex items-center pt-14 font-sans">
    <div class="container mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 py-24">
      <div class="flex flex-col justify-center">
        <h1 class="text-5xl md:text-6xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-gray-50">
          你好，我是<br class="hidden md:block" />nyllsom
        </h1>

        <p class="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
          欢迎来到我的个人空间。在这里记录技术探索、学习笔记与生活感悟。
        </p>

        <div class="flex flex-wrap gap-3 mt-8">
          <router-link to="/blog"
            class="px-12 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors duration-200">
            阅读博客
          </router-link>

          <router-link to="/about"
            class="px-12 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
            关于我
          </router-link>
        </div>
      </div>

      <div class="relative flex justify-center items-center">
        <div class="w-80 h-80 md:w-96 md:h-96 rounded-2xl flex items-center justify-center overflow-hidden">
          <img :src="randomGif" alt="Capoo" class="w-full h-full object-contain p-8" />
        </div>
      </div>
    </div>
  </section>

  <!-- Divider -->
  <div class="container mx-auto px-12">
    <hr class="border-gray-100 dark:border-gray-800" />
  </div>

  <!-- Recent Posts Section -->
  <section class="py-24">
    <div class="container mx-auto px-12">
      <div class="mb-12">
        <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-3">Recent</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          最新文章
        </h2>
      </div>

      <div v-if="isLoading && posts.length === 0"
        class="py-20 text-center text-gray-400 text-sm">
        正在加载文章...
      </div>

      <div v-else-if="posts.length === 0"
        class="py-20 text-center text-gray-400 text-sm">
        暂无文章，去后台写一篇吧~
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <router-link v-for="post in recentPosts" :key="post.id" :to="`/reader?id=${post.id}`"
          class="group block outline-none">
          <div
            class="h-full flex flex-col p-6 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
            <h3
              class="text-base font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-[#40B3FF] transition-colors line-clamp-2 leading-snug">
              {{ post.title }}
            </h3>

            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
              {{ post.author ? `作者：${post.author}` : '点击阅读全文...' }}
            </p>

            <div class="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <p class="text-xs text-gray-400 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ post.date || '暂无日期' }}
              </p>
              <span
                class="text-xs font-medium text-[#40B3FF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                阅读
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="posts.length > 3" class="mt-10 text-center">
        <router-link to="/blog"
          class="text-sm font-medium text-[#40B3FF] hover:underline">
          查看全部文章 →
        </router-link>
      </div>
    </div>
  </section>

</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { articlesApi, type Article } from '@/api/articles'

const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || '/assets'
const posts = ref<Article[]>([])
const isLoading = ref(false)
const randomGif = ref('')

const CONFIG = {
  capoo: 16,
  sumikkogurashi: 3
}

const getRandomGifCapoo = () => {
  const n = Math.floor(Math.random() * CONFIG['capoo']) + 1
  return `${ASSET_BASE_URL}/capoo/${n}.webp`
}

const getRandomGifSumikko = () => {
  const n = Math.floor(Math.random() * CONFIG['sumikkogurashi']) + 1
  return `${ASSET_BASE_URL}/sumikkogurashi/${n}.gif`
}

const getRandomGif = () => {
  const isCapoo = Math.random() < 0.8
  return isCapoo ? getRandomGifCapoo() : getRandomGifSumikko()
}

const recentPosts = computed(() => posts.value.slice(0, 3))

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  })
}

onMounted(async () => {
  randomGif.value = getRandomGif()
  isLoading.value = true
  try {
    const res = await articlesApi.getArticles()
    posts.value = (res.data?.items || []).map((a: Article) => ({
      ...a,
      date: formatDate(a.date || a.createdAt || a.updatedAt),
    }))
  } catch {
    // silently fail - empty state will show
  } finally {
    isLoading.value = false
  }
})
</script>