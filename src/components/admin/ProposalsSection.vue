<template>
  <div class="proposals-section">
    <div class="section-header">
      <h2>📝 Заявки на регистрацию агентов</h2>
      <button class="btn refresh-btn" @click="loadProposals">
        🔄 Обновить
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка заявок...</p>
    </div>

    <div v-else-if="pendingProposals.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>Нет новых заявок</h3>
      <p>Все заявки обработаны</p>
    </div>

    <div v-else class="proposals-list">
      <div
        v-for="proposal in pendingProposals"
        :key="proposal.id"
        class="proposal-item"
      >
        <div class="proposal-header">
          <div class="proposal-info">
            <h4>{{ proposal.firstName }} {{ proposal.lastName }}</h4>
            <div class="proposal-meta">
              <span class="proposal-date">
                📅 {{ formatDate(proposal.submittedAt) }}
              </span>
              <span class="proposal-contact">
                📞 {{ getContactText(proposal.preferredContact) }}
              </span>
            </div>
          </div>
          <div class="proposal-status">
            <span class="status-badge pending">Ожидает</span>
          </div>
        </div>

        <div class="proposal-content">
          <div class="contact-details">
            <div class="contact-item">
              <strong>Email:</strong> {{ proposal.email }}
            </div>
            <div class="contact-item">
              <strong>Телефон:</strong> {{ proposal.phone }}
            </div>
            <div v-if="proposal.telegram" class="contact-item">
              <strong>Telegram:</strong> {{ proposal.telegram }}
            </div>
          </div>

          <div class="experience-info">
            <strong>Опыт работы:</strong>
            <p>{{ proposal.experience }}</p>
          </div>
        </div>

        <div class="proposal-actions">
          <button
            class="btn btn-success"
            @click="approveProposal(proposal.id)"
          >
            ✅ Одобрить
          </button>
          <button
            class="btn btn-danger"
            @click="openRefusalModal(proposal.id)"
          >
            ❌ Отклонить
          </button>
          <button
            class="btn btn-outline"
            @click="viewProposalDetails(proposal.id)"
          >
            👁️ Подробнее
          </button>
        </div>
      </div>
    </div>

    <div v-if="processedProposals.length > 0" class="processed-section">
      <h3>📋 Обработанные заявки</h3>
      <div class="processed-list">
        <div
          v-for="proposal in processedProposals"
          :key="proposal.id"
          class="processed-item"
          :class="proposal.status"
        >
          <div class="processed-info">
            <strong>{{ proposal.firstName }} {{ proposal.lastName }}</strong>
            <span class="processed-date">
              {{ formatDate(proposal.processedAt) }}
            </span>
          </div>
          <div class="processed-status">
            <span
              class="status-badge"
              :class="proposal.status"
            >
              {{ proposal.status === 'approved' ? 'Одобрено' : 'Отклонено' }}
            </span>
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

const pendingProposals = computed(() => adminStore.pendingProposals)
const processedProposals = computed(() => adminStore.processedProposals)

const loadProposals = async () => {
  loading.value = true
  try {
    await adminStore.loadProposals()
  } finally {
    loading.value = false
  }
}

const approveProposal = (proposalId) => {
  if (confirm('Одобрить заявку на регистрацию агента?')) {
    adminStore.approveProposal(proposalId)
  }
}

const openRefusalModal = (proposalId) => {
  adminStore.selectProposal(proposalId)
  adminStore.openModal('refusalModal')
}

const viewProposalDetails = (proposalId) => {
  adminStore.selectProposal(proposalId)
  adminStore.openModal('proposalModal')
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

onMounted(() => {
  loadProposals()
})
</script>

<style scoped>
.proposals-section {
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

.proposals-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.proposal-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #4caf50;
  transition: all 0.3s ease;
}

.proposal-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.proposal-info h4 {
  color: #2e7d32;
  margin: 0 0 8px 0;
  font-size: 1.2rem;
}

.proposal-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #666;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
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

.proposal-content {
  margin-bottom: 20px;
}

.contact-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.contact-item {
  font-size: 0.9rem;
  color: #555;
}

.experience-info {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.experience-info p {
  margin: 5px 0 0 0;
  color: #666;
  font-style: italic;
}

.proposal-actions {
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

.btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
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

.processed-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 2px solid #e0e0e0;
}

.processed-section h3 {
  color: #2e7d32;
  margin-bottom: 15px;
}

.processed-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.processed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.processed-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.processed-date {
  font-size: 0.8rem;
  color: #666;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .proposal-header {
    flex-direction: column;
    gap: 10px;
  }

  .proposal-meta {
    flex-direction: column;
    gap: 5px;
  }

  .contact-details {
    grid-template-columns: 1fr;
  }

  .proposal-actions {
    justify-content: center;
  }

  .processed-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style>
