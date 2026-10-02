<script setup lang="ts">
import SiteNav from './components/SiteNav.vue'
import SidebarNav from './components/SidebarNav.vue'
import ParticleBg from './components/ParticleBg.vue'
import { useScrollGutter } from './composables/useScrollGutter'
import { useSpotlight } from './composables/useSpotlight'

useScrollGutter()
useSpotlight()
</script>

<template>
  <ParticleBg />
  <SiteNav />
  <SidebarNav />
  <router-view v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
</template>
