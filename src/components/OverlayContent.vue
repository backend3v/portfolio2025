<template>
  <div class="text-overlay">
    <div class="text-frame">
      <div class="text-content" ref="textContentRef" style="overflow-y: auto;">
        <div ref="startMarkerRef" id="start-marker" style="height:1px;width:100%;margin-top:2%"></div>
        <template v-for="(item, idx) in sections" :key="idx">
          <div
            v-if="item.TEMPLATE"
            :id="item.ID || undefined"
            :class="[
              item.STYLE === 'link' ? 'section-link' : '',
              item.STYLE === 'titleGroup' ? 'section-title-group' : '',
              item.STYLE === 'titleGroupB' ? 'section-title-groupB' : '',
              item.STYLE === 'titleGroupC' ? 'section-title-groupC' : '',
              item.STYLE === 'title' ? 'section-title' : '',
              item.STYLE === 'titleName' ? 'section-title-name' : ''
            ]"
            :style="{
              color: item.COLOR,
              fontWeight: item.STYLE === 'titleGroup' || item.STYLE === 'titleGroupB' || item.STYLE === 'titleGroupC' || item.STYLE === 'title' || item.STYLE === 'titleName' ? 'bold' : 'normal',
              fontSize: item.STYLE === 'titleName' ? '2.2em' : item.STYLE === 'titleGroup' || item.STYLE === 'titleGroupB' || item.STYLE === 'titleGroupC' ? '1.5em' : item.STYLE === 'title' ? '1.2em' : '1em'
            }"
          >
            <component :is="getTemplateComponent(item.TEMPLATE)" />
            <!-- Barra separadora inferior para titleGroup y titleGroupC -->
            <template v-if="item.STYLE === 'titleGroup' || item.STYLE === 'titleGroupC'">
              <div class="section-underline section-underline-group" :style="{ backgroundColor: item.COLOR }"></div>
            </template>
          </div>
          <div v-else
            v-bind:id="item.ID || undefined"
            :class="[
              item.STYLE === 'link' ? 'section-link' : '',
              item.STYLE === 'titleGroup' ? 'section-title-group' : '',
              item.STYLE === 'titleGroupB' ? 'section-title-groupB' : '',
              item.STYLE === 'titleGroupC' ? 'section-title-groupC' : '',
              item.STYLE === 'title' ? 'section-title' : '',
              item.STYLE === 'titleName' ? 'section-title-name' : ''
            ]"
            :style="{
              color: item.COLOR,
              fontWeight: item.STYLE === 'titleGroup' || item.STYLE === 'titleGroupB' || item.STYLE === 'titleGroupC' || item.STYLE === 'title' || item.STYLE === 'titleName' ? 'bold' : 'normal',
              fontSize: item.STYLE === 'titleName' ? '2.2em' : item.STYLE === 'titleGroup' || item.STYLE === 'titleGroupB' || item.STYLE === 'titleGroupC' ? '1.5em' : item.STYLE === 'title' ? '1.2em' : '1em'
            }"
          >
            <!-- Barra separadora superior -->
            <template v-if="item.STYLE === 'titleGroup' || item.STYLE === 'titleGroupB'">
              <div class="section-underline section-underline-group section-underline-top" :style="{ backgroundColor: item.COLOR }"></div>
            </template>
            <template v-else-if="item.STYLE === 'title'">
              <div class="section-underline section-underline-title section-underline-top" :style="{ backgroundColor: item.COLOR }"></div>
            </template>

            <!-- Texto principal e iconos para links -->
            <template v-if="item.STYLE === 'link' && isLinkItem(item)">
              <a :href="item.LINK || '#'" target="_blank" class="section-link-a" v-html="formatContent(item.CONTENT || '')"></a>
              <template v-if="item.ICONS && item.ICONS.length">
                <div class="section-icons">
                  <i
                    v-for="(icon, i) in item.ICONS"
                    :key="i"
                    :class="icon"
                    :style="{ color: item.COLOR, margin: '0 0.3em', fontSize: '1.3em' }"
                  ></i>
                </div>
              </template>
            </template>
            <!-- Texto principal para otros casos -->
            <template v-else>
              <span v-html="item.CONTENT && item.CONTENT.trim() !== '' ? formatContent(item.CONTENT) : '&nbsp;'"></span>
              <!-- Iconos debajo del texto para otros casos -->
              <template v-if="item.ICONS && item.ICONS.length">
                <div class="section-icons">
                  <i
                    v-for="(icon, i) in item.ICONS"
                    :key="i"
                    :class="icon"
                    :style="{ color: item.COLOR, margin: '0 0.3em', fontSize: '1.3em' }"
                  ></i>
                </div>
              </template>
            </template>

            <!-- Barra separadora inferior -->
            <template v-if="item.STYLE === 'titleGroup' || item.STYLE === 'titleGroupC'">
              <div class="section-underline section-underline-group" :style="{ backgroundColor: item.COLOR }"></div>
            </template>
            <template v-else-if="item.STYLE === 'title'">
              <div class="section-underline section-underline-title" :style="{ backgroundColor: item.COLOR }"></div>
            </template>
          </div>
        </template>
        <div ref="endMarkerRef" id="end-marker" style="height:1px;width:100%;margin-bottom:15%"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, defineExpose, shallowRef } from 'vue'
import { activeSection } from '@/stores/activeSection'
import sectionsData from '@/data/sections.json'
import '../styles/OverlayContent.css';
import ContactoTemplate from './templates/ContactoTemplate.vue'
import ScrollInvite from './ScrollInvite.vue'
import LogoComponent from './templates/LogoComponent.vue'

const textContentRef = ref<HTMLDivElement | null>(null)
const startMarkerRef = ref<HTMLDivElement | null>(null)
const endMarkerRef = ref<HTMLDivElement | null>(null)
const sections = ref(sectionsData.sections)

function formatContent(content: string) {
  return content.split('<=>').join('<br>');
}

function scrollToSectionById(id: string) {
  const el = document.getElementById(id)
  const container = document.querySelector('.text-content')
  if (el && container && window.scrollController) {
    const factor = 120
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const maxScroll = container.scrollHeight - container.clientHeight;
    let targetOffset = elRect.top - containerRect.top + container.scrollTop;
    targetOffset = Math.min(targetOffset, maxScroll);
    const currentY = -window.scrollController.getRotations().rotationY * factor
    const delta = targetOffset - currentY
    let start: number | null = null;
    const duration = 600
    function animateScroll(ts: number) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress)
      const newY = currentY + delta * ease
      window.scrollController.resetRotationYTo(-newY / factor)
      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }
    requestAnimationFrame(animateScroll)
  }
}

function getTemplateComponent(templateName: string) {
  if (templateName === 'contacto') {
    return ContactoTemplate
  }
  if (templateName === 'logo') {
    return LogoComponent
  }
  return null
}

function isLinkItem(item: any): item is { LINK: string } {
  return item && typeof item.LINK === 'string';
}

onMounted(() => {
  let animationFrame: number | null = null
  function syncScroll() {
    if (window.scrollController && textContentRef.value && startMarkerRef.value && endMarkerRef.value) {
      const factor = 120
      let y = -window.scrollController.getRotations().rotationY * factor
      const frame = textContentRef.value.parentElement
      const textContent = textContentRef.value
      const startMarker = startMarkerRef.value
      const endMarker = endMarkerRef.value
      if (frame && textContent && startMarker && endMarker) {
        const frameRect = frame.getBoundingClientRect()
        const contentRect = textContent.getBoundingClientRect()
        const startRect = startMarker.getBoundingClientRect()
        const endRect = endMarker.getBoundingClientRect()
        const minY = Math.min(0, frameRect.height - contentRect.height)
        const maxY = 0
        if (y > maxY) {
          y = maxY
          window.scrollController.resetRotationYTo(-maxY / factor)
        }
        if (y < minY) {
          y = minY
          window.scrollController.resetRotationYTo(-minY / factor)
        }
        textContent.style.transform = `translateY(${y}px)`
      }
    }
    animationFrame = requestAnimationFrame(syncScroll)
  }
  nextTick(() => {
    animationFrame = requestAnimationFrame(syncScroll)
  })
  onBeforeUnmount(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame)
  })
})

defineExpose({ textContentRef, startMarkerRef, endMarkerRef })
</script>

<style scoped>
.floating-home-btn {
  position: absolute;
  bottom: 2.5%;
  right: 2.5%;
  z-index: 20;
  pointer-events: auto;
}
</style> 