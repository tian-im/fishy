export function useFishingRating() {
  function calculateRating(dayData, marineSummary, biteTimes, pressureTrend) {
    let score = 50

    if (pressureTrend === 'falling') score += 15
    else if (pressureTrend === 'stable') score += 5
    else score -= 5

    if (dayData) {
      const avgWind = dayData.hourly.windSpeed.reduce((a, b) => a + (b || 0), 0) / dayData.hourly.windSpeed.length
      if (avgWind < 10) score += 15
      else if (avgWind < 15) score += 10
      else if (avgWind < 20) score += 5
      else score -= 5
    }

    if (biteTimes) {
      const majorCount = biteTimes.majors.length
      const minorCount = biteTimes.minors.length
      score += majorCount * 5 + minorCount * 2

      if (biteTimes.moonPhase < 0.1 || biteTimes.moonPhase > 0.9) score += 10
      else if (biteTimes.moonPhase < 0.2 || biteTimes.moonPhase > 0.8) score += 5
      else if (Math.abs(biteTimes.moonPhase - 0.5) < 0.1) score += 8
    }

    if (marineSummary) {
      if (marineSummary.maxWaveHeight !== null) {
        if (marineSummary.maxWaveHeight < 1.5) score += 10
        else if (marineSummary.maxWaveHeight < 2.5) score += 5
        else score -= 10
      }
    }

    if (dayData) {
      const avgCode = dayData.hourly.weatherCode.reduce((a, b) => a + (b || 0), 0) / dayData.hourly.weatherCode.length
      if (avgCode < 3) score += 5
      else if (avgCode > 60) score -= 10
    }

    return Math.min(100, Math.max(0, Math.round(score)))
  }

  function ratingToStars(score) {
    if (score >= 80) return 5
    if (score >= 65) return 4
    if (score >= 50) return 3
    if (score >= 35) return 2
    return 1
  }

  function ratingToLabel(score) {
    if (score >= 80) return 'Excellent'
    if (score >= 65) return 'Good'
    if (score >= 50) return 'Fair'
    if (score >= 35) return 'Poor'
    return 'Bad'
  }

  return {
    calculateRating,
    ratingToStars,
    ratingToLabel
  }
}
