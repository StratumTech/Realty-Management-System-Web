<template>
  <div v-if="isOpen" class="modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">💳 Управление подпиской</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="subscription-info">
        <div class="current-status">
          <h4>Текущий статус подписки</h4>
          <div class="status-card" :class="subscriptionStatus">
            <div class="status-icon">
              {{ subscriptionStatus === 'active' ? '✅' : '❌' }}
            </div>
            <div class="status-text">
              {{ subscriptionStatus === 'active' ? 'Активна' : 'Неактивна' }}
            </div>
          </div>
        </div>

        <div class="subscription-details">
          <h4>Детали подписки</h4>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Количество объектов:</span>
              <span class="value">{{ propertyCount }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Стоимость за объект:</span>
              <span class="value">$5.00</span>
            </div>
            <div class="detail-item">
              <span class="label">Общая сумма в месяц:</span>
              <span class="value total">${{ totalAmount }}.00</span>
            </div>
            <div class="detail-item">
              <span class="label">Следующий платеж:</span>
              <span class="value">{{ nextPaymentDate }}</span>
            </div>
          </div>
        </div>

        <div v-if="subscriptionStatus === 'inactive'" class="warning-message">
          <div class="warning-icon">⚠️</div>
          <div class="warning-text">
            <strong>Подписка неактивна!</strong><br>
            Ваши объекты недвижимости скрыты с карты и недоступны для редактирования.
            Оплатите подписку для восстановления доступа.
          </div>
        </div>

        <div class="payment-history">
          <h4>История платежей</h4>
          <div class="history-list">
            <div 
              v-for="payment in paymentHistory" 
              :key="payment.id"
              class="payment-item"
              :class="payment.status"
            >
              <div class="payment-date">{{ formatDate(payment.date) }}</div>
              <div class="payment-amount">${{ payment.amount }}.00</div>
              <div class="payment-status">
                <span class="status-badge" :class="payment.status">
                  {{ getPaymentStatusText(payment.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button 
          v-if="subscriptionStatus === 'inactive'" 
          class="btn btn-primary"
          @click="paySubscription"
          :disabled="isProcessing"
        >
          {{ isProcessing ? 'Обработка...' : `💳 Оплатить $${totalAmount}.00` }}
        </button>
        <button 
          v-else 
          class="btn btn-outline"
          @click="manageSubscription"
        >
          ⚙️ Управление подпиской
        </button>
        <button class="btn btn-secondary" @click="closeModal">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agentStore = useAgentStore()

const isOpen = computed(() => agentStore.modals.subscriptionModal)
const propertyCount = computed(() => agentStore.properties.length)
const totalAmount = computed(() => propertyCount.value * 5)
const subscriptionStatus = computed(() => agentStore.agent.subscriptionStatus || 'inactive')

const isProcessing = ref(false)

const nextPaymentDate = computed(() => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date.toLocaleDateString('ru-RU')
})

const paymentHistory = computed(() => agentStore.agent.paymentHistory || [])

const closeModal = () => {
  agentStore.closeModal('subscriptionModal')
}

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

const manageSubscription = () => {
  alert('Функция управления подпиской будет доступна в следующих версиях')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const getPaymentStatusText = (status) => {
  const statusMap = {
    'success': 'Успешно',
    'pending': 'В обработке',
    'failed': 'Неудачно'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.current-status h4,
.subscription-details h4,
.payment-history h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid;
}

.status-card.active {
  background: #e8f5e8;
  border-color: #4caf50;
  color: #2e7d32;
}

.status-card.inactive {
  background: #ffeaea;
  border-color: #f44336;
  color: #c62828;
}

.status-icon {
  font-size: 1.5rem;
}

.status-text {
  font-weight: 600;
  font-size: 1.1rem;
}

.details-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  font-weight: 600;
  color: #333;
}

.value.total {
  color: #4caf50;
  font-size: 1.1rem;
}

.warning-message {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  color: #856404;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-text {
  flex: 1;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.payment-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.payment-date {
  color: #666;
}

.payment-amount {
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.success {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.failed {
  background: #ffeaea;
  color: #c62828;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5cbf60, #4caf50);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  color: #4caf50;
  border: 2px solid #4caf50;
}

.btn-outline:hover {
  background: #4caf50;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .payment-item {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>
