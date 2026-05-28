<template>
  <button class="gps-button" @click="handleGps" :disabled="isLoading">
    <span class="gps-icon">📍</span>
    <span v-if="isLoading" class="loading-spinner"></span>
  </button>
</template>

<script setup>
import { useLocation } from '../composables/useLocation.js'

const emit = defineEmits(['locationUpdated'])

const { useGps, isLoading } = useLocation()

async function handleGps() {
  const success = await useGps()
  if (success) {
    emit('locationUpdated')
  }
}
</script>

<style scoped>
.gps-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.gps-button:hover {
  background: #f5f9fc;
  border-color: #2980b9;
}

.gps-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gps-icon {
  font-size: 16px;
}

.loading-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #2980b9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
