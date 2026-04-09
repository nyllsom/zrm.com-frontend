<template>
  <main class="h-[calc(100vh-3.5rem)] overflow-hidden bg-gray-50 dark:bg-gray-950">
    <div class="flex h-full">
      <aside class="flex w-[300px] flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div class="border-b border-gray-200 p-3 dark:border-gray-800">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">代码文件</h2>
            <span class="text-xs text-gray-400">{{ files.length }}</span>
          </div>
          <button
            class="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            @click="fetchFiles"
          >
            刷新
          </button>
          <p v-if="loadingList" class="mt-2 text-[11px] text-gray-400">正在加载列表...</p>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
          <button
            v-for="file in files"
            :key="file.id"
            class="mb-1 w-full rounded-md border px-3 py-2 text-left transition-colors"
            :class="
              selectedFileId === file.id
                ? 'border-blue-200 bg-blue-50 text-[#40B3FF] dark:border-blue-900/50 dark:bg-blue-950/30'
                : 'border-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
            "
            @click="selectFile(file.id)"
          >
            <p class="truncate text-sm font-medium">{{ file.slug }}</p>
            <p class="mt-0.5 text-[11px] text-gray-400">{{ formatDate(file.publishedAt) }}</p>
          </button>
        </div>
      </aside>

      <section class="min-w-0 flex-1 overflow-y-auto p-4">
        <div v-if="loadingDetail" class="py-12 text-center text-sm text-gray-400">加载中...</div>
        <div v-else-if="!currentDoc" class="py-12 text-center text-sm text-gray-400">请选择左侧代码文件</div>
        <template v-else>
          <div class="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{{ currentDoc.slug }}</h1>
              <p class="text-xs text-gray-400">{{ formatDate(currentDoc.publishedAt) }}</p>
            </div>
            <button
              class="rounded-md bg-[#40B3FF] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              @click="copyText(allContentText)"
            >
              复制全部
            </button>
          </div>

          <div class="space-y-3">
            <article
              v-for="(block, index) in orderedBlocks"
              :key="block.id || `block-${index}`"
              class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
            >
              <div class="mb-2 flex items-center justify-between">
                <p class="text-xs text-gray-500">Block #{{ index + 1 }} · {{ block.type }}<span v-if="block.language"> · {{ block.language }}</span></p>
                <button
                  v-if="block.type === 'code'"
                  class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  @click="copyText(block.content)"
                >
                  复制
                </button>
              </div>
              <pre class="overflow-x-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800 dark:bg-gray-950 dark:text-gray-200"><code>{{ block.content }}</code></pre>
            </article>
          </div>
        </template>

        <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { livecodesApi, type LivecodeBlock, type LivecodeDocument, type LivecodeListItem } from '@/api/livecodes'

const files = ref<LivecodeListItem[]>([])
const selectedFileId = ref('')
const currentDoc = ref<LivecodeDocument | null>(null)
const loadingList = ref(false)
const loadingDetail = ref(false)
const error = ref('')

const orderedBlocks = computed<LivecodeBlock[]>(() => {
  if (!currentDoc.value) return []

  const ids = currentDoc.value.blockIds || []
  if (ids.length === 0) return currentDoc.value.blocks || []

  const map = new Map((currentDoc.value.blocks || []).map((block) => [block.id, block]))
  return ids.map((id) => map.get(id)).filter((block): block is LivecodeBlock => Boolean(block))
})

const allContentText = computed(() => {
  return orderedBlocks.value
    .map((block) => {
      if (block.type === 'code') {
        return `\`\`\`${block.language || ''}\n${block.content}\n\`\`\``
      }
      return block.content
    })
    .join('\n\n')
})

function formatDate(date?: string): string {
  if (!date) return '未知日期'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date

  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  })
}

async function copyText(text: string) {
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    error.value = '复制失败，请手动复制'
  }
}

async function fetchFiles() {
  loadingList.value = true
  error.value = ''

  try {
    const { data } = await livecodesApi.list()
    files.value = Array.isArray(data.items) ? data.items : []

    if (files.value.length === 0) {
      selectedFileId.value = ''
      currentDoc.value = null
      return
    }

    const exists = files.value.some((item) => item.id === selectedFileId.value)
    const nextId = exists ? selectedFileId.value : files.value[0].id
    await selectFile(nextId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文件列表失败'
  } finally {
    loadingList.value = false
  }
}

async function selectFile(fileId: string) {
  if (!fileId) return
  selectedFileId.value = fileId
  loadingDetail.value = true
  error.value = ''

  try {
    const { data } = await livecodesApi.getById(fileId)
    currentDoc.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文件失败'
    currentDoc.value = null
  } finally {
    loadingDetail.value = false
  }
}

onMounted(async () => {
  await fetchFiles()
})
</script>
