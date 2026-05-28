<template>
  <div class="hourly-section">
    <div class="section-header" @click="expanded = !expanded">
      <h3>📊 Hourly Data</h3>
      <span class="expand-icon">{{ expanded ? '▼' : '▶' }}</span>
    </div>
    <div v-if="expanded" class="table-wrapper">
      <table class="hourly-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Temp</th>
            <th>Wind</th>
            <th>Gust</th>
            <th>Dir</th>
            <th>Wave</th>
            <th>Swell</th>
            <th>Pres</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in tableData" :key="i">
            <td>{{ row.time }}</td>
            <td>{{ row.temp }}</td>
            <td>{{ row.wind }}</td>
            <td>{{ row.gust }}</td>
            <td>{{ row.dir }}</td>
            <td>{{ row.wave }}</td>
            <td>{{ row.swell }}</td>
            <td>{{ row.pres }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { degreesToCompass, convertWindSpeed, convertTemperature, convertHeight } from '../utils/format.js'
import { useUnits } from '../composables/useUnits.js'

const props = defineProps({
  weatherHourly: Object,
  marineHourly: Object
})

const { windUnit, tempUnit, heightUnit } = useUnits()

const expanded = ref(false)

const tableData = computed(() => {
  if (!props.weatherHourly) return []

  const rows = []
  const times = props.weatherHourly.time || []

  for (let i = 0; i < times.length; i += 3) {
    const time = new Date(times[i]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

    const temp = props.weatherHourly.temperature?.[i]
    const wind = props.weatherHourly.windSpeed?.[i]
    const gust = props.weatherHourly.windGusts?.[i]
    const dir = props.weatherHourly.windDirection?.[i]
    const pres = props.weatherHourly.pressure?.[i]

    const wave = props.marineHourly?.waveHeight?.[i]
    const swell = props.marineHourly?.swellHeight?.[i]

    const windUnitLabel = windUnit.value === 'kn' ? 'kn' : windUnit.value === 'ms' ? 'm/s' : 'km/h'
    const tempUnitLabel = tempUnit.value === 'c' ? '°C' : '°F'
    const heightUnitLabel = heightUnit.value === 'm' ? 'm' : 'ft'

    rows.push({
      time,
      temp: temp !== null && temp !== undefined ? `${Math.round(convertTemperature(temp, tempUnit.value))}${tempUnitLabel}` : '—',
      wind: wind !== null && wind !== undefined ? `${Math.round(convertWindSpeed(wind, windUnit.value))}${windUnitLabel}` : '—',
      gust: gust !== null && gust !== undefined ? `${Math.round(convertWindSpeed(gust, windUnit.value))}${windUnitLabel}` : '—',
      dir: dir !== null && dir !== undefined ? degreesToCompass(dir) : '—',
      wave: wave !== null && wave !== undefined ? `${convertHeight(wave, heightUnit.value).toFixed(1)}${heightUnitLabel}` : '—',
      swell: swell !== null && swell !== undefined ? `${convertHeight(swell, heightUnit.value).toFixed(1)}${heightUnitLabel}` : '—',
      pres: pres !== null && pres !== undefined ? `${Math.round(pres)}hPa` : '—'
    })
  }

  return rows
})
</script>

<style scoped>
.hourly-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.expand-icon {
  font-size: 12px;
  color: #7f8c8d;
}

.table-wrapper {
  margin-top: 12px;
  overflow-x: auto;
}

.hourly-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.hourly-table th {
  text-align: left;
  padding: 8px 6px;
  border-bottom: 2px solid #e8e8e8;
  color: #7f8c8d;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  white-space: nowrap;
}

.hourly-table td {
  padding: 6px;
  border-bottom: 1px solid #f5f5f5;
  color: #34495e;
  white-space: nowrap;
}

.hourly-table tr:hover {
  background: #f8fafb;
}
</style>
