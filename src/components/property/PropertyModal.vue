<template>
  <div v-if="isOpen" class="modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Добавить недвижимость</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="payment-notice">
        <h4>💳 Оплата размещения</h4>
        <p>За размещение точки на карте необходимо заплатить 500₽.</p>
      </div>

      <form @submit.prevent="saveProperty">
        <div class="form-group">
          <label for="propertyTitle">Название *</label>
          <input type="text" id="propertyTitle" v-model="formData.title" required />
        </div>

        <div class="form-group">
          <label for="propertyAddress">Адрес *</label>
          <div class="address-input-container">
            <input
              type="text"
              id="propertyAddress"
              v-model="formData.address"
              @input="onAddressInput"
              @blur="hideAddressSuggestions"
              @keydown="handleAddressKeydown"
              placeholder="Москва, ул. Тверская, 1"
              required
            />
            <button
              type="button"
              class="geocode-btn"
              @click="geocodeAddress"
              :disabled="!formData.address || isGeocoding"
              title="Найти координаты по адресу"
            >
              {{ isGeocoding ? '🔄' : '🔍' }}
            </button>
          </div>

          <div v-if="addressSuggestions.length > 0" class="address-suggestions">
            <div
              v-for="(suggestion, index) in addressSuggestions"
              :key="index"
              class="address-suggestion"
              :class="{ 'highlighted': selectedSuggestionIndex === index }"
              @mousedown="selectAddressSuggestion(suggestion)"
            >
              {{ suggestion.formatted_address }}
            </div>
          </div>

          <div v-if="geocodingStatus" class="geocoding-status" :class="geocodingStatus.type">
            {{ geocodingStatus.message }}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="propertyPrice">Цена *</label>
            <input type="number" id="propertyPrice" v-model="formData.price" required />
          </div>
          <div class="form-group">
            <label for="dealType">Тип сделки *</label>
            <select id="dealType" v-model="formData.dealType" required>
              <option value="">Выберите тип</option>
              <option value="sale">Продажа</option>
              <option value="rent">Аренда</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="propertyType">Тип недвижимости *</label>
          <select id="propertyType" v-model="formData.propertyType" required>
            <option value="">Выберите тип</option>
            <option value="1+1">1+1 (евро)</option>
            <option value="2+1">2+1 (две спальни и зал)</option>
            <option value="3+1">3+1 (три спальни и зал)</option>
            <option value="studio">Студия</option>
            <option value="house">Дом</option>
            <option value="commercial">Коммерческая</option>
          </select>
        </div>

        <div class="form-group">
          <label for="propertyDescription">Описание</label>
          <textarea id="propertyDescription" v-model="formData.description" rows="3"></textarea>
        </div>

        <TagsInput v-model="formData.tags" />

        <PhotosManager v-model="formData.photos" />

        <button type="submit" class="btn btn-primary">Добавить</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAgentStore } from '@/stores/agent'
import TagsInput from './TagsInput.vue'
import PhotosManager from './PhotosManager.vue'
import { geocodingService } from '@/services/geocodingService'

const agentStore = useAgentStore()

const isOpen = computed(() => agentStore.modals.propertyModal)

const formData = ref({
  title: '',
  address: '',
  price: '',
  dealType: '',
  propertyType: '',
  description: '',
  tags: [],
  photos: []
})

const isGeocoding = ref(false)
const geocodingStatus = ref(null)
const addressSuggestions = ref([])
const selectedSuggestionIndex = ref(-1)
const searchTimeout = ref(null)

const resetForm = () => {
  formData.value = {
    title: '',
    address: '',
    price: '',
    dealType: '',
    propertyType: '',
    description: '',
    tags: [],
    photos: []
  }

  isGeocoding.value = false
  geocodingStatus.value = null
  addressSuggestions.value = []
  selectedSuggestionIndex.value = -1
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
}

const closeModal = () => {
  agentStore.closeModal('propertyModal')
  agentStore.tempAddress = null
  agentStore.tempCoordinates = null
  resetForm()
}

const onAddressInput = () => {
  geocodingStatus.value = null
  selectedSuggestionIndex.value = -1

  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    if (formData.value.address && formData.value.address.length >= 3) {
      try {
        const suggestions = await geocodingService.searchAddresses(formData.value.address, 5)
        addressSuggestions.value = suggestions
      } catch (error) {
        console.error('Ошибка поиска адресов:', error)
        addressSuggestions.value = []
      }
    } else {
      addressSuggestions.value = []
    }
  }, 500)
}

const hideAddressSuggestions = () => {
  setTimeout(() => {
    addressSuggestions.value = []
    selectedSuggestionIndex.value = -1
  }, 200)
}

const handleAddressKeydown = (event) => {
  if (addressSuggestions.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        addressSuggestions.value.length - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedSuggestionIndex.value >= 0) {
        selectAddressSuggestion(addressSuggestions.value[selectedSuggestionIndex.value])
      } else {
        geocodeAddress()
      }
      break
    case 'Escape':
      addressSuggestions.value = []
      selectedSuggestionIndex.value = -1
      break
  }
}

const selectAddressSuggestion = (suggestion) => {
  formData.value.address = suggestion.formatted_address
  addressSuggestions.value = []
  selectedSuggestionIndex.value = -1

  agentStore.tempCoordinates = { lat: suggestion.lat, lng: suggestion.lng }

  geocodingStatus.value = {
    type: 'success',
    message: '✅ Координаты найдены автоматически'
  }
}

const geocodeAddress = async () => {
  if (!formData.value.address || isGeocoding.value) return

  isGeocoding.value = true
  geocodingStatus.value = null

  try {
    const result = await geocodingService.forwardGeocode(formData.value.address)

    formData.value.address = result.formatted_address

    agentStore.tempCoordinates = { lat: result.lat, lng: result.lng }

    geocodingStatus.value = {
      type: 'success',
      message: '✅ Координаты найдены успешно'
    }
  } catch (error) {
    console.error('Ошибка геокодирования:', error)
    geocodingStatus.value = {
      type: 'error',
      message: '❌ ' + error.message
    }
  } finally {
    isGeocoding.value = false
  }
}

const saveProperty = () => {
  if (
    !formData.value.title ||
    !formData.value.address ||
    !formData.value.price ||
    !formData.value.dealType ||
    !formData.value.propertyType
  ) {
    alert('Пожалуйста, заполните все обязательные поля')
    return
  }

  const newProperty = agentStore.addProperty({
    title: formData.value.title,
    address: formData.value.address,
    price: parseInt(formData.value.price),
    dealType: formData.value.dealType,
    propertyType: formData.value.propertyType,
    description: formData.value.description,
  })

  if (confirm(`Подтвердите оплату 500₽ за размещение объекта "${newProperty.title}" на карте?`)) {
    agentStore.payForProperty(newProperty.id)
    alert('Объект успешно добавлен и оплачен!')
  } else {
    alert('Объект добавлен, но требует оплаты для отображения на карте')
  }

  closeModal()
}

watch(isOpen, (newValue) => {
  if (newValue) {
    resetForm()

    if (agentStore.tempAddress) {
      formData.value.address = agentStore.tempAddress
    }

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
  max-width: 500px;
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

.payment-notice {
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.payment-notice h4 {
  margin: 0 0 0.5rem 0;
  color: #1976d2;
  font-size: 1rem;
}

.payment-notice p {
  margin: 0;
  color: #1565c0;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
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

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .address-input-container {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Стили для геокодирования */
.address-input-container {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
  position: relative;
}

.address-input-container input {
  flex: 1;
}

.geocode-btn {
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #4a7c59 0%, #2d5a27 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.geocode-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a8c69 0%, #3d6a37 100%);
}

.geocode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.address-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.address-suggestion {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
}

.address-suggestion:hover,
.address-suggestion.highlighted {
  background-color: #f0f8ff;
}

.address-suggestion:last-child {
  border-bottom: none;
}

.geocoding-status {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.geocoding-status.success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.geocoding-status.error {
  background: #ffeaea;
  color: #c62828;
  border: 1px solid #f44336;
}
</style>
