<template>
  <form class="footer-bar" @submit.prevent="onSubmit">
    <input
      v-model="inputValue"
      class="footer-input"
      type="text"
      placeholder="Chat con IA en construccion..."
      aria-label="Entrada de texto"
    />
    <button class="footer-btn" type="submit">Enviar</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const inputValue = ref('')
function onSubmit() {
  // Aquí puedes emitir el mensaje o manejar la acción
  inputValue.value = ''
}
</script>

<style scoped>
.footer-bar {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0 1vw;
  background: var(--color-bg);
  margin: 0;
  box-sizing: border-box;
}
.footer-input {
  flex: 1 1 60%;
  padding: 0.5em 1em;
  border-radius: var(--border-radius);
  border: none;
  font-size: 1rem;
  background: var(--color-light);
  color: var(--color-bg);
  height: 1.2em;
}
.footer-btn {
  padding: 0.5em 2em;
  border-radius: var(--border-radius);
  border: none;
  background: var(--color-presentacion);
  color: var(--color-light);;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  height: 1.2em;
  display: flex;
  align-items: center;
}
.footer-btn:hover, .footer-btn:focus {
  background: var(--color-light);
  color: var(--color-presentacion);
  outline: none;
}
</style>
