<template>

    <main class="pt-24 pb-20 px-6">
      <div
        v-if="isLoading"
        class="flex justify-center items-center py-40 text-sm text-gray-400"
      >
        正在加载...
      </div>

      <div v-else class="max-w-4xl mx-auto">
        <!-- Page Title -->
        <div class="mb-16 text-center">
          <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-4">
            About Me
          </p>
          <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 text-balance">
            {{ aboutData.title }}
          </h1>
        </div>

        <!-- 个人简介 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div class="p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
              <span class="w-1 h-4 bg-[#40B3FF] rounded-full"></span>
              关于我
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {{ aboutData.intro }}
            </p>
          </div>

          <div class="p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
              <span class="w-1 h-4 bg-[#40B3FF] rounded-full"></span>
              兴趣方向
            </h2>
            <ul class="space-y-2.5">
              <li
                v-for="interest in aboutData.interests"
                :key="interest"
                class="flex items-start gap-2.5"
              >
                <svg class="w-4 h-4 text-[#40B3FF] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ interest }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 mb-10">
          <h2 class="text-base font-semibold text-gray-900 dark:text-gray-50 mb-6 flex items-center gap-2">
            <span class="w-1 h-4 bg-[#40B3FF] rounded-full"></span>
            联系方式
          </h2>
          <div class="flex flex-wrap gap-4">
            <div
              v-for="contact in aboutData.contacts"
              :key="contact.id"
              class="flex items-center gap-2"
            >
              <div class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <svg v-if="contact.id === 'email'" class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <svg v-else-if="contact.id === 'github'" class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <svg v-else class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
              </div>

              <a
                :href="contact.link"
                :target="contact.link.startsWith('http') ? '_blank' : '_self'"
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-[#40B3FF] transition-colors"
              >
                {{ contact.label }}
              </a>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-gray-400 dark:text-gray-600">
          {{ aboutData.footer }}
        </p>

        <!-- 错误提示 -->
        <p v-if="error" class="text-center text-sm text-red-500 mt-6">
          {{ error }}
        </p>
      </div>
    </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface AboutContact {
  id: string
  label: string
  link: string
}

interface AboutData {
  title: string
  intro: string
  interests: string[]
  contacts: AboutContact[]
  footer: string
}

const getDefaultAboutData = (): AboutData => ({
  title: '',
  intro: '',
  interests: [],
  contacts: [],
  footer: '',
})

const aboutData = ref<AboutData>(getDefaultAboutData())
const isLoading = ref(false)
const error = ref('')

const ABOUT_URL = '/settings/about.json'

const fetchAbout = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const res = await fetch(ABOUT_URL)

    if (!res.ok) {
      throw new Error(`请求失败：${res.status}`)
    }

    const data = await res.json()

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('返回数据格式不正确')
    }

    aboutData.value = {
      title: data.title ?? '',
      intro: data.intro ?? '',
      interests: Array.isArray(data.interests) ? data.interests : [],
      contacts: Array.isArray(data.contacts) ? data.contacts : [],
      footer: data.footer ?? '',
    }
  } catch (err) {
    console.error('加载关于页面数据失败:', err)
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAbout()
})
</script>