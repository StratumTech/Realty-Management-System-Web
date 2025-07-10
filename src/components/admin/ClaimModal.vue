<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>❓ Детали вопроса</h3>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div v-if="selectedClaim" class="modal-body">
        <div class="claim-details">
          <div class="detail-section">
            <h4>📝 Информация о вопросе</h4>
            <div class="claim-info">
              <div class="info-item">
                <label>Заголовок:</label>
                <span>{{ selectedClaim.title }}</span>
              </div>
              <div class="info-item">
                <label>Дата создания:</label>
                <span>{{ formatDate(selectedClaim.submittedAt) }}</span>
              </div>
              <div class="info-item">
                <label>Статус:</label>
                <span
                  class="status-badge"
                  :class="selectedClaim.status"
                >
                  {{ getStatusText(selectedClaim.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>👤 Автор вопроса</h4>
            <div class="author-info">
              <img
                :src="selectedClaim.author.avatar"
                :alt="selectedClaim.author.firstName"
                class="author-avatar"
              />
              <div class="author-details">
                <div class="author-name">
                  {{ selectedClaim.author.firstName }} {{ selectedClaim.author.lastName }}
                </div>
                <div class="author-role">Агент недвижимости</div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>💬 Содержание вопроса</h4>
            <div class="claim-content">
              {{ selectedClaim.content }}
            </div>
          </div>

          <div v-if="selectedClaim.response" class="detail-section">
            <h4>✅ Ответ администратора</h4>
            <div class="response-content">
              {{ selectedClaim.response }}
            </div>
            <div class="response-meta">
              Отвечено: {{ formatDate(selectedClaim.answeredAt) }}
            </div>
          </div>

          <div v-if="selectedClaim.status === 'open'" class="detail-section">
            <h4>💬 Ответить на вопрос</h4>
            <div class="response-form">
              <textarea
                v-model="responseText"
                placeholder="Введите ваш ответ..."
                rows="4"
              ></textarea>
              <div class="response-actions">
                <button
                  class="btn btn-success"
                  @click="sendResponse"
                  :disabled="!responseText.trim()"
                >
                  📤 Отправить ответ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div v-if="selectedClaim && selectedClaim.status === 'open'" class="action-buttons">
          <button
            class="btn btn-secondary"
            @click="closeClaim"
          >
            ✅ Закрыть без ответа
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
import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const responseText = ref('')

const isOpen = computed(() => adminStore.modals.claimModal)
const selectedClaim = computed(() => adminStore.selectedClaim)

const closeModal = () => {
  adminStore.closeModal('claimModal')
  responseText.value = ''
}

const sendResponse = () => {
  if (selectedClaim.value && responseText.value.trim()) {
    adminStore.answerClaim(selectedClaim.value.id, responseText.value.trim())
    responseText.value = ''
    closeModal()
  }
}

const closeClaim = () => {
  if (selectedClaim.value && confirm('Закрыть вопрос без ответа?')) {
    adminStore.closeClaim(selectedClaim.value.id)
    closeModal()
  }
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

const getStatusText = (status) => {
  const statuses = {
    open: 'Открыт',
    answered: 'Отвечено',
    closed: 'Закрыт'
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
  max-width: 700px;
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

.claim-details {
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

.claim-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
}

.info-item span {
  color: #333;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.open {
  background: #fff3cd;
  color: #856404;
}

.status-badge.answered {
  background: #d4edda;
  color: #155724;
}

.status-badge.closed {
  background: #f8d7da;
  color: #721c24;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #4caf50;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2e7d32;
}

.author-role {
  color: #666;
  font-size: 0.9rem;
}

.claim-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
}

.response-content {
  background: #e8f5e8;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
  line-height: 1.6;
  font-size: 1rem;
}

.response-meta {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.response-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.response-form textarea {
  width: 100%;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.response-form textarea:focus {
  outline: none;
  border-color: #4caf50;
}

.response-actions {
  display: flex;
  justify-content: flex-end;
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

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .info-item label {
    min-width: auto;
  }

  .author-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
