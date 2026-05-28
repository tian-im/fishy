<template>
  <div class="chart-section">
    <div class="section-header">
      <h3>💨 Wind & Barometric Pressure</h3>
      <div class="weather-info">
        <span class="info-badge pressure-trend" :class="pressureTrendClass">
          📊 {{ formattedPressure }} {{ pressureTrendArrow }} {{ pressureTrendLabel }}
        </span>
        <span class="info-badge">🌡 {{ formattedTemp }}</span>
      </div>
    </div>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize />
    </div>
    <div class="wind-strip">
      <div class="wind-strip-inner" ref="stripRef">
        <div
          v-for="(item, index) in windDirectionData"
          :key="index"
          class="wind-col"
          :title="`${formatDirTime(item.time)} — ${item.compass} (${item.degrees}°) — ${item.speedLabel}`"
        >
          <svg class="wind-arrow" viewBox="0 0 24 24" :style="{ transform: `rotate(${item.degrees}deg)` }">
            <path d="M12 2 L15 10 L12 8 L9 10 Z" :fill="item.color" />
            <line x1="12" y1="8" x2="12" y2="22" :stroke="item.color" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span class="wind-speed-label">{{ item.speedText }}</span>
          <span class="wind-time-label">{{ formatShortTime(item.time) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { convertWindSpeed, convertTemperature, degreesToCompass } from '../../utils/format.js'
import { useUnits } from '../../composables/useUnits.js'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  times: { type: Array, default: () => [] },
  windSpeeds: { type: Array, default: () => [] },
  windGusts: { type: Array, default: () => [] },
  windDirections: { type: Array, default: () => [] },
  temperatures: { type: Array, default: () => [] },
  pressures: { type: Array, default: () => [] }
})

const { windUnit, tempUnit } = useUnits()

function getWindColor(speedKmh) {
  if (speedKmh < 11) return '#27ae60'
  if (speedKmh < 20) return '#2ecc71'
  if (speedKmh < 30) return '#f1c40f'
  if (speedKmh < 40) return '#e67e22'
  if (speedKmh < 50) return '#e74c3c'
  return '#c0392b'
}

const windDirectionData = computed(() => {
  const data = []
  for (let i = 0; i < props.windDirections.length; i += 3) {
    const dir = props.windDirections[i]
    const speed = props.windSpeeds[i] || 0
    if (dir !== null && dir !== undefined) {
      const converted = convertWindSpeed(speed, windUnit.value)
      const unitLabel = windUnit.value === 'kn' ? 'kn' : windUnit.value === 'ms' ? 'm/s' : 'km/h'
      data.push({
        time: props.times[i],
        degrees: dir,
        compass: degreesToCompass(dir),
        color: getWindColor(speed),
        speedText: Math.round(converted),
        speedLabel: `${Math.round(converted)} ${unitLabel}`
      })
    }
  }
  return data
})

function formatDirTime(timeStr) {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatShortTime(timeStr) {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
}

const formattedTemp = computed(() => {
  const temps = props.temperatures.filter(t => t !== null)
  if (!temps.length) return '—'
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length
  const converted = convertTemperature(avg, tempUnit.value)
  const unit = tempUnit.value === 'c' ? '°C' : '°F'
  return `${Math.round(converted)}${unit}`
})

const pressureStats = computed(() => {
  const pressures = props.pressures.filter(p => p !== null)
  if (!pressures.length) return { avg: null, trend: 'stable', diff: 0 }
  const avg = pressures.reduce((a, b) => a + b, 0) / pressures.length
  const diff = pressures[pressures.length - 1] - pressures[0]
  let trend = 'stable'
  if (diff > 2) trend = 'rising'
  else if (diff < -2) trend = 'falling'
  return { avg, trend, diff }
})

const formattedPressure = computed(() => {
  if (pressureStats.value.avg === null) return '—'
  return `${Math.round(pressureStats.value.avg)}hPa`
})

const pressureTrendArrow = computed(() => {
  const t = pressureStats.value.trend
  if (t === 'falling') return '↘'
  if (t === 'rising') return '↗'
  return '→'
})

const pressureTrendLabel = computed(() => {
  const t = pressureStats.value.trend
  if (t === 'falling') return 'Falling'
  if (t === 'rising') return 'Rising'
  return 'Stable'
})

const pressureTrendClass = computed(() => pressureStats.value.trend)

const chartOption = computed(() => {
  const timeLabels = props.times.map(t => {
    const date = new Date(t)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  })

  const windUnitLabel = windUnit.value === 'kn' ? 'kn' : windUnit.value === 'ms' ? 'm/s' : 'km/h'
  const convertedWinds = props.windSpeeds.map(w => convertWindSpeed(w, windUnit.value))
  const convertedGusts = props.windGusts.map(g => convertWindSpeed(g, windUnit.value))

  const validPressures = props.pressures.filter(p => p !== null)
  const pMin = validPressures.length ? Math.min(...validPressures) : 1000
  const pMax = validPressures.length ? Math.max(...validPressures) : 1030
  const pressureAxisMin = Math.floor(pMin - 5)
  const pressureAxisMax = Math.ceil(pMax + 5)

  return {
    grid: { left: 50, right: 55, top: 40, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].name + '<br/>'
        params.forEach(p => {
          if (p.seriesName === 'Pressure') {
            result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)} hPa<br/>`
          } else {
            result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)} ${windUnitLabel}<br/>`
          }
        })
        return result
      }
    },
    legend: { top: 0, textStyle: { fontSize: 11 } },
    xAxis: {
      type: 'category',
      data: timeLabels,
      axisLabel: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: `Speed (${windUnitLabel})`,
        nameTextStyle: { fontSize: 10 },
        position: 'left'
      },
      {
        type: 'value',
        name: 'Pressure (hPa)',
        nameTextStyle: { fontSize: 10 },
        position: 'right',
        min: pressureAxisMin,
        max: pressureAxisMax,
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Wind',
        type: 'bar',
        yAxisIndex: 0,
        data: convertedWinds,
        itemStyle: {
          color: (params) => {
            const rawSpeed = props.windSpeeds[params.dataIndex] || 0
            return getWindColor(rawSpeed)
          }
        },
        barWidth: '60%'
      },
      {
        name: 'Gusts',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        data: convertedGusts,
        lineStyle: { color: '#e74c3c', width: 2 },
        itemStyle: { color: '#e74c3c' },
        symbol: 'none'
      },
      {
        name: 'Pressure',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: props.pressures,
        lineStyle: { color: '#8e44ad', width: 2, type: 'dashed' },
        itemStyle: { color: '#8e44ad' },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(142, 68, 173, 0.15)' },
              { offset: 1, color: 'rgba(142, 68, 173, 0.02)' }
            ]
          }
        }
      }
    ]
  }
})
</script>

<style scoped>
.chart-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.weather-info {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.info-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #fef9e7;
  color: #f39c12;
  font-weight: 500;
}

.info-badge.pressure-trend.falling {
  background: #e8f8f0;
  color: #27ae60;
}

.info-badge.pressure-trend.rising {
  background: #fde8e8;
  color: #e74c3c;
}

.info-badge.pressure-trend.stable {
  background: #f0f0f0;
  color: #7f8c8d;
}

.chart-container {
  height: 200px;
}

.wind-strip {
  margin-top: 4px;
  padding: 0 50px 0 50px;
  overflow: hidden;
}

.wind-strip-inner {
  display: flex;
  justify-content: space-between;
}

.wind-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  flex: 1;
  min-width: 0;
  cursor: default;
}

.wind-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.wind-speed-label {
  font-size: 9px;
  font-weight: 600;
  color: #34495e;
  line-height: 1.2;
}

.wind-time-label {
  font-size: 9px;
  color: #95a5a6;
  line-height: 1.2;
}
</style>
