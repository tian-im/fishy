<template>
  <div class="chart-section">
    <div class="section-header">
      <h3>🌊 Tide</h3>
      <div class="tide-info">
        <span v-for="(tide, i) in highTides" :key="'h' + i" class="tide-badge high">
          H {{ formatTime(tide.time) }} {{ formatHeight(tide.height) }}
        </span>
        <span v-for="(tide, i) in lowTides" :key="'l' + i" class="tide-badge low">
          L {{ formatTime(tide.time) }} {{ formatHeight(tide.height) }}
        </span>
      </div>
    </div>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, MarkPointComponent, MarkLineComponent } from 'echarts/components'
import { convertHeight, formatTime } from '../../utils/format.js'
import { useUnits } from '../../composables/useUnits.js'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, MarkPointComponent, MarkLineComponent])

const props = defineProps({
  times: { type: Array, default: () => [] },
  heights: { type: Array, default: () => [] },
  highTides: { type: Array, default: () => [] },
  lowTides: { type: Array, default: () => [] },
  sunrise: String,
  sunset: String
})

const { heightUnit } = useUnits()

function formatHeight(value) {
  const converted = convertHeight(value, heightUnit.value)
  const unit = heightUnit.value === 'm' ? 'm' : 'ft'
  return `${converted.toFixed(1)}${unit}`
}

const chartOption = computed(() => {
  const timeLabels = props.times.map(t => {
    const date = new Date(t)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  })

  const convertedHeights = props.heights.map(h => convertHeight(h, heightUnit.value))
  const unit = heightUnit.value === 'm' ? 'm' : 'ft'

  const markPoints = [
    ...props.highTides.map(tide => ({
      name: 'H',
      coord: [
        props.times.indexOf(tide.time),
        convertHeight(tide.height, heightUnit.value)
      ],
      value: formatHeight(tide.height),
      symbol: 'pin',
      symbolSize: 40,
      itemStyle: { color: '#27ae60' }
    })),
    ...props.lowTides.map(tide => ({
      name: 'L',
      coord: [
        props.times.indexOf(tide.time),
        convertHeight(tide.height, heightUnit.value)
      ],
      value: formatHeight(tide.height),
      symbol: 'pin',
      symbolSize: 40,
      itemStyle: { color: '#e74c3c' }
    }))
  ]

  const markLines = []
  if (props.sunrise) {
    const sunriseTime = new Date(props.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    const idx = timeLabels.indexOf(sunriseTime)
    if (idx >= 0) {
      markLines.push({ xAxis: idx, label: { formatter: '🌅', position: 'start' }, lineStyle: { color: '#f39c12', type: 'dashed' } })
    }
  }
  if (props.sunset) {
    const sunsetTime = new Date(props.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    const idx = timeLabels.indexOf(sunsetTime)
    if (idx >= 0) {
      markLines.push({ xAxis: idx, label: { formatter: '🌇', position: 'start' }, lineStyle: { color: '#e67e22', type: 'dashed' } })
    }
  }

  return {
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>Height: ${p.value.toFixed(2)}${unit}`
      }
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
      axisLabel: { fontSize: 10, interval: 3 }
    },
    yAxis: {
      type: 'value',
      name: `Height (${unit})`,
      nameTextStyle: { fontSize: 10 }
    },
    series: [{
      type: 'line',
      smooth: true,
      data: convertedHeights,
      lineStyle: { color: '#2980b9', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(41, 128, 185, 0.3)' },
            { offset: 1, color: 'rgba(41, 128, 185, 0.05)' }
          ]
        }
      },
      markPoint: { data: markPoints },
      markLine: { data: markLines, silent: true }
    }]
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

.tide-info {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tide-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.tide-badge.high {
  background: #e8f8f0;
  color: #27ae60;
}

.tide-badge.low {
  background: #fde8e8;
  color: #e74c3c;
}

.chart-container {
  height: 200px;
}
</style>
