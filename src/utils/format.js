export function formatDate(dateStr, format = 'short') {
  const date = new Date(dateStr)
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  if (format === 'long') {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTime(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatTime12(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function degreesToCompass(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export function convertWindSpeed(kmh, unit) {
  if (unit === 'kn') return kmh * 0.539957
  if (unit === 'ms') return kmh / 3.6
  return kmh
}

export function convertTemperature(celsius, unit) {
  if (unit === 'f') return celsius * 9 / 5 + 32
  return celsius
}

export function convertHeight(meters, unit) {
  if (unit === 'ft') return meters * 3.28084
  return meters
}

export function formatValue(value, unit, decimals = 1) {
  if (value === null || value === undefined) return '—'
  const converted = unit === 'wind' ? convertWindSpeed(value, unit) :
                    unit === 'temp' ? convertTemperature(value, unit) :
                    unit === 'height' ? convertHeight(value, unit) : value
  return converted.toFixed(decimals)
}

export function getUnitSymbol(unit) {
  const symbols = {
    wind: { kn: 'kn', kmh: 'km/h', ms: 'm/s' },
    temp: { c: '°C', f: '°F' },
    height: { m: 'm', ft: 'ft' }
  }
  return symbols[unit] || {}
}
