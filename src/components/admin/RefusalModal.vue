<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>❌ Отклонение заявки</h3>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div v-if="selectedProposal" class="modal-body">
        <div class="refusal-info">
          <div class="applicant-info">
            <h4>Заявка от:</h4>
            <div class="applicant-details">
              <strong>{{ selectedProposal.firstName }} {{ selectedProposal.lastName }}</strong>
              <div class="applicant-meta">
                <span>📧 {{ selectedProposal.email }}</span>
                <span>📞 {{ selectedProposal.phone }}</span>
              </div>
            </div>
          </div>

          <div class="reason-section">
            <h4>Причина отказа:</h4>
            <div class="reason-options">
              <label
                v-for="reason in refusalReasons"
                :key="reason.value"
                class="reason-option"
              >
                <input
                  type="radio"
                  :value="reason.value"
                  v-model="selectedReason"
                />
                <span class="reason-text">{{ reason.label }}</span>
              </label>
            </div>

            <div v-if="selectedReason === 'other'" class="custom-reason">
              <label for="customReason">Укажите причину:</label>
              <textarea
                id="customReason"
                v-model="customReason"
                placeholder="Опишите причину отказа..."
                rows="3"
              ></textarea>
            </div>

            <div v-if="selectedReason && selectedReason !== 'other'" class="reason-preview">
              <h5>Текст сообщения:</h5>
              <div class="message-preview">
                {{ getReasonText(selectedReason) }}
              </div>
            </div>

            <div v-if="selectedReason === 'other' && customReason.trim()" class="reason-preview">
              <h5>Текст сообщения:</h5>
              <div class="message-preview">
                {{ customReason }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="btn btn-danger"
          @click="confirmRefusal"
          :disabled="!canSubmit"
        >
          ❌ Отклонить заявку
        </button>
        <button class="btn btn-secondary" @click="closeModal">
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const selectedReason = ref('')
const customReason = ref('')

const isOpen = computed(() => adminStore.modals.refusalModal)
const selectedProposal = computed(() => adminStore.selectedProposal)

const refusalReasons = [
  {
    value: 'insufficient_experience',
    label: 'Недостаточный опыт работы'
  },
  {
    value: 'incomplete_documents',
    label: 'Неполный пакет документов'
  },
  {
    value: 'region_limit',
    label: 'Превышен лимит агентов в регионе'
  },
  {
    value: 'qualification_mismatch',
    label: 'Квалификация не соответствует требованиям'
  },
  {
    value: 'contact_issues',
    label: 'Проблемы с контактной информацией'
  },
  {
    value: 'other',
    label: 'Другая причина'
  }
]

const canSubmit = computed(() => {
  if (selectedReason.value === 'other') {
    return customReason.value.trim().length > 0
  }
  return selectedReason.value !== ''
})

const closeModal = () => {
  adminStore.closeModal('refusalModal')
  selectedReason.value = ''
  customReason.value = ''
}

const confirmRefusal = () => {
  if (!canSubmit.value || !selectedProposal.value) return

  const reason = selectedReason.value === 'other'
    ? customReason.value.trim()
    : getReasonText(selectedReason.value)

  if (confirm('Вы уверены, что хотите отклонить эту заявку?')) {
    adminStore.rejectProposal(selectedProposal.value.id, reason)
    adminStore.closeModal('proposalModal')
    closeModal()
  }
}

const getReasonText = (reasonValue) => {
  const reasonTexts = {
    insufficient_experience: 'К сожалению, ваш опыт работы в сфере недвижимости не соответствует минимальным требованиям для работы в нашей системе. Мы рекомендуем набраться опыта и подать заявку повторно через некоторое время.',
    incomplete_documents: 'Ваша заявка содержит неполную информацию или отсутствуют необходимые документы. Пожалуйста, дополните заявку и подайте её повторно.',
    region_limit: 'В настоящее время в вашем регионе достигнут максимальный лимит активных агентов. Мы добавим вас в список ожидания и свяжемся с вами при появлении свободных мест.',
    qualification_mismatch: 'Ваша квалификация и специализация не полностью соответствуют текущим потребностям нашей платформы. Рекомендуем пройти дополнительное обучение и подать заявку повторно.',
    contact_issues: 'Обнаружены проблемы с указанной вами контактной информацией. Пожалуйста, проверьте корректность данных и подайте заявку повторно.'
  }
  return reasonTexts[reasonValue] || ''
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
  z-index: 1100;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
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
  background: #fff5f5;
}

.modal-header h3 {
  color: #d32f2f;
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

.refusal-info {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.applicant-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.applicant-info h4 {
  color: #2e7d32;
  margin: 0 0 15px 0;
  font-size: 1.2em;
}

.applicant-details strong {
  color: #333;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 8px;
}

.applicant-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
  color: #666;
}

.reason-section {
  background: #fff5f5;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #ffcdd2;
}

.reason-section h4 {
  color: #d32f2f;
  margin: 0 0 20px 0;
  font-size: 1.2em;
}

.reason-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.reason-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.reason-option:hover {
  background: rgba(244, 67, 54, 0.05);
}

.reason-option input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.reason-text {
  color: #333;
  font-size: 0.95rem;
}

.custom-reason {
  margin-top: 15px;
}

.custom-reason label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.custom-reason textarea {
  width: 100%;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.custom-reason textarea:focus {
  outline: none;
  border-color: #f44336;
}

.reason-preview {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.reason-preview h5 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 1rem;
}

.message-preview {
  color: #555;
  line-height: 1.5;
  font-style: italic;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #f44336;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 2px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
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

.btn-danger {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

.btn-danger:disabled {
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

  .applicant-meta {
    gap: 2px;
  }
}
</style>
