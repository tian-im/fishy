<template>
  <div class="day-tabs">
    <div class="tabs-scroll">
      <DayCard
        v-for="(day, index) in days"
        :key="index"
        :date="day.date"
        :dayIndex="index"
        :isActive="selectedIndex === index"
        :tempMax="day.tempMax"
        :tempMin="day.tempMin"
        :weatherCode="day.weatherCode"
        :maxWaveHeight="day.maxWaveHeight"
        :swellPeriod="day.swellPeriod"
        :swellDirection="day.swellDirection"
        :fishingScore="day.fishingScore"
        @select="$emit('select', index)"
      />
    </div>
  </div>
</template>

<script setup>
import DayCard from './DayCard.vue'

defineProps({
  days: {
    type: Array,
    required: true
  },
  selectedIndex: {
    type: Number,
    default: 0
  }
})

defineEmits(['select'])
</script>

<style scoped>
.day-tabs {
  padding: 12px 0;
  background: #f8fafb;
}

.tabs-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 16px 8px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.tabs-scroll::-webkit-scrollbar {
  height: 4px;
}

.tabs-scroll::-webkit-scrollbar-track {
  background: #e8e8e8;
  border-radius: 2px;
}

.tabs-scroll::-webkit-scrollbar-thumb {
  background: #bdc3c7;
  border-radius: 2px;
}
</style>
