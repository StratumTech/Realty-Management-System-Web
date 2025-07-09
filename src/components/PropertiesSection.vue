<template>
  <div class="properties-section">
    <div class="section-title">
      🏢 Моя недвижимость
    </div>
    
    <div v-if="properties.length > 0" class="properties-list">
      <div 
        v-for="property in properties" 
        :key="property.id" 
        class="property-card"
        :class="{ 'unpaid': property.status === 'unpaid' }"
      >
        <div class="property-header">
          <h4 class="property-title">{{ property.title }}</h4>
          <span class="status-badge" :class="`status-${property.status}`">
            {{ property.status === 'paid' ? 'Оплачено' : 'Не оплачено' }}
          </span>
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
      <h3>У вас пока нет недвижимости</h3>
      <p>Добавьте свой первый объект на карту</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agentStore = useAgentStore()

const properties = computed(() => agentStore.properties)

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
  max-height: 400px;
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
