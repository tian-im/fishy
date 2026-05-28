<template>
  <div
    class="day-card"
    :class="{ active: isActive }"
    @click="$emit('select')"
  >
    <div class="card-date">{{ formattedDate }}</div>
    <div class="card-day">{{ dayName }}</div>
    <div class="card-weather">{{ weatherEmoji }}</div>
    <div class="card-temp">{{ formattedTemp }}</div>
    <div class="card-wave">🌊 {{ formattedWave }}</div>
    <div class="card-swell-period">{{ formattedSwellPeriod }}</div>
    <div class="card-rating">
      <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= stars }">🐟</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getWmoInfo } from '../utils/wmoCodes.js'
import { degreesToCompass, convertTemperature, convertHeight, convertWindSpeed } from '../utils/format.js'
import { useUnits } from '../composables/useUnits.js'

const props = defineProps({
  date: String,
  dayIndex: Number,
  isActive: Boolean,
  tempMax: Number,
  tempMin: Number,
  weatherCode: Number,
  maxWaveHeight: Number,
  swellPeriod: Number,
  swellDirection: Number,
  fishingScore: Number
})

defineEmits(['select'])

const { tempUnit, heightUnit } = useUnits()

const dayName = computed(() => {
  const date = new Date(props.date)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
})

const formattedDate = computed(() => {
  const date = new Date(props.date)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

const weatherEmoji = computed(() => {
  return getWmoInfo(props.weatherCode).emoji
})

const formattedTemp = computed(() => {
  const max = convertTemperature(props.tempMax, tempUnit.value)
  const min = convertTemperature(props.tempMin, tempUnit.value)
  const unit = tempUnit.value === 'c' ? '°C' : '°F'
  return `${Math.round(max)}° / ${Math.round(min)}°`
})

const formattedWave = computed(() => {
  if (props.maxWaveHeight === null) return '—'
  const height = convertHeight(props.maxWaveHeight, heightUnit.value)
  const unit = heightUnit.value === 'm' ? 'm' : 'ft'
  return `${height.toFixed(1)}${unit}`
})

const formattedSwellPeriod = computed(() => {
  if (props.swellPeriod === null) return '—'
  const dir = props.swellDirection !== null ? degreesToCompass(props.swellDirection) : ''
  return `↗${dir} ${Math.round(props.swellPeriod)}s`
})

const stars = computed(() => {
  if (props.fishingScore >= 80) return 5
  if (props.fishingScore >= 65) return 4
  if (props.fishingScore >= 50) return 3
  if (props.fishingScore >= 35) return 2
  return 1
})
</script>

<style scoped>
.day-card {
  flex: 0 0 auto;
  width: 90px;
  padding: 10px 8px;
  background: white;
  border: 2px solid transparent;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.day-card:hover {
  border-color: #2980b9;
  transform: translateY(-2px);
}

.day-card.active {
  border-color: #2980b9;
  background: #f0f8ff;
}

.card-date {
  font-size: 11px;
  color: #7f8c8d;
  margin-bottom: 2px;
}

.card-day {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
}

.card-weather {
  font-size: 24px;
  margin-bottom: 4px;
}

.card-temp {
  font-size: 12px;
  color: #34495e;
  margin-bottom: 4px;
}

.card-wave {
  font-size: 11px;
  color: #2980b9;
  margin-bottom: 2px;
}

.card-swell-period {
  font-size: 10px;
  color: #7f8c8d;
  margin-bottom: 6px;
}

.card-rating {
  display: flex;
  justify-content: center;
  gap: 1px;
}

.star {
  font-size: 10px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}
</style>
