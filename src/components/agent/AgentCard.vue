<template>
  <div class="agent-card">
    <div class="avatar">
      <img
        v-if="agent.avatar && agent.avatar.startsWith('http')"
        :src="agent.avatar"
        :alt="agent.name"
        class="avatar-image"
      />
      <span v-else class="avatar-text">
        {{ agent.avatar || agent.name?.charAt(0)?.toUpperCase() || '👤' }}
      </span>
    </div>
    <div class="agent-name">{{ agent.name }}</div>
    <div class="agent-region">{{ getRegionName(agent.region) }}</div>
    <div class="agent-contacts">
      <div class="contact-item">
        <span>📧</span>
        <span>{{ agent.email }}</span>
      </div>
      <div class="contact-item">
        <span>📱</span>
        <span>{{ agent.phone }}</span>
      </div>
    </div>
    <button class="btn btn-outline btn-small" @click="editProfile">
      ✏️ Редактировать
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agentStore = useAgentStore()

const agent = computed(() => agentStore.agent)

const getRegionName = (regionCode) => {
  const regions = {
    moscow: 'Москва',
    spb: 'Санкт-Петербург',
    ekb: 'Екатеринбург'
  }
  return regions[regionCode] || regionCode
}

const editProfile = () => {
  agentStore.openModal('profileModal')
}
</script>

<style scoped>
.agent-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4caf50, #45a049);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
  overflow: hidden;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-text {
  color: white;
  font-weight: bold;
}

.agent-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.agent-region {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.agent-contacts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #555;
  justify-content: center;
}

.contact-item span:first-child {
  font-size: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.btn-outline {
  background: transparent;
  border: 2px solid #4caf50;
  color: #4caf50;
}

.btn-outline:hover {
  background: #4caf50;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}
</style>
