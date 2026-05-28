import { ref } from 'vue'

const weatherData = ref(null)
const isLoading = ref(false)
const error = ref(null)

export function useWeather() {
  async function fetchWeather(lat, lng) {
    isLoading.value = true
    error.value = null

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,wind_gusts_10m_max&timezone=auto&forecast_days=7&wind_speed_unit=kmh`

      const response = await fetch(url)
      if (!response.ok) throw new Error('Weather API failed')

      const data = await response.json()
      weatherData.value = data
      return data
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  function getDayData(dayIndex) {
    if (!weatherData.value) return null

    const hourly = weatherData.value.hourly
    const daily = weatherData.value.daily
    const startIdx = dayIndex * 24
    const endIdx = startIdx + 24

    return {
      date: daily.time[dayIndex],
      tempMax: daily.temperature_2m_max[dayIndex],
      tempMin: daily.temperature_2m_min[dayIndex],
      sunrise: daily.sunrise[dayIndex],
      sunset: daily.sunset[dayIndex],
      precipitation: daily.precipitation_sum[dayIndex],
      maxGust: daily.wind_gusts_10m_max[dayIndex],
      hourly: {
        time: hourly.time.slice(startIdx, endIdx),
        temperature: hourly.temperature_2m.slice(startIdx, endIdx),
        pressure: hourly.pressure_msl.slice(startIdx, endIdx),
        windSpeed: hourly.wind_speed_10m.slice(startIdx, endIdx),
        windDirection: hourly.wind_direction_10m.slice(startIdx, endIdx),
        windGusts: hourly.wind_gusts_10m.slice(startIdx, endIdx),
        weatherCode: hourly.weather_code.slice(startIdx, endIdx)
      }
    }
  }

  function getPressureTrend(dayIndex) {
    const dayData = getDayData(dayIndex)
    if (!dayData || dayData.hourly.pressure.length < 2) return 'stable'

    const pressures = dayData.hourly.pressure.filter(p => p !== null)
    if (pressures.length < 2) return 'stable'

    const first = pressures[0]
    const last = pressures[pressures.length - 1]
    const diff = last - first

    if (diff > 2) return 'rising'
    if (diff < -2) return 'falling'
    return 'stable'
  }

  return {
    weatherData,
    isLoading,
    error,
    fetchWeather,
    getDayData,
    getPressureTrend
  }
}
