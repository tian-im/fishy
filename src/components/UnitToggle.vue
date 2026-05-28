<template>
  <div class="unit-toggle">
    <button
      v-for="unit in units"
      :key="unit.value"
      class="unit-btn"
      :class="{ active: modelValue === unit.value }"
      @click="$emit('update:modelValue', unit.value)"
    >
      {{ unit.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  units: {
    type: Array,
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.unit-toggle {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.unit-btn {
  padding: 4px 10px;
  border: none;
  background: white;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  color: #7f8c8d;
}

.unit-btn:not(:last-child) {
  border-right: 1px solid #ddd;
}

.unit-btn.active {
  background: #2980b9;
  color: white;
}

.unit-btn:hover:not(.active) {
  background: #f5f9fc;
}
</style>
