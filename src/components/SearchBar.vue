<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <input
        type="text"
        v-model="query"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        placeholder="Search city..."
        class="search-input"
      />
      <span class="search-icon">🔍</span>
    </div>
    <div v-if="showResults && (results.length || showRecent)" class="search-results">
      <template v-if="showRecent">
        <div class="recent-header">
          <span class="recent-label">Recent</span>
          <span class="recent-clear" @mousedown.prevent="clearRecent">Clear</span>
        </div>
        <div
          v-for="(result, index) in recentLocations"
          :key="'recent-' + index"
          class="search-result-item recent"
          @mousedown.prevent="selectResult(result)"
        >
          <span class="recent-icon">🕐</span>
          <span class="recent-name">{{ result.name }}</span>
          <span class="recent-remove" @mousedown.prevent.stop="removeRecent(result)">✕</span>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(result, index) in results"
          :key="index"
          class="search-result-item"
          @mousedown.prevent="selectResult(result)"
        >
          {{ result.name }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLocation } from '../composables/useLocation.js'

const emit = defineEmits(['locationSelected'])

const { searchLocations, setLocation, recentLocations, clearRecent, removeRecent } = useLocation()

const query = ref('')
const results = ref([])
const showResults = ref(false)
let debounceTimer = null

const showRecent = computed(() => {
  return query.value.length < 2 && recentLocations.value.length > 0
})

function onInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (query.value.length >= 2) {
      results.value = await searchLocations(query.value)
      showResults.value = true
    } else {
      results.value = []
    }
  }, 300)
}

function onFocus() {
  showResults.value = true
}

function onBlur() {
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

function selectResult(result) {
  setLocation(result)
  query.value = ''
  results.value = []
  showResults.value = false
  emit('locationSelected', result)
}
</script>

<style scoped>
.search-bar {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #2980b9;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  min-width: 280px;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px 4px;
  border-bottom: 1px solid #f0f0f0;
}

.recent-label {
  font-size: 11px;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recent-clear {
  font-size: 11px;
  color: #e74c3c;
  cursor: pointer;
}

.recent-clear:hover {
  text-decoration: underline;
}

.search-result-item {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #f5f9fc;
}

.search-result-item.recent {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recent-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.recent-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-remove {
  font-size: 11px;
  color: #bdc3c7;
  padding: 2px 4px;
  flex-shrink: 0;
}

.recent-remove:hover {
  color: #e74c3c;
}
</style>
