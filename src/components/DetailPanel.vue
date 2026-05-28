<template>
  <div class="detail-panel">
    <div class="panel-header">
      <h2>{{ formattedDate }}</h2>
      <div class="panel-meta">
        <span class="meta-badge">{{ weatherEmoji }} {{ weatherDesc }}</span>
        <span class="meta-badge">🌡 {{ formattedSeaTemp }}</span>
      </div>
    </div>

    <div class="panel-grid">
      <BiteTimesSection
        :majors="biteTimes.majors"
        :minors="biteTimes.minors"
        :moonPhase="biteTimes.moonPhase"
        :moonPhaseName="biteTimes.moonPhaseName"
        :moonPhaseEmoji="biteTimes.moonPhaseEmoji"
        :moonIllumination="biteTimes.moonIllumination"
        :sunrise="biteTimes.sunrise"
        :sunset="biteTimes.sunset"
      />

      <TideChart
        :times="tideData.times"
        :heights="tideData.heights"
        :highTides="tideData.highTides"
        :lowTides="tideData.lowTides"
        :sunrise="dayWeather?.sunrise"
        :sunset="dayWeather?.sunset"
      />

      <WindChart
        :times="weatherHourly?.time || []"
        :windSpeeds="weatherHourly?.windSpeed || []"
        :windGusts="weatherHourly?.windGusts || []"
        :windDirections="weatherHourly?.windDirection || []"
        :temperatures="weatherHourly?.temperature || []"
        :pressures="weatherHourly?.pressure || []"
      />

      <WaveChart
        :times="marineHourly?.time || []"
        :waveHeights="marineHourly?.waveHeight || []"
        :swellHeights="marineHourly?.swellHeight || []"
        :swellDirections="marineHourly?.swellDirection || []"
        :swellPeriods="marineHourly?.swellPeriod || []"
      />

      <CurrentSection
        :velocity="avgCurrentVelocity"
        :direction="avgCurrentDirection"
      />

      <HourlyTable
        :weatherHourly="weatherHourly"
        :marineHourly="marineHourly"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TideChart from './charts/TideChart.vue'
import WaveChart from './charts/WaveChart.vue'
import WindChart from './charts/WindChart.vue'
import CurrentSection from './CurrentSection.vue'
import BiteTimesSection from './BiteTimesSection.vue'
import HourlyTable from './HourlyTable.vue'
import { getWmoInfo } from '../utils/wmoCodes.js'
import { convertTemperature } from '../utils/format.js'
import { useUnits } from '../composables/useUnits.js'

const props = defineProps({
  dayWeather: Object,
  marineHourly: Object,
  weatherHourly: Object,
  tideData: Object,
  biteTimes: Object,
  marineSummary: Object
})

const { tempUnit } = useUnits()

const formattedDate = computed(() => {
  if (!props.dayWeather?.date) return ''
  const date = new Date(props.dayWeather.date)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})

const weatherEmoji = computed(() => {
  if (!props.dayWeather?.weatherCode) return ''
  const codes = props.dayWeather.weatherCode || []
  const avgCode = codes.length ? codes.reduce((a, b) => a + (b || 0), 0) / codes.length : 0
  return getWmoInfo(Math.round(avgCode)).emoji
})

const weatherDesc = computed(() => {
  if (!props.dayWeather?.weatherCode) return ''
  const codes = props.dayWeather.weatherCode || []
  const avgCode = codes.length ? codes.reduce((a, b) => a + (b || 0), 0) / codes.length : 0
  return getWmoInfo(Math.round(avgCode)).description
})

const formattedSeaTemp = computed(() => {
  if (!props.marineSummary?.seaTemp) return '—'
  const converted = convertTemperature(props.marineSummary.seaTemp, tempUnit.value)
  const unit = tempUnit.value === 'c' ? '°C' : '°F'
  return `${Math.round(converted)}${unit}`
})

const avgCurrentVelocity = computed(() => {
  const velocities = props.marineHourly?.currentVelocity?.filter(v => v !== null) || []
  if (!velocities.length) return null
  return velocities.reduce((a, b) => a + b, 0) / velocities.length
})

const avgCurrentDirection = computed(() => {
  const directions = props.marineHourly?.currentDirection?.filter(d => d !== null) || []
  if (!directions.length) return null
  const sinSum = directions.reduce((sum, d) => sum + Math.sin(d * Math.PI / 180), 0)
  const cosSum = directions.reduce((sum, d) => sum + Math.cos(d * Math.PI / 180), 0)
  let avg = Math.atan2(sinSum, cosSum) * 180 / Math.PI
  if (avg < 0) avg += 360
  return avg
})
</script>

<style scoped>
.detail-panel {
  padding: 16px;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #2c3e50;
}

.panel-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: #f0f8ff;
  color: #2980b9;
}

.panel-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
