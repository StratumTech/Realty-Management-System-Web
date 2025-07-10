<template>
  <div class="properties-section">
    <div class="section-title">
      🏢 Моя недвижимость
    </div>

    <PropertyFilters
      :total-count="properties.length"
      :filtered-count="filteredProperties.length"
      @filter-change="handleFilterChange"
    />

    <div v-if="filteredProperties.length > 0" class="properties-list">
      <div
        v-for="property in filteredProperties"
        :key="property.id"
        class="property-card"
        :class="{ 'unpaid': property.status === 'unpaid' }"
      >
        <div class="property-header">
          <h4 class="property-title">{{ property.title }}</h4>
          <div class="status-badges">
            <span class="status-badge" :class="`status-${property.status}`">
              {{ property.status === 'paid' ? 'Оплачено' : 'Не оплачено' }}
            </span>
            <span class="property-status-badge" :class="`property-status-${property.propertyStatus}`">
              {{ getPropertyStatusText(property.propertyStatus, property.dealType) }}
            </span>
          </div>
        </div>

        <div class="property-details">
          <div class="property-address">📍 {{ property.address }}</div>
          <div class="property-price">
            💰 {{ formatPrice(property.price) }}
            <span class="deal-type">{{ getDealTypeText(property.dealType) }}</span>
          </div>
          <div class="property-type">🏠 {{ getPropertyTypeText(property.propertyType) }}</div>
          <div v-if="property.description" class="property-description">
            {{ property.description }}
          </div>

          <div v-if="property.tags && property.tags.length > 0" class="property-tags">
            <span
              v-for="tag in property.tags.slice(0, 4)"
              :key="tag"
              class="property-tag"
            >
              {{ tag }}
            </span>
            <span v-if="property.tags.length > 4" class="more-tags">
              +{{ property.tags.length - 4 }}
            </span>
          </div>
        </div>

        <div class="property-actions">
          <button
            v-if="property.status === 'unpaid'"
            class="btn btn-primary btn-small"
            @click="payForProperty(property.id)"
          >
            💳 Оплатить (500₽)
          </button>
          <button
            class="btn btn-outline btn-small"
            @click="editProperty(property)"
          >
            ✏️ Редактировать
          </button>
          <button
            class="btn btn-danger btn-small"
            @click="removeProperty(property.id)"
          >
            🗑️ Удалить
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">🏠</div>
      <h3>{{ properties.length === 0 ? 'У вас пока нет недвижимости' : 'Нет недвижимости по заданным фильтрам' }}</h3>
      <p>{{ properties.length === 0 ? 'Добавьте свой первый объект на карту' : 'Попробуйте изменить параметры фильтрации' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAgentStore } from '@/stores/agent'
import PropertyFilters from './PropertyFilters.vue'

const agentStore = useAgentStore()

const properties = computed(() => agentStore.properties)
const currentFilters = ref({
  dealType: '',
  propertyType: '',
  propertyStatus: '',
  priceFrom: null,
  priceTo: null,
  tagSearch: '',
  availableFrom: '',
  availableTo: '',
  sortBy: 'createdAt-desc'
})

const filteredProperties = computed(() => {
  let filtered = [...properties.value]

  if (currentFilters.value.dealType) {
    filtered = filtered.filter(p => p.dealType === currentFilters.value.dealType)
  }

  if (currentFilters.value.propertyType) {
    filtered = filtered.filter(p => p.propertyType === currentFilters.value.propertyType)
  }

  if (currentFilters.value.propertyStatus) {
    filtered = filtered.filter(p => p.propertyStatus === currentFilters.value.propertyStatus)
  }

  if (currentFilters.value.priceFrom !== null && currentFilters.value.priceFrom !== '') {
    filtered = filtered.filter(p => p.price >= currentFilters.value.priceFrom)
  }
  if (currentFilters.value.priceTo !== null && currentFilters.value.priceTo !== '') {
    filtered = filtered.filter(p => p.price <= currentFilters.value.priceTo)
  }

  if (currentFilters.value.tagSearch) {
    const searchTerm = currentFilters.value.tagSearch.toLowerCase()
    filtered = filtered.filter(p =>
      p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  if (currentFilters.value.availableFrom || currentFilters.value.availableTo) {
    filtered = filtered.filter(p => {
      if (p.dealType === 'rent' && p.rental) {
        return isAvailableInPeriod(p, currentFilters.value.availableFrom, currentFilters.value.availableTo)
      } else if (p.dealType === 'sale') {
        return p.propertyStatus === 'available'
      }
      return true
    })
  }

  return sortProperties(filtered, currentFilters.value.sortBy)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price) + '₽'
}

const getDealTypeText = (dealType) => {
  const types = {
    sale: 'продажа',
    rent: 'аренда'
  }
  return types[dealType] || dealType
}

const getPropertyTypeText = (propertyType) => {
  const types = {
    '1+1': '1+1 (евро)',
    '2+1': '2+1 (две спальни и зал)',
    '3+1': '3+1 (три спальни и зал)',
    'studio': 'Студия',
    'house': 'Дом',
    'commercial': 'Коммерческая'
  }
  return types[propertyType] || propertyType
}

const getPropertyStatusText = (status, dealType) => {
  if (dealType === 'rent') {
    const rentStatuses = {
      'available': '🟢 Свободно',
      'reserved': '🟡 Забронировано',
      'rented': '🔴 Арендовано'
    }
    return rentStatuses[status] || status
  } else {
    const saleStatuses = {
      'available': '🟢 Доступно',
      'reserved': '🟡 Забронировано',
      'sold': '🔴 Продано'
    }
    return saleStatuses[status] || status
  }
}

const isAvailableInPeriod = (property, fromDate, toDate) => {
  if (!property.rental || !property.rental.rentPeriods) return true

  const from = fromDate ? new Date(fromDate) : null
  const to = toDate ? new Date(toDate) : null

  const rentPeriods = property.rental.rentPeriods

  for (const period of rentPeriods) {
    const periodStart = new Date(period.startDate)
    const periodEnd = new Date(period.endDate)

    if (period.status === 'active') {
      if (from && to) {
        if (!(periodEnd < from || periodStart > to)) {
          return false
        }
      } else if (from) {
        if (periodStart <= from && periodEnd >= from) {
          return false
        }
      } else if (to) {
        if (periodStart <= to && periodEnd >= to) {
          return false
        }
      }
    }
  }

  return true
}

const sortProperties = (properties, sortBy) => {
  const [field, direction] = sortBy.split('-')

  return properties.sort((a, b) => {
    let aValue, bValue

    switch (field) {
      case 'price':
        aValue = a.price
        bValue = b.price
        break
      case 'createdAt':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'status':
        aValue = a.propertyStatus
        bValue = b.propertyStatus
        break
      default:
        return 0
    }

    if (direction === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })
}

const handleFilterChange = (filters) => {
  currentFilters.value = { ...filters }
}

const payForProperty = (propertyId) => {
  if (confirm('Оплатить размещение объекта на карте за 500₽?')) {
    agentStore.payForProperty(propertyId)
  }
}

const editProperty = (property) => {
  agentStore.selectedProperty = property
  agentStore.openModal('editPropertyModal')
}

const removeProperty = (propertyId) => {
  if (confirm('Вы действительно хотите удалить этот объект?')) {
    agentStore.removeProperty(propertyId)
  }
}
</script>

<style scoped>
.properties-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-height: 800px;
  overflow-y: auto;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.property-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.property-card.unpaid {
  border-left: 4px solid #ffc107;
  background: #fff8e1;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.status-badges {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: flex-end;
}

.property-title {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.property-details {
  margin-bottom: 1rem;
}

.property-details > div {
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: #555;
}

.property-address {
  font-weight: 500;
}

.property-price {
  color: #4caf50;
  font-weight: 600;
}

.deal-type {
  color: #666;
  font-weight: normal;
  font-size: 0.8rem;
}

.property-description {
  color: #666;
  font-style: italic;
  margin-top: 0.5rem;
}

.property-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.5rem;
}

.property-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #bbdefb;
}

.more-tags {
  background: #f5f5f5;
  color: #666;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #e0e0e0;
}

.property-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-paid {
  background: #d4edda;
  color: #155724;
}

.status-unpaid {
  background: #fff3cd;
  color: #856404;
}

.property-status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.property-status-available {
  background: #d4edda;
  color: #155724;
}

.property-status-reserved {
  background: #fff3cd;
  color: #856404;
}

.property-status-sold,
.property-status-rented {
  background: #f8d7da;
  color: #721c24;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  color: #666;
}

.btn {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.8rem;
}

.btn-primary {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid #4caf50;
  color: #4caf50;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-small {
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .property-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .property-actions {
    flex-direction: column;
  }

  .properties-section {
    max-height: 300px;
  }
}
</style>
