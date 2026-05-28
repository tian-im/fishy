import { ref, watch } from 'vue'

const STORAGE_KEY_LOCATION = 'fishy_current_location'
const STORAGE_KEY_RECENT = 'fishy_recent_locations'
const MAX_RECENT = 10

function loadLocation() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOCATION)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return { lat: -33.8688, lng: 151.2093, name: 'Sydney, NSW, Australia' }
}

function loadRecent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RECENT)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return []
}

const location = ref(loadLocation())
const recentLocations = ref(loadRecent())
const isLoading = ref(false)
const error = ref(null)

watch(location, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(val))
  } catch (e) {}
}, { deep: true })

function addToRecent(loc) {
  const list = recentLocations.value.filter(
    r => !(Math.abs(r.lat - loc.lat) < 0.01 && Math.abs(r.lng - loc.lng) < 0.01)
  )
  list.unshift({ name: loc.name, lat: loc.lat, lng: loc.lng })
  recentLocations.value = list.slice(0, MAX_RECENT)
  try {
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentLocations.value))
  } catch (e) {}
}

export function useLocation() {
  async function searchLocations(query) {
    if (!query || query.length < 2) return []

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=au`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await response.json()
      return data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }))
    } catch (err) {
      console.error('Search failed:', err)
      return []
    }
  }

  function setLocation(loc) {
    location.value = loc
    addToRecent(loc)
  }

  function clearRecent() {
    recentLocations.value = []
    try {
      localStorage.removeItem(STORAGE_KEY_RECENT)
    } catch (e) {}
  }

  function removeRecent(loc) {
    recentLocations.value = recentLocations.value.filter(
      r => !(Math.abs(r.lat - loc.lat) < 0.01 && Math.abs(r.lng - loc.lng) < 0.01)
    )
    try {
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentLocations.value))
    } catch (e) {}
  }

  async function useGps() {
    isLoading.value = true
    error.value = null

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        error.value = 'Geolocation not supported'
        isLoading.value = false
        resolve(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: 'Current Location'
          }

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            )
            const data = await response.json()
            if (data.display_name) {
              newLoc.name = data.display_name.split(',').slice(0, 3).join(',')
            }
          } catch (e) {}

          location.value = newLoc
          addToRecent(newLoc)
          isLoading.value = false
          resolve(true)
        },
        (err) => {
          error.value = 'GPS permission denied'
          isLoading.value = false
          resolve(false)
        },
        { timeout: 10000 }
      )
    })
  }

  return {
    location,
    recentLocations,
    isLoading,
    error,
    searchLocations,
    setLocation,
    useGps,
    clearRecent,
    removeRecent
  }
}
