<template>
  <div class="photos-manager">
    <label class="photos-label">📷 Фотографии недвижимости (максимум 10)</label>

    <div class="photo-upload-section">
      <input
        ref="photoInput"
        type="file"
        accept="image/*"
        multiple
        @change="handlePhotoSelect"
        style="display: none"
      />
      <button
        type="button"
        class="upload-btn"
        @click="selectPhotos"
        :disabled="photos.length >= 10 || isUploading"
      >
        <span class="upload-icon">{{ isUploading ? '🔄' : '📷' }}</span>
        {{ isUploading ? 'Загрузка...' : 'Добавить фото' }}
      </button>
      <div class="upload-info">
        {{ photos.length }}/10 фотографий
      </div>
    </div>

    <div v-if="uploadError" class="upload-error">
      {{ uploadError }}
    </div>

    <div v-if="photos.length > 0" class="photos-grid">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="photo-item"
        :class="{ 'main-photo': index === 0 }"
      >
        <div class="photo-container">
          <img
            :src="photo"
            :alt="`Фото ${index + 1}`"
            class="photo-preview"
            @click="openPhotoModal(photo)"
          />
          <div class="photo-overlay">
            <button
              type="button"
              class="photo-action-btn move-btn"
              @click="movePhotoUp(index)"
              :disabled="index === 0"
              title="Переместить вверх"
            >
              ↑
            </button>
            <button
              type="button"
              class="photo-action-btn move-btn"
              @click="movePhotoDown(index)"
              :disabled="index === photos.length - 1"
              title="Переместить вниз"
            >
              ↓
            </button>
            <button
              type="button"
              class="photo-action-btn delete-btn"
              @click="removePhoto(index)"
              title="Удалить фото"
            >
              🗑️
            </button>
          </div>
          <div v-if="index === 0" class="main-photo-badge">
            Главное фото
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedPhoto" class="photo-modal" @click="closePhotoModal">
      <div class="photo-modal-content" @click.stop>
        <button class="photo-modal-close" @click="closePhotoModal">&times;</button>
        <img :src="selectedPhoto" alt="Просмотр фото" class="photo-modal-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { photoStorage } from '@/services/photoStorage'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const photoInput = ref(null)
const isUploading = ref(false)
const uploadError = ref(null)
const selectedPhoto = ref(null)

const photos = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

const selectPhotos = () => {
  uploadError.value = null
  photoInput.value?.click()
}

const handlePhotoSelect = async (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return

  if (photos.value.length + files.length > 10) {
    uploadError.value = `Можно загрузить максимум 10 фотографий. У вас уже ${photos.value.length}, выбрано ${files.length}.`
    return
  }

  isUploading.value = true
  uploadError.value = null

  try {
    const savedPhotos = await photoStorage.savePhotos(files)

    if (savedPhotos.length === 0) {
      uploadError.value = 'Не удалось сохранить ни одной фотографии'
      return
    }

    photos.value = [...photos.value, ...savedPhotos]

    if (savedPhotos.length < files.length) {
      uploadError.value = `Сохранено ${savedPhotos.length} из ${files.length} фотографий. Проверьте размер и формат файлов.`
    }

  } catch (error) {
    console.error('Ошибка загрузки фотографий:', error)
    uploadError.value = 'Ошибка загрузки фотографий. Попробуйте еще раз.'
  } finally {
    isUploading.value = false
    if (photoInput.value) {
      photoInput.value.value = ''
    }
  }
}

const removePhoto = (index) => {
  if (confirm('Удалить эту фотографию?')) {
    const newPhotos = [...photos.value]
    const photoUrl = newPhotos[index]

    photoStorage.deletePhoto(photoUrl)

    if (photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl)
    }

    newPhotos.splice(index, 1)
    photos.value = newPhotos
  }
}

const movePhotoUp = (index) => {
  if (index === 0) return

  const newPhotos = [...photos.value]
  const temp = newPhotos[index]
  newPhotos[index] = newPhotos[index - 1]
  newPhotos[index - 1] = temp
  photos.value = newPhotos
}

const movePhotoDown = (index) => {
  if (index === photos.value.length - 1) return

  const newPhotos = [...photos.value]
  const temp = newPhotos[index]
  newPhotos[index] = newPhotos[index + 1]
  newPhotos[index + 1] = temp
  photos.value = newPhotos
}

const openPhotoModal = (photo) => {
  selectedPhoto.value = photo
}

const closePhotoModal = () => {
  selectedPhoto.value = null
}
</script>

<style scoped>
.photos-manager {
  margin: 1rem 0;
}

.photos-label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.photo-upload-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 2px dashed #ddd;
  border-radius: 12px;
  background: #f9f9f9;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #4a7c59 0%, #2d5a27 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.upload-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a8c69 0%, #3d6a37 100%);
  transform: translateY(-1px);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.upload-icon {
  font-size: 1.1rem;
}

.upload-info {
  color: #666;
  font-size: 0.9rem;
}

.upload-error {
  color: #f44336;
  background: #ffeaea;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #f44336;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.photo-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.photo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.photo-item.main-photo {
  border: 3px solid #4caf50;
}

.photo-container {
  position: relative;
  width: 100%;
  height: 120px;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.photo-preview:hover {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.move-btn {
  background: #2196f3;
  color: white;
}

.move-btn:hover:not(:disabled) {
  background: #1976d2;
  transform: scale(1.1);
}

.move-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.delete-btn {
  background: #f44336;
  color: white;
}

.delete-btn:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

.main-photo-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  text-align: center;
  padding: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.photo-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.photo-modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.photo-modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.photo-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .photo-container {
    height: 100px;
  }

  .photo-upload-section {
    flex-direction: column;
    text-align: center;
  }

  .photo-action-btn {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
}
</style>
