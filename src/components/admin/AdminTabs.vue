<template>
  <div class="admin-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="tab"
      :class="{ active: activeTab === tab.key }"
      @click="selectTab(tab.key)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin'

const emit = defineEmits(['tab-change'])

const adminStore = useAdminStore()

const tabs = computed(() => [
  {
    key: 'proposals',
    label: 'Заявки на регистрацию',
    icon: '📝',
    badge: adminStore.pendingProposals.length || null
  },
  {
    key: 'claims',
    label: 'Вопросы от агентов',
    icon: '❓',
    badge: adminStore.openClaims.length || null
  },
  {
    key: 'stats',
    label: 'Статистика',
    icon: '📊',
    badge: null
  }
])

const selectTab = (tabKey) => {
  emit('tab-change', tabKey)
}
</script>

<style scoped>
.admin-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  gap: 0.5rem;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 15px 25px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;
  position: relative;
}

.tab:hover {
  color: #2e7d32;
  background: rgba(76, 175, 80, 0.1);
}

.tab.active {
  color: #2e7d32;
  border-bottom-color: #4caf50;
  font-weight: 600;
  background: rgba(76, 175, 80, 0.05);
}

.tab-icon {
  font-size: 1.2em;
}

.tab-label {
  font-weight: inherit;
}

.tab-badge {
  background: #f44336;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.25rem;
}

@media (max-width: 768px) {
  .admin-tabs {
    flex-direction: column;
    border-bottom: none;
    gap: 0.25rem;
  }

  .tab {
    justify-content: center;
    padding: 12px 20px;
    border-bottom: none;
    border-left: 3px solid transparent;
    border-radius: 8px;
  }

  .tab.active {
    border-bottom-color: transparent;
    border-left-color: #4caf50;
  }

  .tab-label {
    font-size: 0.95rem;
  }
}
</style>
