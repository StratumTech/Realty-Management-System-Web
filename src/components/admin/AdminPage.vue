<template>
  <div class="admin-page">
    <AdminHeader />

    <div class="container">
      <div class="header">
        <h1>Панель регионального администратора</h1>
        <p>Управление агентами недвижимости</p>
      </div>

      <AdminTabs
        :active-tab="activeTab"
        @tab-change="handleTabChange"
      />

      <div v-if="activeTab === 'proposals'" class="tab-content">
        <ProposalsSection />
      </div>

      <div v-if="activeTab === 'claims'" class="tab-content">
        <ClaimsSection />
      </div>

      <div v-if="activeTab === 'stats'" class="tab-content">
        <StatsSection />
      </div>
    </div>

    <ProposalModal />
    <ClaimModal />
    <RefusalModal />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminHeader from './AdminHeader.vue'
import AdminTabs from './AdminTabs.vue'
import ProposalsSection from './ProposalsSection.vue'
import ClaimsSection from './ClaimsSection.vue'
import StatsSection from './StatsSection.vue'
import ProposalModal from './ProposalModal.vue'
import ClaimModal from './ClaimModal.vue'
import RefusalModal from './RefusalModal.vue'

const activeTab = ref('proposals')

const handleTabChange = (tabName) => {
  activeTab.value = tabName
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  padding: 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #2e7d32;
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: 700;
}

.header p {
  color: #4caf50;
  font-size: 1.2em;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 10px;
  }

  .container {
    padding: 20px;
  }

  .header h1 {
    font-size: 2em;
  }

  .header p {
    font-size: 1em;
  }
}
</style>
