import { ref } from 'vue'

const windUnit = ref('kn')
const tempUnit = ref('c')
const heightUnit = ref('m')

export function useUnits() {
  function setWindUnit(unit) {
    windUnit.value = unit
  }

  function setTempUnit(unit) {
    tempUnit.value = unit
  }

  function setHeightUnit(unit) {
    heightUnit.value = unit
  }

  function cycleWindUnit() {
    const units = ['kn', 'kmh', 'ms']
    const idx = units.indexOf(windUnit.value)
    windUnit.value = units[(idx + 1) % units.length]
  }

  function cycleTempUnit() {
    tempUnit.value = tempUnit.value === 'c' ? 'f' : 'c'
  }

  function cycleHeightUnit() {
    heightUnit.value = heightUnit.value === 'm' ? 'ft' : 'm'
  }

  return {
    windUnit,
    tempUnit,
    heightUnit,
    setWindUnit,
    setTempUnit,
    setHeightUnit,
    cycleWindUnit,
    cycleTempUnit,
    cycleHeightUnit
  }
}
