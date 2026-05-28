<template>
  <div class="bite-section">
    <div class="section-header">
      <h3>🐟 Bite Times</h3>
      <div class="moon-info">
        <span class="moon-emoji">{{ moonPhaseEmoji }}</span>
        <span class="moon-text">{{ moonPhaseName }} · {{ Math.round(moonIllumination * 100) }}%</span>
      </div>
    </div>

    <div class="bite-periods">
      <div v-for="(period, i) in majors" :key="'major' + i" class="bite-period major">
        <div class="period-type">═══ Major ═══</div>
        <div class="period-time">{{ formatTime12(period.start) }} - {{ formatTime12(period.end) }}</div>
        <div class="period-quality">⭐⭐⭐</div>
      </div>
      <div v-for="(period, i) in minors" :key="'minor' + i" class="bite-period minor">
        <div class="period-type">Minor</div>
        <div class="period-time">{{ formatTime12(period.start) }} - {{ formatTime12(period.end) }}</div>
        <div class="period-quality">⭐</div>
      </div>
    </div>

    <div class="sun-times">
      <span class="sun-badge">🌅 {{ sunriseText }}</span>
      <span class="sun-badge">🌇 {{ sunsetText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatTime12 } from '../utils/format.js'

const props = defineProps({
  majors: { type: Array, default: () => [] },
  minors: { type: Array, default: () => [] },
  moonPhase: { type: Number, default: 0 },
  moonPhaseName: { type: String, default: '' },
  moonPhaseEmoji: { type: String, default: '🌑' },
  moonIllumination: { type: Number, default: 0 },
  sunrise: String,
  sunset: String
})

const sunriseText = computed(() => {
  if (!props.sunrise) return '—'
  return formatTime12(props.sunrise)
})

const sunsetText = computed(() => {
  if (!props.sunset) return '—'
  return formatTime12(props.sunset)
})
</script>

<style scoped>
.bite-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.moon-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.moon-emoji {
  font-size: 20px;
}

.moon-text {
  font-size: 12px;
  color: #7f8c8d;
}

.bite-periods {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.bite-period {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
}

.bite-period.major {
  background: linear-gradient(135deg, #e8f8f0, #d5f5e3);
  border: 1px solid #a9dfbf;
}

.bite-period.minor {
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
}

.period-type {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.period-time {
  font-size: 14px;
  font-weight: 500;
  color: #34495e;
}

.period-quality {
  font-size: 12px;
}

.sun-times {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.sun-badge {
  font-size: 12px;
  color: #7f8c8d;
}
</style>
