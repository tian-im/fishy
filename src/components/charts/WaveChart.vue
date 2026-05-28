<template>
  <div class="chart-section">
    <div class="section-header">
      <h3>🌊 Wave & Swell</h3>
      <div class="swell-info">
        <span class="info-badge">↗ {{ swellDirectionText }}</span>
        <span class="info-badge">⏱ {{ avgPeriod }}s</span>
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
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { degreesToCompass, convertHeight } from '../../utils/format.js'
import { useUnits } from '../../composables/useUnits.js'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  times: { type: Array, default: () => [] },
  waveHeights: { type: Array, default: () => [] },
  swellHeights: { type: Array, default: () => [] },
  swellDirections: { type: Array, default: () => [] },
  swellPeriods: { type: Array, default: () => [] }
})

const { heightUnit } = useUnits()

const swellDirectionText = computed(() => {
  const dirs = props.swellDirections.filter(d => d !== null)
  if (!dirs.length) return '—'
  const sinSum = dirs.reduce((sum, d) => sum + Math.sin(d * Math.PI / 180), 0)
  const cosSum = dirs.reduce((sum, d) => sum + Math.cos(d * Math.PI / 180), 0)
  let avg = Math.atan2(sinSum, cosSum) * 180 / Math.PI
  if (avg < 0) avg += 360
  return degreesToCompass(avg)
})

const avgPeriod = computed(() => {
  const periods = props.swellPeriods.filter(p => p !== null)
  if (!periods.length) return '—'
  return Math.round(periods.reduce((a, b) => a + b, 0) / periods.length)
})

const chartOption = computed(() => {
  const timeLabels = props.times.map(t => {
    const date = new Date(t)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  })

  const convertedWaves = props.waveHeights.map(h => convertHeight(h, heightUnit.value))
  const convertedSwells = props.swellHeights.map(h => convertHeight(h, heightUnit.value))
  const unit = heightUnit.value === 'm' ? 'm' : 'ft'

  return {
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].name + '<br/>'
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)}${unit}<br/>`
        })
        return result
      }
    },
    legend: {
      top: 0,
      textStyle: { fontSize: 11 }
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
    series: [
      {
        name: 'Wave',
        type: 'line',
        smooth: true,
        data: convertedWaves,
        lineStyle: { color: '#2980b9', width: 2 },
        itemStyle: { color: '#2980b9' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(41, 128, 185, 0.2)' },
              { offset: 1, color: 'rgba(41, 128, 185, 0.02)' }
            ]
          }
        }
      },
      {
        name: 'Swell',
        type: 'line',
        smooth: true,
        data: convertedSwells,
        lineStyle: { color: '#e67e22', width: 2, type: 'dashed' },
        itemStyle: { color: '#e67e22' }
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

.swell-info {
  display: flex;
  gap: 6px;
}

.info-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f8ff;
  color: #2980b9;
  font-weight: 500;
}

.chart-container {
  height: 200px;
}
</style>
