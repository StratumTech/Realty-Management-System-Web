<template>
  <div class="claims-section">
    <div class="section-header">
      <h2>❓ Вопросы от агентов</h2>
      <button class="btn refresh-btn" @click="loadClaims">
        🔄 Обновить
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка вопросов...</p>
    </div>

    <div v-else-if="openClaims.length === 0" class="empty-state">
      <div class="empty-icon">❓</div>
      <h3>Нет открытых вопросов</h3>
      <p>Все вопросы обработаны</p>
    </div>

    <div v-else class="claims-list">
      <div
        v-for="claim in openClaims"
        :key="claim.id"
        class="claim-item"
      >
        <div class="claim-header">
          <div class="claim-author">
            <img :src="claim.author.avatar" :alt="claim.author.firstName" class="author-avatar" />
            <div class="author-info">
              <h4>{{ claim.title }}</h4>
              <div class="author-meta">
                <span class="author-name">
                  👤 {{ claim.author.firstName }} {{ claim.author.lastName }}
                </span>
                <span class="claim-date">
                  📅 {{ formatDate(claim.submittedAt) }}
                </span>
              </div>
            </div>
          </div>
          <div class="claim-status">
            <span class="status-badge open">Открыт</span>
          </div>
        </div>

        <div class="claim-content">
          <div class="claim-text">
            {{ claim.content }}
          </div>
        </div>

        <div class="claim-actions">
          <button
            class="btn btn-primary"
            @click="answerClaim(claim.id)"
          >
            💬 Ответить
          </button>
          <button
            class="btn btn-outline"
            @click="viewClaimDetails(claim.id)"
          >
            👁️ Подробнее
          </button>
          <button
            class="btn btn-secondary"
            @click="closeClaim(claim.id)"
          >
            ✅ Закрыть
          </button>
        </div>

        <!-- Форма ответа -->
        <div v-if="activeResponseForm === claim.id" class="response-form">
          <h5>Ответ на вопрос:</h5>
          <textarea
            v-model="responseText"
            placeholder="Введите ваш ответ..."
            rows="4"
          ></textarea>
          <div class="response-actions">
            <button
              class="btn btn-success"
              @click="sendResponse(claim.id)"
              :disabled="!responseText.trim()"
            >
              📤 Отправить ответ
            </button>
            <button
              class="btn btn-secondary"
              @click="cancelResponse"
            >
              ❌ Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="answeredClaims.length > 0" class="answered-section">
      <h3>✅ Отвеченные вопросы</h3>
      <div class="answered-list">
        <div
          v-for="claim in answeredClaims"
          :key="claim.id"
          class="answered-item"
        >
          <div class="answered-info">
            <strong>{{ claim.title }}</strong>
            <div class="answered-meta">
              <span class="author-name">
                {{ claim.author.firstName }} {{ claim.author.lastName }}
              </span>
              <span class="answered-date">
                Отвечено: {{ formatDate(claim.answeredAt) }}
              </span>
            </div>
          </div>
          <div class="answered-status">
            <span class="status-badge answered">Отвечено</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const loading = ref(false)
const activeResponseForm = ref(null)
const responseText = ref('')

const openClaims = computed(() => adminStore.openClaims)
const answeredClaims = computed(() =>
  adminStore.agentClaims.filter(c => c.status === 'answered')
)

const loadClaims = async () => {
  loading.value = true
  try {
    await adminStore.loadClaims()
  } finally {
    loading.value = false
  }
}

const answerClaim = (claimId) => {
  activeResponseForm.value = claimId
  responseText.value = ''
}

const sendResponse = (claimId) => {
  if (responseText.value.trim()) {
    adminStore.answerClaim(claimId, responseText.value.trim())
    activeResponseForm.value = null
    responseText.value = ''
  }
}

const cancelResponse = () => {
  activeResponseForm.value = null
  responseText.value = ''
}

const viewClaimDetails = (claimId) => {
  adminStore.selectClaim(claimId)
  adminStore.openModal('claimModal')
}

const closeClaim = (claimId) => {
  if (confirm('Закрыть вопрос без ответа?')) {
    adminStore.closeClaim(claimId)
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

onMounted(() => {
  loadClaims()
})
</script>

<style scoped>
.claims-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8f5e8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  color: #2e7d32;
  margin: 0;
  font-size: 1.8em;
}

.refresh-btn {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.claims-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.claim-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #ff9800;
  transition: all 0.3s ease;
}

.claim-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.claim-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.claim-author {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #4caf50;
}

.author-info h4 {
  color: #2e7d32;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.author-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
  color: #666;
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

.claim-content {
  margin-bottom: 20px;
}

.claim-text {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  color: #555;
  line-height: 1.5;
}

.claim-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
}

.btn-outline {
  background: white;
  color: #4caf50;
  border: 2px solid #4caf50;
}

.btn-outline:hover {
  background: #4caf50;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.response-form {
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  border: 2px solid #4caf50;
}

.response-form h5 {
  color: #2e7d32;
  margin: 0 0 15px 0;
}

.response-form textarea {
  width: 100%;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.response-form textarea:focus {
  outline: none;
  border-color: #4caf50;
}

.response-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.answered-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 2px solid #e0e0e0;
}

.answered-section h3 {
  color: #2e7d32;
  margin-bottom: 15px;
}

.answered-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.answered-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.answered-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.answered-meta {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: #666;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .claim-header {
    flex-direction: column;
    gap: 10px;
  }

  .author-meta {
    flex-direction: column;
    gap: 2px;
  }

  .claim-actions {
    justify-content: center;
  }

  .response-actions {
    flex-direction: column;
  }

  .answered-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .answered-meta {
    flex-direction: column;
    gap: 2px;
  }
}
</style>
