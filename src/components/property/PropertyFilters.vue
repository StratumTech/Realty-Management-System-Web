<template>
  <div class="property-filters">
    <div class="filters-header">
      <h5>🔍 Фильтры и сортировка</h5>
      <button @click="toggleFilters" class="toggle-btn">
        {{ showFilters ? '▲ Скрыть' : '▼ Показать' }}
      </button>
    </div>

    <div v-show="showFilters" class="filters-content">

      <div class="quick-filters">
        <button
          v-for="filter in quickFilters"
          :key="filter.key"
          class="quick-filter-btn"
          :class="{ active: activeQuickFilter === filter.key }"
          @click="applyQuickFilter(filter.key)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="main-filters">
        <div class="filter-row">

          <div class="filter-group">
            <label>Тип сделки</label>
            <select v-model="filters.dealType" @change="applyFilters">
              <option value="">Все</option>
              <option value="sale">Продажа</option>
              <option value="rent">Аренда</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Тип недвижимости</label>
            <select v-model="filters.propertyType" @change="applyFilters">
              <option value="">Все</option>
              <option value="1+1">1+1 (евро)</option>
              <option value="2+1">2+1</option>
              <option value="3+1">3+1</option>
              <option value="studio">Студия</option>
              <option value="house">Дом</option>
              <option value="commercial">Коммерческая</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Статус</label>
            <select v-model="filters.propertyStatus" @change="applyFilters">
              <option value="">Все</option>
              <option value="available">Доступно/Свободно</option>
              <option value="reserved">Забронировано</option>
              <option value="sold">Продано</option>
              <option value="rented">Арендовано</option>
            </select>
          </div>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <label>Цена от</label>
            <input
              v-model.number="filters.priceFrom"
              type="number"
              placeholder="0"
              @input="applyFilters"
            />
          </div>

          <div class="filter-group">
            <label>Цена до</label>
            <input
              v-model.number="filters.priceTo"
              type="number"
              placeholder="∞"
              @input="applyFilters"
            />
          </div>

          <div class="filter-group features-filter">
            <label>Особенности недвижимости</label>
            <div class="features-input-container">
              <select
                v-model="selectedFeature"
                @change="addFeatureFromSelect"
                class="features-select"
              >
                <option value="">Выберите особенность...</option>
                <option
                  v-for="feature in availableFeatures"
                  :key="feature"
                  :value="feature"
                  :disabled="filters.selectedFeatures.includes(feature)"
                >
                  {{ feature }}
                </option>
              </select>
              <input
                v-model="customFeature"
                type="text"
                placeholder="Или введите свою..."
                @keyup.enter="addCustomFeature"
                class="features-input"
              />
              <button
                type="button"
                @click="addCustomFeature"
                :disabled="!customFeature.trim()"
                class="add-feature-btn"
              >
                ➕
              </button>
            </div>
            <div v-if="filters.selectedFeatures.length > 0" class="selected-features">
              <span
                v-for="feature in filters.selectedFeatures"
                :key="feature"
                class="feature-tag"
              >
                {{ feature }}
                <button
                  type="button"
                  @click="removeFeature(feature)"
                  class="remove-feature"
                >
                  ✕
                </button>
              </span>
            </div>
          </div>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <label>Доступно с</label>
            <input
              v-model="filters.availableFrom"
              type="date"
              @change="applyFilters"
            />
          </div>

          <div class="filter-group">
            <label>Доступно до</label>
            <input
              v-model="filters.availableTo"
              type="date"
              @change="applyFilters"
            />
          </div>

          <div class="filter-group">
            <label>Сортировка</label>
            <select v-model="filters.sortBy" @change="applyFilters">
              <option value="createdAt-desc">Дата добавления ↓</option>
              <option value="createdAt-asc">Дата добавления ↑</option>
              <option value="price-desc">Цена ↓</option>
              <option value="price-asc">Цена ↑</option>
              <option value="title-asc">Название ↑</option>
              <option value="title-desc">Название ↓</option>
              <option value="status-asc">Статус ↑</option>
            </select>
          </div>
        </div>
      </div>

      <div class="filter-actions">
        <button @click="resetFilters" class="btn btn-secondary">
          🔄 Сбросить
        </button>
        <div class="results-count">
          Найдено: {{ filteredCount }} из {{ totalCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  totalCount: {
    type: Number,
    default: 0
  },
  filteredCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['filter-change'])

const showFilters = ref(false)
const activeQuickFilter = ref('')

const filters = reactive({
  dealType: '',
  propertyType: '',
  propertyStatus: '',
  priceFrom: null,
  priceTo: null,
  tagSearch: '',
  selectedFeatures: [],
  availableFrom: '',
  availableTo: '',
  sortBy: 'createdAt-desc'
})

const selectedFeature = ref('')
const customFeature = ref('')

const availableFeatures = ref([
  'Новостройка',
  'Вторичка',
  'Евроремонт',
  'Требует ремонта',
  'Мебель',
  'Техника',
  'Балкон',
  'Лоджия',
  'Парковка',
  'Лифт',
  'Охрана',
  'Детская площадка',
  'Рядом метро',
  'Центр города',
  'Тихий район',
  'Развитая инфраструктура',
  'Школы рядом',
  'Больницы рядом',
  'Торговые центры',
  'Парк рядом'
])

const quickFilters = [
  { key: 'all', label: '🏠 Все' },
  { key: 'available', label: '🟢 Доступные' },
  { key: 'sale', label: '💰 Продажа' },
  { key: 'rent', label: '🏠 Аренда' },
  { key: 'expensive', label: '💎 Дорогие' },
  { key: 'recent', label: '🆕 Новые' }
]

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const applyQuickFilter = (filterKey) => {
  activeQuickFilter.value = filterKey

  resetFilters()

  switch (filterKey) {
    case 'all':

      break
    case 'available':
      filters.propertyStatus = 'available'
      break
    case 'sale':
      filters.dealType = 'sale'
      break
    case 'rent':
      filters.dealType = 'rent'
      break
    case 'expensive':
      filters.sortBy = 'price-desc'
      break
    case 'recent':
      filters.sortBy = 'createdAt-desc'
      break
  }

  applyFilters()
}

const addFeatureFromSelect = () => {
  if (selectedFeature.value && !filters.selectedFeatures.includes(selectedFeature.value)) {
    filters.selectedFeatures.push(selectedFeature.value)
    selectedFeature.value = ''
    applyFilters()
  }
}

const addCustomFeature = () => {
  const feature = customFeature.value.trim()
  if (feature && !filters.selectedFeatures.includes(feature)) {
    filters.selectedFeatures.push(feature)
    customFeature.value = ''
    applyFilters()
  }
}

const removeFeature = (feature) => {
  const index = filters.selectedFeatures.indexOf(feature)
  if (index > -1) {
    filters.selectedFeatures.splice(index, 1)
    applyFilters()
  }
}

const applyFilters = () => {
  emit('filter-change', { ...filters })
}

const resetFilters = () => {
  Object.assign(filters, {
    dealType: '',
    propertyType: '',
    propertyStatus: '',
    priceFrom: null,
    priceTo: null,
    tagSearch: '',
    selectedFeatures: [],
    availableFrom: '',
    availableTo: '',
    sortBy: 'createdAt-desc'
  })
  selectedFeature.value = ''
  customFeature.value = ''
  activeQuickFilter.value = ''
  applyFilters()
}
applyFilters()
</script>

<style scoped>
.property-filters {
  background: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.filters-header h5 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.toggle-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: #666;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #e9ecef;
}

.filters-content {
  padding: 1rem;
}

.quick-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.quick-filter-btn {
  padding: 0.5rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.quick-filter-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.quick-filter-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.main-filters {
  margin-bottom: 1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.25rem;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #007bff;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.results-count {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .quick-filters {
    justify-content: center;
  }

  .filter-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
}

/* Стили для фильтра особенностей */
.features-filter {
  min-width: 300px;
}

.features-input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.features-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.features-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.add-feature-btn {
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #4a7c59 0%, #2d5a27 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.add-feature-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a8c69 0%, #3d6a37 100%);
}

.add-feature-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selected-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #4a7c59 0%, #2d5a27 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.remove-feature {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.7rem;
  padding: 0;
  margin-left: 0.25rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.remove-feature:hover {
  opacity: 1;
}
</style>
