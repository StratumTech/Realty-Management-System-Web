<template>
  <div v-if="isOpen" class="modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Редактировать профиль</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="saveProfile">
        <div class="form-group">
          <label for="name">Имя *</label>
          <input type="text" id="name" v-model="formData.name" required />
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input type="email" id="email" v-model="formData.email" required />
        </div>

        <div class="form-group">
          <label for="phone">Телефон *</label>
          <input type="tel" id="phone" v-model="formData.phone" required />
        </div>

        <div class="form-group">
          <label for="region">Регион *</label>
          <select id="region" v-model="formData.region" required>
            <option value="moscow">Москва</option>
            <option value="spb">Санкт-Петербург</option>
            <option value="ekb">Екатеринбург</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="closeModal">Отмена</button>
          <button type="submit" class="btn btn-primary">Сохранить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agentStore = useAgentStore()

const isOpen = computed(() => agentStore.modals.profileModal)
const agent = computed(() => agentStore.agent)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  region: '',
})

const loadAgentData = () => {
  formData.value = {
    name: agent.value.name,
    email: agent.value.email,
    phone: agent.value.phone,
    region: agent.value.region,
  }
}

const closeModal = () => {
  agentStore.closeModal('profileModal')
}

const saveProfile = () => {
  if (
    !formData.value.name ||
    !formData.value.email ||
    !formData.value.phone ||
    !formData.value.region
  ) {
    alert('Пожалуйста, заполните все обязательные поля')
    return
  }

  agentStore.updateAgent({
    name: formData.value.name,
    email: formData.value.email,
    phone: formData.value.phone,
    region: formData.value.region,
  })

  alert('Профиль успешно обновлен!')
  closeModal()
}

watch(isOpen, (newValue) => {
  if (newValue) {
    loadAgentData()

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }
})
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
  flex: 1;
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

.btn-outline {
  background: transparent;
  border: 2px solid #ddd;
  color: #666;
}

.btn-outline:hover {
  border-color: #4caf50;
  color: #4caf50;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .modal-content {
    padding: 1.5rem;
  }
}
</style>
