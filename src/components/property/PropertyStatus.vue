<template>
  <div class="property-status">
    <label class="status-label">📊 Статус недвижимости</label>

    <div class="status-selector">
      <div class="status-options">
        <button
          v-for="status in availableStatuses"
          :key="status.value"
          type="button"
          class="status-button"
          :class="{ 'selected': modelValue === status.value }"
          @click="updateStatus(status.value)"
        >
          <span class="status-icon">{{ status.icon }}</span>
          <span class="status-text">{{ status.label }}</span>
        </button>
      </div>

      <div v-if="modelValue" class="current-status-info">
        <div class="status-description">
          {{ getStatusDescription(modelValue) }}
        </div>
        <div v-if="showDateInfo" class="status-date">
          Обновлено: {{ formatDate(new Date()) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'available'
  },
  dealType: {
    type: String,
    required: true
  },
  showDateInfo: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const saleStatuses = [
  { value: 'available', label: 'Доступно', icon: '🟢', description: 'Недвижимость доступна для продажи' },
  { value: 'reserved', label: 'Забронировано', icon: '🟡', description: 'Недвижимость забронирована покупателем' },
  { value: 'sold', label: 'Продано', icon: '🔴', description: 'Недвижимость успешно продана' }
]

const rentStatuses = [
  { value: 'available', label: 'Свободно', icon: '🟢', description: 'Недвижимость свободна для аренды' },
  { value: 'reserved', label: 'Забронировано', icon: '🟡', description: 'Недвижимость забронирована арендатором' },
  { value: 'rented', label: 'Арендовано', icon: '🔴', description: 'Недвижимость сдана в аренду' }
]

const availableStatuses = computed(() => {
  return props.dealType === 'rent' ? rentStatuses : saleStatuses
})

const updateStatus = (status) => {
  emit('update:modelValue', status)
}

const getStatusDescription = (status) => {
  const statusObj = availableStatuses.value.find(s => s.value === status)
  return statusObj ? statusObj.description : ''
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.property-status {
  margin-bottom: 1rem;
}

.status-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.status-selector {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1rem;
  background: #f8f9fa;
}

.status-options {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.status-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.status-button:hover {
  border-color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1);
}

.status-button.selected {
  background: #007bff;
  border-color: #007bff;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.status-icon {
  font-size: 1.1rem;
}

.status-text {
  font-weight: 500;
}

.current-status-info {
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.status-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.status-date {
  font-size: 0.8rem;
  color: #999;
}

/* Адаптивность */
@media (max-width: 768px) {
  .status-options {
    flex-direction: column;
  }

  .status-button {
    min-width: auto;
    width: 100%;
    justify-content: center;
  }
}
</style>
