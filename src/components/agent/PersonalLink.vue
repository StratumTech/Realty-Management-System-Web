<template>
  <div class="personal-link">
    <div class="link-title">Персональная ссылка</div>
    <div class="link-url">{{ agent.personalLink }}</div>
    <button class="btn btn-primary btn-small" @click="copyLink">
      {{ copied ? '✅ Скопировано' : '📋 Копировать' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agentStore = useAgentStore()
const copied = ref(false)

const agent = computed(() => agentStore.agent)

const copyLink = async () => {
  try {
    const success = agentStore.copyPersonalLink()
    if (success) {
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = agent.value.personalLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  } catch (error) {
    console.error('Ошибка при копировании ссылки:', error)
  }
}
</script>

<style scoped>
.personal-link {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.link-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.link-url {
  background: #f8f9fa;
  padding: 0.8rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #495057;
  margin-bottom: 1rem;
  word-break: break-all;
  border: 1px solid #e9ecef;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}
</style>
