<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>📝 Детали заявки</h3>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div v-if="selectedProposal" class="modal-body">
        <div class="proposal-details">
          <div class="detail-section">
            <h4>👤 Личная информация</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Имя:</label>
                <span>{{ selectedProposal.firstName }}</span>
              </div>
              <div class="detail-item">
                <label>Фамилия:</label>
                <span>{{ selectedProposal.lastName }}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ selectedProposal.email }}</span>
              </div>
              <div class="detail-item">
                <label>Телефон:</label>
                <span>{{ selectedProposal.phone }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>📞 Контактная информация</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Telegram:</label>
                <span>{{ selectedProposal.telegram || 'Не указан' }}</span>
              </div>
              <div class="detail-item">
                <label>WhatsApp:</label>
                <span>{{ selectedProposal.whatsapp || 'Не указан' }}</span>
              </div>
              <div class="detail-item">
                <label>Предпочтительный способ связи:</label>
                <span>{{ getContactText(selectedProposal.preferredContact) }}</span>
              </div>
              <div class="detail-item">
                <label>Дата подачи:</label>
                <span>{{ formatDate(selectedProposal.submittedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>💼 Опыт работы</h4>
            <div class="experience-text">
              {{ selectedProposal.experience }}
            </div>
          </div>

          <div class="detail-section">
            <h4>📊 Статус заявки</h4>
            <div class="status-info">
              <span
                class="status-badge"
                :class="selectedProposal.status"
              >
                {{ getStatusText(selectedProposal.status) }}
              </span>
              <div v-if="selectedProposal.processedAt" class="processed-info">
                Обработано: {{ formatDate(selectedProposal.processedAt) }}
              </div>
              <div v-if="selectedProposal.rejectionReason" class="rejection-reason">
                <strong>Причина отказа:</strong>
                <p>{{ selectedProposal.rejectionReason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div v-if="selectedProposal && selectedProposal.status === 'pending'" class="action-buttons">
          <button
            class="btn btn-success"
            @click="approveProposal"
          >
            ✅ Одобрить заявку
          </button>
          <button
            class="btn btn-danger"
            @click="openRefusalModal"
          >
            ❌ Отклонить заявку
          </button>
        </div>
        <button class="btn btn-secondary" @click="closeModal">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const isOpen = computed(() => adminStore.modals.proposalModal)
const selectedProposal = computed(() => adminStore.selectedProposal)

const closeModal = () => {
  adminStore.closeModal('proposalModal')
}

const approveProposal = () => {
  if (selectedProposal.value && confirm('Одобрить заявку на регистрацию агента?')) {
    adminStore.approveProposal(selectedProposal.value.id)
    closeModal()
  }
}

const openRefusalModal = () => {
  adminStore.openModal('refusalModal')
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getContactText = (contactType) => {
  const types = {
    email: 'Email',
    phone: 'Телефон',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp'
  }
  return types[contactType] || contactType
}

const getStatusText = (status) => {
  const statuses = {
    pending: 'Ожидает рассмотрения',
    approved: 'Одобрено',
    rejected: 'Отклонено'
  }
  return statuses[status] || status
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 2px solid #e0e0e0;
}

.modal-header h3 {
  color: #2e7d32;
  margin: 0;
  font-size: 1.5em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 30px;
}

.proposal-details {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.detail-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.detail-section h4 {
  color: #2e7d32;
  margin: 0 0 15px 0;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.detail-item span {
  color: #333;
  font-size: 1rem;
}

.experience-text {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  color: #555;
  line-height: 1.5;
  font-style: italic;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.processed-info {
  font-size: 0.9rem;
  color: #666;
}

.rejection-reason {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #f44336;
}

.rejection-reason p {
  margin: 5px 0 0 0;
  color: #555;
  font-style: italic;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 2px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 15px 20px;
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
