import SunCalc from 'suncalc'

export function getMoonPhaseName(phase) {
  if (phase < 0.0625 || phase >= 0.9375) return 'New Moon'
  if (phase < 0.1875) return 'Waxing Crescent'
  if (phase < 0.3125) return 'First Quarter'
  if (phase < 0.4375) return 'Waxing Gibbous'
  if (phase < 0.5625) return 'Full Moon'
  if (phase < 0.6875) return 'Waning Gibbous'
  if (phase < 0.8125) return 'Last Quarter'
  return 'Waning Crescent'
}

export function getMoonPhaseEmoji(phase) {
  if (phase < 0.0625 || phase >= 0.9375) return '🌑'
  if (phase < 0.1875) return '🌒'
  if (phase < 0.3125) return '🌓'
  if (phase < 0.4375) return '🌔'
  if (phase < 0.5625) return '🌕'
  if (phase < 0.6875) return '🌖'
  if (phase < 0.8125) return '🌗'
  return '🌘'
}

export function calcBiteTimes(date, lat, lng) {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const moonIllum = SunCalc.getMoonIllumination(date)
  const moonTimes = SunCalc.getMoonTimes(date, lat, lng)
  const sunTimes = SunCalc.getTimes(date, lat, lng)

  const moonTransits = findMoonTransits(date, lat, lng)

  const majors = moonTransits.map(transit => ({
    start: new Date(transit.getTime() - 1.5 * 60 * 60 * 1000),
    end: new Date(transit.getTime() + 1.5 * 60 * 60 * 1000),
    peak: transit,
    type: 'major'
  }))

  const minors = []
  if (moonTimes.rise) {
    minors.push({
      start: new Date(moonTimes.rise.getTime() - 30 * 60 * 1000),
      end: new Date(moonTimes.rise.getTime() + 30 * 60 * 1000),
      peak: moonTimes.rise,
      type: 'minor'
    })
  }
  if (moonTimes.set) {
    minors.push({
      start: new Date(moonTimes.set.getTime() - 30 * 60 * 1000),
      end: new Date(moonTimes.set.getTime() + 30 * 60 * 1000),
      peak: moonTimes.set,
      type: 'minor'
    })
  }

  const biteQuality = calculateBiteQuality(moonIllum, moonTransits, sunTimes)

  return {
    majors,
    minors,
    moonPhase: moonIllum.phase,
    moonPhaseName: getMoonPhaseName(moonIllum.phase),
    moonPhaseEmoji: getMoonPhaseEmoji(moonIllum.phase),
    moonIllumination: moonIllum.fraction,
    moonrise: moonTimes.rise,
    moonset: moonTimes.set,
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    quality: biteQuality
  }
}

function findMoonTransits(date, lat, lng) {
  const transits = []
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  let prevAlt = SunCalc.getMoonPosition(dayStart, lat, lng).altitude
  let prevTime = dayStart

  for (let i = 10; i <= 1440; i += 10) {
    const time = new Date(dayStart.getTime() + i * 60 * 1000)
    const pos = SunCalc.getMoonPosition(time, lat, lng)
    const alt = pos.altitude

    if (prevAlt < alt && i > 10) {
      const nextTime = new Date(dayStart.getTime() + (i + 10) * 60 * 1000)
      if (i + 10 <= 1440) {
        const nextPos = SunCalc.getMoonPosition(nextTime, lat, lng)
        if (nextPos.altitude <= alt) {
          const peakTime = refinePeak(prevTime, time, nextTime, lat, lng)
          transits.push(peakTime)
        }
      }
    }

    prevAlt = alt
    prevTime = time
  }

  return transits
}

function refinePeak(t1, t2, t3, lat, lng) {
  let left = t1.getTime()
  let right = t3.getTime()

  for (let i = 0; i < 10; i++) {
    const mid1 = left + (right - left) / 3
    const mid2 = right - (right - left) / 3
    const alt1 = SunCalc.getMoonPosition(new Date(mid1), lat, lng).altitude
    const alt2 = SunCalc.getMoonPosition(new Date(mid2), lat, lng).altitude

    if (alt1 < alt2) {
      left = mid1
    } else {
      right = mid2
    }
  }

  return new Date((left + right) / 2)
}

function calculateBiteQuality(moonIllum, transits, sunTimes) {
  let quality = 50

  if (moonIllum.phase < 0.1 || moonIllum.phase > 0.9) {
    quality += 20
  } else if (moonIllum.phase < 0.2 || moonIllum.phase > 0.8) {
    quality += 10
  } else if (Math.abs(moonIllum.phase - 0.5) < 0.1) {
    quality += 15
  }

  quality += transits.length * 5

  if (sunTimes.sunrise && sunTimes.sunset) {
    const daylightHours = (sunTimes.sunset - sunTimes.sunrise) / (1000 * 60 * 60)
    quality += Math.min(10, daylightHours)
  }

  return Math.min(100, Math.max(0, quality))
}
