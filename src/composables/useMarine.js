import { ref } from 'vue'

const marineData = ref(null)
const isLoading = ref(false)
const error = ref(null)

export function useMarine() {
  async function fetchMarine(lat, lng) {
    isLoading.value = true
    error.value = null

    try {
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,ocean_current_velocity,ocean_current_direction,sea_level_height_msl,sea_surface_temperature&timezone=auto&forecast_days=7`

      const response = await fetch(url)
      if (!response.ok) throw new Error('Marine API failed')

      const data = await response.json()
      marineData.value = data
      return data
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  function getDayMarineData(dayIndex) {
    if (!marineData.value) return null

    const hourly = marineData.value.hourly
    const startIdx = dayIndex * 24
    const endIdx = startIdx + 24

    return {
      hourly: {
        time: hourly.time.slice(startIdx, endIdx),
        waveHeight: hourly.wave_height.slice(startIdx, endIdx),
        waveDirection: hourly.wave_direction.slice(startIdx, endIdx),
        wavePeriod: hourly.wave_period.slice(startIdx, endIdx),
        swellHeight: hourly.swell_wave_height.slice(startIdx, endIdx),
        swellDirection: hourly.swell_wave_direction.slice(startIdx, endIdx),
        swellPeriod: hourly.swell_wave_period.slice(startIdx, endIdx),
        currentVelocity: hourly.ocean_current_velocity.slice(startIdx, endIdx),
        currentDirection: hourly.ocean_current_direction.slice(startIdx, endIdx),
        seaLevel: hourly.sea_level_height_msl.slice(startIdx, endIdx),
        seaTemp: hourly.sea_surface_temperature.slice(startIdx, endIdx)
      }
    }
  }

  function getTideData(dayIndex) {
    const dayData = getDayMarineData(dayIndex)
    if (!dayData) return { heights: [], times: [], highTides: [], lowTides: [] }

    const seaLevels = dayData.hourly.seaLevel
    const times = dayData.hourly.time

    const highTides = []
    const lowTides = []

    for (let i = 1; i < seaLevels.length - 1; i++) {
      if (seaLevels[i] > seaLevels[i - 1] && seaLevels[i] > seaLevels[i + 1]) {
        highTides.push({ time: times[i], height: seaLevels[i] })
      }
      if (seaLevels[i] < seaLevels[i - 1] && seaLevels[i] < seaLevels[i + 1]) {
        lowTides.push({ time: times[i], height: seaLevels[i] })
      }
    }

    return {
      heights: seaLevels,
      times: times,
      highTides,
      lowTides
    }
  }

  function getDaySummary(dayIndex) {
    const dayData = getDayMarineData(dayIndex)
    if (!dayData) return null

    const waveHeights = dayData.hourly.waveHeight.filter(h => h !== null)
    const swellHeights = dayData.hourly.swellHeight.filter(h => h !== null)
    const swellPeriods = dayData.hourly.swellPeriod.filter(p => p !== null)
    const swellDirections = dayData.hourly.swellDirection.filter(d => d !== null)
    const seaTemps = dayData.hourly.seaTemp.filter(t => t !== null)

    return {
      maxWaveHeight: waveHeights.length ? Math.max(...waveHeights) : null,
      avgWaveHeight: waveHeights.length ? waveHeights.reduce((a, b) => a + b, 0) / waveHeights.length : null,
      maxSwellHeight: swellHeights.length ? Math.max(...swellHeights) : null,
      avgSwellPeriod: swellPeriods.length ? swellPeriods.reduce((a, b) => a + b, 0) / swellPeriods.length : null,
      dominantSwellDirection: swellDirections.length ? getDominantDirection(swellDirections) : null,
      seaTemp: seaTemps.length ? seaTemps.reduce((a, b) => a + b, 0) / seaTemps.length : null
    }
  }

  return {
    marineData,
    isLoading,
    error,
    fetchMarine,
    getDayMarineData,
    getTideData,
    getDaySummary
  }
}

function getDominantDirection(directions) {
  const sinSum = directions.reduce((sum, d) => sum + Math.sin(d * Math.PI / 180), 0)
  const cosSum = directions.reduce((sum, d) => sum + Math.cos(d * Math.PI / 180), 0)
  let avg = Math.atan2(sinSum, cosSum) * 180 / Math.PI
  if (avg < 0) avg += 360
  return avg
}
