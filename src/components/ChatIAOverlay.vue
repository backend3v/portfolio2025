<template>
  <div class="chatia-overlay">
    <div class="inputChat">
      <input v-model="inputValue" class="chat-input" placeholder="Escribe tu pregunta..." />
      <button class="chat-btn" @click="sendRequest" :disabled="loading || !inputValue.trim()">Enviar</button>
    </div>
    <div class="outputRequest">
      <div v-if="loading" class="spinner"></div>
      <template v-else-if="responseObj">
        <ChatIAResponse :data="responseObj" />
      </template>
      <div v-else-if="response">{{ response }}</div>
      <div v-else>Ingresa una pregunta y creare una grafica con los datos que encuentre, usare un modelo de IA para generarte una respuesta.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import ChatIAResponse from './ChatIAResponse.vue'

const inputValue = ref('')
const response = ref<string|null>(null)
const responseObj = ref<any|null>(null)
const loading = ref(false)
const API_URL = import.meta.env.VITE_API_URL

async function sendRequest() {
  if (!inputValue.value.trim()) return;
  loading.value = true;
  response.value = null;
  responseObj.value = null;
  try {
    const res = await axios.post(`${API_URL}/prompt`, {
      prompt: inputValue.value,
      lang: 'es'
    });
    if (typeof res.data === 'object' && res.data !== null) {
      responseObj.value = res.data;
    } else {
      // Intentar parsear si es string JSON
      try {
        const parsed = JSON.parse(res.data);
        if (typeof parsed === 'object' && parsed !== null) {
          responseObj.value = parsed;
        } else {
          response.value = res.data;
        }
      } catch {
        response.value = res.data;
      }
    }
  } catch (e) {
    const err = e as any;
    if (err.response && err.response.status === 429) {
      response.value = 'Se ha cumplido con el limite de peticiones, no puedo generarte una respuesta';
    } else if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes('Límite de consultas')) {
      response.value = 'Se ha cumplido con el limite de peticiones, no puedo generarte una respuesta';
    } else {
      response.value = 'Se ha cumplido con el limite de peticiones, no puedo generarte una respuesta';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.chatia-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-size: 0.5em;
}
.inputChat {
  display: flex;
  align-items: center;
  height: 5%;
  padding: 1em 2em;
  gap: 1em;
}
.chat-input {
  width: 95%;
  font-size: 1.5em;
  padding: 0.7em 1em;
  border-radius: 1.5em;
  border: 1px solid #b1c2d5;
  outline: none;
  font-weight: bold;
}
.chat-btn {
  width: 5%;
  font-size: 1.5em;
  padding: 0.7em 0;
  border-radius: 1.5em;
  border: none;
  background: #3498db;
  color: var(--color-bg);
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-btn:disabled {
  background: #b1c2d5;
  cursor: not-allowed;
}
.outputRequest {
  color: white;
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  min-height: 0;
  padding: 2em;
  text-align: center;
}
.spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 