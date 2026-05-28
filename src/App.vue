<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import HeaderBar from './components/HeaderBar.vue'
import DayTabs from './components/DayTabs.vue'
import DetailPanel from './components/DetailPanel.vue'
import UnitToggle from './components/UnitToggle.vue'
import { useLocation } from './composables/useLocation.js'
import { useWeather } from './composables/useWeather.js'
import { useMarine } from './composables/useMarine.js'
import { useBiteTimes } from './composables/useBiteTimes.js'
import { useFishingRating } from './composables/useFishingRating.js'
import { useUnits } from './composables/useUnits.js'

const { location } = useLocation()
const { weatherData, fetchWeather, getDayData, getPressureTrend } = useWeather()
const { marineData, fetchMarine, getDayMarineData, getTideData, getDaySummary } = useMarine()
const { calculateBiteTimes } = useBiteTimes()
const { calculateRating } = useFishingRating()
const { windUnit, tempUnit, heightUnit } = useUnits()

const selectedDay = ref(0)
const isLoading = ref(false)

const windUnits = [
  { value: 'kn', label: 'kn' },
  { value: 'kmh', label: 'km/h' },
  { value: 'ms', label: 'm/s' }
]

const tempUnits = [
  { value: 'c', label: '°C' },
  { value: 'f', label: '°F' }
]

const heightUnits = [
  { value: 'm', label: 'm' },
  { value: 'ft', label: 'ft' }
]

async function loadData() {
  isLoading.value = true
  try {
    await Promise.all([
      fetchWeather(location.value.lat, location.value.lng),
      fetchMarine(location.value.lat, location.value.lng)
    ])
  } finally {
    isLoading.value = false
  }
}

const dailySummaries = computed(() => {
  if (!weatherData.value || !marineData.value) return []

  const summaries = []
  for (let i = 0; i < 7; i++) {
    const weatherDay = getDayData(i)
    const marineSummary = getDaySummary(i)
    const biteTimes = calculateBiteTimes(weatherDay?.date || new Date(), location.value.lat, location.value.lng)
    const pressureTrend = getPressureTrend(i)
    const score = calculateRating(weatherDay, marineSummary, biteTimes, pressureTrend)

    const weatherCodes = weatherDay?.hourly?.weatherCode || []
    const avgCode = weatherCodes.length ? weatherCodes.reduce((a, b) => a + (b || 0), 0) / weatherCodes.length : 0

    summaries.push({
      date: weatherDay?.date,
      tempMax: weatherDay?.tempMax,
      tempMin: weatherDay?.tempMin,
      weatherCode: Math.round(avgCode),
      maxWaveHeight: marineSummary?.maxWaveHeight,
      swellPeriod: marineSummary?.avgSwellPeriod,
      swellDirection: marineSummary?.dominantSwellDirection,
      fishingScore: score
    })
  }
  return summaries
})

const currentDayWeather = computed(() => {
  return getDayData(selectedDay.value)
})

const currentMarineHourly = computed(() => {
  const dayMarine = getDayMarineData(selectedDay.value)
  return dayMarine?.hourly || null
})

const currentWeatherHourly = computed(() => {
  const dayWeather = getDayData(selectedDay.value)
  return dayWeather?.hourly || null
})

const currentTideData = computed(() => {
  return getTideData(selectedDay.value)
})

const currentBiteTimes = computed(() => {
  const date = currentDayWeather.value?.date
  if (!date) return { majors: [], minors: [], moonPhase: 0, moonPhaseName: '', moonPhaseEmoji: '🌑', moonIllumination: 0 }
  return calculateBiteTimes(date, location.value.lat, location.value.lng)
})

const currentMarineSummary = computed(() => {
  return getDaySummary(selectedDay.value)
})

watch(() => [location.value.lat, location.value.lng], () => {
  selectedDay.value = 0
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="app">
    <HeaderBar @locationSelected="loadData" @locationUpdated="loadData" />

    <div class="location-bar">
      <span class="location-name">📍 {{ location.name }}</span>
      <div class="unit-toggles">
        <UnitToggle v-model="windUnit" :units="windUnits" />
        <UnitToggle v-model="tempUnit" :units="tempUnits" />
        <UnitToggle v-model="heightUnit" :units="heightUnits" />
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <span>Loading weather data...</span>
    </div>

    <template v-else>
      <DayTabs
        :days="dailySummaries"
        :selectedIndex="selectedDay"
        @select="selectedDay = $event"
      />

      <DetailPanel
        :dayWeather="currentDayWeather"
        :marineHourly="currentMarineHourly"
        :weatherHourly="currentWeatherHourly"
        :tideData="currentTideData"
        :biteTimes="currentBiteTimes"
        :marineSummary="currentMarineSummary"
      />
    </template>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f7fa;
}

.location-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  flex-wrap: wrap;
  gap: 8px;
}

.location-name {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 500;
}

.unit-toggles {
  display: flex;
  gap: 8px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e8e8e8;
  border-top: 3px solid #2980b9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
