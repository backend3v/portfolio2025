<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import ThreeDScene from './components/ThreeDScene.vue'
import FooterBar from './components/FooterBar.vue'
</script>

<template>
  <div id="app">
  <header>
      <NavBar />
    </header>
    <main>
      <ThreeDScene />
    </main>
    <footer>
      <FooterBar />
    </footer>
    </div>
</template>

<style scoped>
#app {
  background: var(--color-bg);
  width: 100vw;
  height: 100vh;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
header, footer {
  flex: 0 0 5vh;
  height: 5vh;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background: var(--color-medium);
    display: flex;
  align-items: center;
  z-index: 10;
}
main {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
    display: flex;
}
</style>
