<template>
  <div class="stats-section">
    <div class="section-header">
      <h2>📊 Статистика и аналитика</h2>
      <button class="btn refresh-btn" @click="loadStats">
        🔄 Обновить
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка статистики...</p>
    </div>

    <div v-else>
      <div class="total-revenue">
        <h3>{{ formatPrice(stats.totalRevenue) }}</h3>
        <p>Общий доход до вычета налогов</p>
      </div>


      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <h3>{{ stats.totalAgents }}</h3>
          <p>Всего агентов</p>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <h3>{{ stats.activeAgents }}</h3>
          <p>Активных агентов</p>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <h3>{{ stats.totalApplications }}</h3>
          <p>Всего заявок</p>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✔️</div>
          <h3>{{ stats.processedApplications }}</h3>
          <p>Обработанных заявок</p>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <h3>{{ stats.avgResponseTime }}</h3>
          <p>Среднее время ответа</p>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <h3>{{ processingRate }}%</h3>
          <p>Процент обработки</p>
        </div>
      </div>

      <div class="charts-section">
        <h3>📈 Аналитика</h3>
        <div class="charts-grid">
          <div class="chart-container">
            <h4>График обработанных заявок</h4>
            <div class="chart-placeholder">
              <div class="chart-icon">📊</div>
              <p>Статистика по заявкам за месяц</p>
              <div class="chart-data">
                <div class="data-point">
                  <span class="label">Одобрено:</span>
                  <span class="value">{{ approvedCount }}</span>
                </div>
                <div class="data-point">
                  <span class="label">Отклонено:</span>
                  <span class="value">{{ rejectedCount }}</span>
                </div>
                <div class="data-point">
                  <span class="label">В ожидании:</span>
                  <span class="value">{{ pendingCount }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-container">
            <h4>График решенных вопросов</h4>
            <div class="chart-placeholder">
              <div class="chart-icon">❓</div>
              <p>Количество решенных вопросов за месяц</p>
              <div class="chart-data">
                <div class="data-point">
                  <span class="label">Отвечено:</span>
                  <span class="value">{{ answeredCount }}</span>
                </div>
                <div class="data-point">
                  <span class="label">Открыто:</span>
                  <span class="value">{{ openCount }}</span>
                </div>
                <div class="data-point">
                  <span class="label">Закрыто:</span>
                  <span class="value">{{ closedCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="response-time-chart">
          <h4>⏱️ Время ответа администратора</h4>
          <div class="response-stats">
            <div class="response-item">
              <span class="response-label">Среднее время:</span>
              <span class="response-value">{{ stats.avgResponseTime }}</span>
            </div>
            <div class="response-item">
              <span class="response-label">Самый быстрый:</span>
              <span class="response-value">15 мин</span>
            </div>
            <div class="response-item">
              <span class="response-label">Самый долгий:</span>
              <span class="response-value">4.5 часа</span>
            </div>
          </div>
        </div>
      </div>

      <div class="activity-section">
        <h3>🕒 Последняя активность</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon approved">✅</div>
            <div class="activity-content">
              <div class="activity-text">Одобрена заявка от Владимира Николаева</div>
              <div class="activity-time">2 часа назад</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon answered">💬</div>
            <div class="activity-content">
              <div class="activity-text">Дан ответ на вопрос "Проблема с оплатой"</div>
              <div class="activity-time">4 часа назад</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon rejected">❌</div>
            <div class="activity-content">
              <div class="activity-text">Отклонена заявка от Петра Сидорова</div>
              <div class="activity-time">1 день назад</div>
            </div>
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

const stats = computed(() => adminStore.stats)

const processingRate = computed(() => {
  if (stats.value.totalApplications === 0) return 0
  return Math.round((stats.value.processedApplications / stats.value.totalApplications) * 100)
})

const approvedCount = computed(() => {
  return adminStore.agentProposals.filter(p => p.status === 'approved').length
})

const rejectedCount = computed(() => {
  return adminStore.agentProposals.filter(p => p.status === 'rejected').length
})

const pendingCount = computed(() => {
  return adminStore.agentProposals.filter(p => p.status === 'pending').length
})

const answeredCount = computed(() => {
  return adminStore.agentClaims.filter(c => c.status === 'answered').length
})

const openCount = computed(() => {
  return adminStore.agentClaims.filter(c => c.status === 'open').length
})

const closedCount = computed(() => {
  return adminStore.agentClaims.filter(c => c.status === 'closed').length
})

const loadStats = async () => {
  loading.value = true
  try {
    await adminStore.loadStats()
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price) + '₽'
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.stats-section {
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

.total-revenue {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  margin-bottom: 25px;
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.total-revenue h3 {
  font-size: 2.5em;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.total-revenue p {
  font-size: 1.2em;
  opacity: 0.9;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  border: 2px solid #4caf50;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.2);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.stat-card h3 {
  color: #2e7d32;
  font-size: 2em;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.stat-card p {
  color: #4caf50;
  font-weight: 600;
  margin: 0;
}

.charts-section {
  margin-bottom: 30px;
}

.charts-section h3 {
  color: #2e7d32;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.chart-container h4 {
  color: #2e7d32;
  margin: 0 0 15px 0;
  font-size: 1.2em;
}

.chart-placeholder {
  text-align: center;
  padding: 20px;
  color: #666;
}

.chart-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.chart-data {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.data-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.data-point .label {
  font-size: 0.9rem;
  color: #666;
}

.data-point .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2e7d32;
}

.response-time-chart {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.response-time-chart h4 {
  color: #2e7d32;
  margin: 0 0 15px 0;
  font-size: 1.2em;
}

.response-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.response-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.response-label {
  font-size: 0.9rem;
  color: #666;
}

.response-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2e7d32;
}

.activity-section h3 {
  color: #2e7d32;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #4caf50;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  font-weight: bold;
}

.activity-icon.approved {
  background: #4caf50;
}

.activity-icon.answered {
  background: #2196f3;
}

.activity-icon.rejected {
  background: #f44336;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-data {
    flex-direction: column;
    gap: 15px;
  }

  .response-stats {
    flex-direction: column;
    align-items: center;
  }

  .activity-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>
