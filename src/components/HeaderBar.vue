<template>
  <header class="header-bar">
    <div class="header-left">
      <h1 class="logo">🎣 FishWeather</h1>
    </div>
    <div class="header-right">
      <SearchBar @locationSelected="$emit('locationSelected', $event)" />
      <GpsButton @locationUpdated="$emit('locationUpdated')" />
    </div>
  </header>
</template>

<script setup>
import SearchBar from './SearchBar.vue'
import GpsButton from './GpsButton.vue'

defineEmits(['locationSelected', 'locationUpdated'])
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 480px) {
  .logo {
    font-size: 16px;
  }

  .search-bar {
    max-width: 160px;
  }
}
</style>
