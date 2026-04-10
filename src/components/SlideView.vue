<script setup lang="ts">
import { computed } from 'vue';
import type { SlideNode } from '../core/parser';
import AstRenderer from './AstRenderer.vue';

const props = defineProps<{ slide: SlideNode; }>();

const slideAnalysis = computed(() => {
  const els = props.slide.elements;
  
  const isPureMedia = (node: any) => {
    if (node.type !== 'paragraph') return false;
    const validChildren = node.children?.filter((c: any) => c.type !== 'text' || c.value.trim() !== '') || [];
    return validChildren.length > 0 && validChildren.every((c: any) => c.type === 'image');
  };

  const isVisualBlock = (node: any) => {
    if (node.type === 'image' || isPureMedia(node)) return true;
    
    if (node.type === 'code') {
      if (node.lang === 'mermaid' || node.lang === 'pseudo' || node.lang === 'algorithm') {
        return true; 
      }
      
      const lineCount = node.value ? node.value.split('\n').length : 0;
      return lineCount > 10;
    }
    
    return false;
  };

  const visualNodes = els.filter(isVisualBlock);
  const textNodes = els.filter(n => !isVisualBlock(n));

  return { visualNodes, textNodes, els };
});

const layoutMode = computed(() => {
  if (props.slide.type === 'cover') return 'cover';
  const { visualNodes, textNodes } = slideAnalysis.value;
  if (visualNodes.length > 0 && textNodes.length > 0) return 'split';
  if (visualNodes.length > 0 && textNodes.length === 0) return 'visual-only';
  return 'text-only';
});

const splitGridClass = computed(() => {
  if (layoutMode.value !== 'split') return '';
  let textLength = 0;
  const countText = (node: any) => {
    if (node.value) textLength += node.value.length;
    if (node.children) node.children.forEach(countText);
  };
  slideAnalysis.value.textNodes.forEach(countText);

  if (textLength > 250) return 'grid-cols-[6.5fr_3.5fr]';
  if (textLength > 120) return 'grid-cols-[5.5fr_4.5fr]';
  return 'grid-cols-[1fr_1fr]';
});
</script>

<template>
  <div class="slide-shell w-full h-full min-h-0 overflow-hidden bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300">
    <div class="slide-stage relative h-full w-full flex items-center justify-center px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div class="slide-stage-bg absolute inset-0 pointer-events-none">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,0,0,0.06),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(0,0,0,0.04),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.06),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.04),_transparent_34%)]"></div>
        <div class="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] bg-[linear-gradient(to_right,rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.9)_1px,transparent_1px)] bg-[size:48px_48px]"></div>
      </div>

      <section class="slide-canvas relative w-full h-full max-w-[min(1440px,100%)] max-h-[calc(100vh-4.5rem)] aspect-[16/9] rounded-[2rem] bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.24)] dark:shadow-[0_36px_90px_-24px_rgba(0,0,0,0.7)] overflow-hidden">
        <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.76))] dark:bg-[linear-gradient(135deg,rgba(23,23,23,0.96),rgba(23,23,23,0.9))]"></div>

        <div class="relative z-10 flex h-full min-h-0 flex-col px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <header v-if="slide.type !== 'cover'" class="slide-header shrink-0 mb-5 sm:mb-7">
            <div class="flex items-center gap-3 mb-4">
              <span class="inline-flex items-center rounded-full border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/90 dark:bg-neutral-800/90 px-3 py-1 text-[10px] font-semibold tracking-[0.35em] uppercase text-neutral-500 dark:text-neutral-400">
                Slide
              </span>
              <span class="h-px flex-1 bg-gradient-to-r from-neutral-300 to-transparent dark:from-neutral-700"></span>
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 max-w-4xl leading-[1.08]">
              {{ slide.title }}
            </h2>
          </header>

          <div v-if="layoutMode === 'cover'" class="flex-1 min-h-0 flex flex-col items-center justify-center text-center">
            <div class="mb-5 inline-flex items-center rounded-full border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/90 dark:bg-neutral-800/90 px-4 py-1.5 text-[10px] sm:text-xs font-semibold tracking-[0.35em] uppercase text-neutral-500 dark:text-neutral-400">
              Presentation
            </div>

            <h1 class="max-w-5xl text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 leading-[0.95]">
              {{ slide.title }}
            </h1>

            <div class="mt-8 h-1 w-24 rounded-full bg-neutral-900 dark:bg-neutral-100"></div>

            <div class="slide-prose mt-10 max-w-3xl text-center text-lg sm:text-xl leading-9 text-neutral-700 dark:text-neutral-300">
              <AstRenderer v-for="(el, idx) in slideAnalysis.els" :key="idx" :node="el" />
            </div>
          </div>

          <div
            v-else-if="layoutMode === 'split'"
            :class="['flex-1 min-h-0 grid gap-6 lg:gap-8', splitGridClass]"
          >
            <div class="flex min-h-0 flex-col justify-center rounded-[1.5rem] border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/45 px-5 py-5 sm:px-6 sm:py-6 overflow-y-auto scrollbar-hide">
              <div class="slide-prose text-neutral-700 dark:text-neutral-300 text-base lg:text-lg leading-8 space-y-5">
                <AstRenderer v-for="(el, idx) in slideAnalysis.textNodes" :key="'t'+idx" :node="el" />
              </div>
            </div>

            <div class="flex min-h-0 flex-col justify-center items-center rounded-[1.5rem] border border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/45 px-4 py-4 sm:px-5 sm:py-5 overflow-y-auto scrollbar-hide">
              <div class="w-full h-full flex items-center justify-center">
                <div class="w-full max-w-full flex flex-col items-center gap-5">
                  <AstRenderer v-for="(el, idx) in slideAnalysis.visualNodes" :key="'v'+idx" :node="el" />
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="layoutMode === 'visual-only'" class="flex-1 min-h-0 flex items-center justify-center">
            <div class="slide-visual-frame w-full h-full rounded-[1.5rem] border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 p-4 sm:p-6 flex items-center justify-center overflow-y-auto scrollbar-hide">
              <div class="w-full max-w-[1100px] flex items-center justify-center">
                <AstRenderer v-for="(el, idx) in slideAnalysis.visualNodes" :key="'v'+idx" :node="el" />
              </div>
            </div>
          </div>

          <div v-else class="flex-1 min-h-0 flex items-center justify-center">
            <div class="slide-visual-frame w-full h-full max-w-[1100px] rounded-[1.5rem] border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/65 dark:bg-neutral-950/40 px-5 py-5 sm:px-7 sm:py-7 overflow-y-auto scrollbar-hide">
              <div class="slide-prose mx-auto w-full max-w-4xl text-neutral-700 dark:text-neutral-300 text-base lg:text-lg leading-8">
                <AstRenderer v-for="(el, idx) in slideAnalysis.textNodes" :key="idx" :node="el" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.slide-shell {
  font-family: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.slide-prose :deep(.ast-paragraph) {
  margin-bottom: 1rem;
}

.slide-prose :deep(p) {
  color: rgb(82 82 82);
}

.dark .slide-prose :deep(p) {
  color: rgb(212 212 212);
}

.slide-prose :deep(.ast-heading) {
  color: rgb(23 23 23);
  margin-top: 0.2rem;
  margin-bottom: 0.9rem;
}

.dark .slide-prose :deep(.ast-heading) {
  color: rgb(250 250 250);
}

.slide-prose :deep(.ast-inline-code) {
  background: rgba(0, 0, 0, 0.06);
}

.dark .slide-prose :deep(.ast-inline-code) {
  background: rgba(255, 255, 255, 0.08);
}

.slide-prose :deep(.ast-link) {
  color: rgb(23 23 23);
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.18em;
}

.dark .slide-prose :deep(.ast-link) {
  color: rgb(250 250 250);
}

.slide-prose :deep(.ast-blockquote) {
  border-left-color: rgb(64 64 64);
  padding-left: 1rem;
  margin: 1.25rem 0;
}

.dark .slide-prose :deep(.ast-blockquote) {
  background: rgba(255, 255, 255, 0.04);
}

.slide-prose :deep(ul),
.slide-prose :deep(ol) {
  padding-left: 1.25rem;
  margin: 1rem 0;
}

.slide-prose :deep(li + li) {
  margin-top: 0.45rem;
}

.slide-prose :deep(table) {
  margin: 1.25rem 0;
}

.slide-prose :deep(th),
.slide-prose :deep(td) {
  padding: 0.65rem 0.8rem;
}

.slide-prose :deep(.ast-code-frame),
.slide-prose :deep(.ast-pseudo) {
  background: rgba(255, 255, 255, 0.85);
}

.dark .slide-prose :deep(.ast-code-frame),
.dark .slide-prose :deep(.ast-pseudo) {
  background: rgba(0, 0, 0, 0.45);
}

.slide-visual-frame :deep(img) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.slide-visual-frame :deep(.ast-image) {
  display: flex;
  justify-content: center;
}

.slide-canvas :deep(pre) {
  margin: 0;
}

@media (max-width: 1024px) {
  .slide-canvas {
    aspect-ratio: auto;
    min-height: 100%;
  }
}
</style>
