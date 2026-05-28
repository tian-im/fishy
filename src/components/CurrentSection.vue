<template>
  <div class="current-section">
    <div class="section-header">
      <h3>🌀 Ocean Current</h3>
    </div>
    <div class="current-info">
      <div class="current-stat">
        <span class="stat-label">Velocity</span>
        <span class="stat-value">{{ formattedVelocity }}</span>
      </div>
      <div class="current-stat">
        <span class="stat-label">Direction</span>
        <span class="stat-value">
          <span class="direction-arrow" :style="{ transform: `rotate(${direction}deg)` }">↑</span>
          {{ directionText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { degreesToCompass, convertWindSpeed } from '../utils/format.js'
import { useUnits } from '../composables/useUnits.js'

const props = defineProps({
  velocity: { type: Number, default: null },
  direction: { type: Number, default: null }
})

const { windUnit } = useUnits()

const formattedVelocity = computed(() => {
  if (props.velocity === null) return '—'
  const converted = convertWindSpeed(props.velocity, windUnit.value)
  const unit = windUnit.value === 'kn' ? 'kn' : windUnit.value === 'ms' ? 'm/s' : 'km/h'
  return `${converted.toFixed(1)} ${unit}`
})

const directionText = computed(() => {
  if (props.direction === null) return '—'
  return degreesToCompass(props.direction)
})
</script>

<style scoped>
.current-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #2c3e50;
}

.current-info {
  display: flex;
  gap: 24px;
}

.current-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #7f8c8d;
  text-transform: uppercase;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 6px;
}

.direction-arrow {
  display: inline-block;
  font-size: 18px;
  color: #2980b9;
}
</style>
