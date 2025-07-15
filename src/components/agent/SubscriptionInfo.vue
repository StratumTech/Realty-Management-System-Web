<template>
  <div class="subscription-info-widget">
    <div class="subscription-header">
      <div class="subscription-icon">💳</div>
      <div class="subscription-title">Ежемесячная подписка</div>
    </div>

    <div class="subscription-details">
      <div class="property-count">
        <span class="count-number">{{ propertyCount }}</span>
        <span class="count-label">{{ propertyCountText }}</span>
      </div>

      <div class="subscription-amount">
        <span class="amount-number">${{ totalAmount }}</span>
        <span class="amount-label">в месяц</span>
      </div>
    </div>

    <div class="subscription-status" :class="statusClass">
      <div class="status-indicator"></div>
      <span class="status-text">{{ statusText }}</span>
    </div>

    <div v-if="!isActive" class="subscription-warning">
      <div class="warning-icon">⚠️</div>
      <div class="warning-text">
        Оплатите подписку для отображения недвижимости на карте
      </div>
    </div>

    <div class="subscription-actions">
      <button
        v-if="!isActive"
        class="pay-btn"
        @click="paySubscription"
        :disabled="isProcessing"
      >
        <span class="pay-icon">💳</span>
        {{ isProcessing ? 'Обработка...' : `Оплатить $${totalAmount}` }}
      </button>
      <button
        v-else
        class="manage-btn"
        @click="openSubscriptionModal"
      >
        <span class="manage-icon">⚙️</span>
        Управление
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agentStore = useAgentStore()

const isProcessing = ref(false)

const propertyCount = computed(() => agentStore.properties.length)
const totalAmount = computed(() => propertyCount.value * 5)
const isActive = computed(() => agentStore.checkSubscriptionStatus())

const propertyCountText = computed(() => {
  const count = propertyCount.value
  if (count === 1) return 'объект'
  if (count >= 2 && count <= 4) return 'объекта'
  return 'объектов'
})

const statusClass = computed(() => isActive.value ? 'active' : 'inactive')
const statusText = computed(() => isActive.value ? 'Активна' : 'Неактивна')

const paySubscription = async () => {
  if (isProcessing.value) return

  isProcessing.value = true
  try {
    await agentStore.paySubscription(totalAmount.value)
    alert('Подписка успешно оплачена!')
  } catch (error) {
    alert('Ошибка при оплате подписки: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

const openSubscriptionModal = () => {
  agentStore.openModal('subscriptionModal')
}
</script>

<style scoped>
.subscription-info-widget {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  min-width: 280px;
}

.subscription-info-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.subscription-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.subscription-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4a7c59 0%, #2d5a27 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.subscription-title {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.subscription-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.property-count {
  text-align: center;
}

.count-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #4a7c59;
  line-height: 1;
}

.count-label {
  font-size: 0.9rem;
  color: #666;
  text-transform: lowercase;
}

.subscription-amount {
  text-align: center;
}

.amount-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2d5a27;
  line-height: 1;
}

.amount-label {
  font-size: 0.9rem;
  color: #666;
}

.subscription-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.subscription-status.active {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.subscription-status.inactive {
  background: #ffeaea;
  color: #c62828;
  border: 1px solid #f44336;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.subscription-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
  font-size: 0.9rem;
}

.warning-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.warning-text {
  line-height: 1.4;
}

.subscription-actions {
  margin-top: 1rem;
}

.pay-btn,
.manage-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.pay-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.pay-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5cbf60 0%, #4caf50 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.manage-btn {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.manage-btn:hover {
  background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

.pay-icon,
.manage-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .subscription-info-widget {
    min-width: auto;
    padding: 1rem;
  }

  .subscription-details {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .count-number,
  .amount-number {
    font-size: 1.5rem;
  }

  .subscription-header {
    justify-content: center;
    text-align: center;
  }
}
</style>
