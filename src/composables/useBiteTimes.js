import { ref } from 'vue'
import { calcBiteTimes } from '../utils/solunar.js'

const biteTimesData = ref({})

export function useBiteTimes() {
  function calculateBiteTimes(date, lat, lng) {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date
    const key = `${dateStr}_${lat}_${lng}`

    if (biteTimesData.value[key]) {
      return biteTimesData.value[key]
    }

    const result = calcBiteTimes(new Date(dateStr), lat, lng)
    biteTimesData.value[key] = result
    return result
  }

  function getWeekBiteTimes(startDate, lat, lng) {
    const results = []
    const start = new Date(startDate)

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      results.push(calculateBiteTimes(date, lat, lng))
    }

    return results
  }

  return {
    biteTimesData,
    calculateBiteTimes,
    getWeekBiteTimes
  }
}
