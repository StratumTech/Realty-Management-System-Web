<template>
  <div v-if="isOpen" class="modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Редактировать профиль</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="saveProfile">
        <div class="form-group">
          <label>Аватар</label>
          <div class="avatar-upload-section">
            <div class="current-avatar">
              <img
                v-if="currentAvatarUrl"
                :src="currentAvatarUrl"
                alt="Текущий аватар"
                class="avatar-preview"
              />
              <div v-else class="avatar-placeholder">
                {{ formData.name ? formData.name.charAt(0).toUpperCase() : '👤' }}
              </div>
            </div>

            <div class="avatar-controls">
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                @change="handleAvatarSelect"
                style="display: none"
              />
              <button
                type="button"
                class="btn btn-outline btn-small"
                @click="selectAvatar"
                :disabled="isUploadingAvatar"
              >
                {{ isUploadingAvatar ? 'Загрузка...' : '📷 Выбрать фото' }}
              </button>
              <button
                v-if="currentAvatarUrl"
                type="button"
                class="btn btn-danger btn-small"
                @click="removeAvatar"
                :disabled="isUploadingAvatar"
              >
                🗑️ Удалить
              </button>
            </div>

            <div v-if="avatarError" class="avatar-error">
              {{ avatarError }}
            </div>
          </div>
        </div>

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
import { usersApi } from '@/services/api'

const agentStore = useAgentStore()

const isOpen = computed(() => agentStore.modals.profileModal)
const agent = computed(() => agentStore.agent)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  region: '',
})

const avatarInput = ref(null)
const currentAvatarUrl = ref(null)
const isUploadingAvatar = ref(false)
const avatarError = ref(null)

const loadAgentData = async () => {
  formData.value = {
    name: agent.value.name,
    email: agent.value.email,
    phone: agent.value.phone,
    region: agent.value.region,
  }

  await loadAvatar()
}

const loadAvatar = async () => {
  try {
    const avatarData = await usersApi.getAvatar()
    if (avatarData && avatarData.url) {
      currentAvatarUrl.value = avatarData.url
    } else {
      currentAvatarUrl.value = null
    }
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error)
    currentAvatarUrl.value = null
  }
}

const selectAvatar = () => {
  avatarError.value = null
  avatarInput.value?.click()
}

const handleAvatarSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = 'Размер файла не должен превышать 5MB'
    return
  }

  if (!file.type.startsWith('image/')) {
    avatarError.value = 'Можно загружать только изображения'
    return
  }

  isUploadingAvatar.value = true
  avatarError.value = null

  try {
    const response = await usersApi.uploadAvatar(file)
    if (response && response.url) {
      currentAvatarUrl.value = response.url
      agentStore.updateAgent({ avatar: response.url })
    }
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error)
    avatarError.value = 'Ошибка загрузки аватара. Попробуйте еще раз.'
  } finally {
    isUploadingAvatar.value = false
    // Очищаем input
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  }
}

const removeAvatar = async () => {
  if (!confirm('Удалить аватар?')) return

  isUploadingAvatar.value = true
  avatarError.value = null

  try {
    await usersApi.deleteAvatar()
    currentAvatarUrl.value = null
    // Обновляем аватар в store
    agentStore.updateAgent({ avatar: null })
  } catch (error) {
    console.error('Ошибка удаления аватара:', error)
    avatarError.value = 'Ошибка удаления аватара. Попробуйте еще раз.'
  } finally {
    isUploadingAvatar.value = false
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

  .avatar-upload-section {
    flex-direction: column;
    align-items: center;
  }

  .avatar-controls {
    flex-direction: column;
    width: 100%;
  }
}

/* Стили для аватара */
.avatar-upload-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border: 2px dashed #ddd;
  border-radius: 12px;
  background: #f9f9f9;
}

.current-avatar {
  flex-shrink: 0;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4caf50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4caf50, #45a049);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: bold;
  border: 3px solid #4caf50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.avatar-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.avatar-error {
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #ffeaea;
  border-radius: 4px;
  border: 1px solid #f44336;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-danger {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #f66, #e53935);
}
</style>
