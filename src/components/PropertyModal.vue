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
          <input
            type="text"
            id="propertyAddress"
            v-model="formData.address"
            placeholder="Москва, ул. Тверская, 1"
            required
          />
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

        <button type="submit" class="btn btn-primary">Сохранить и оплатить</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agentStore = useAgentStore()

const isOpen = computed(() => agentStore.modals.propertyModal)

const formData = ref({
  title: '',
  address: '',
  price: '',
  dealType: '',
  propertyType: '',
  description: '',
})

const resetForm = () => {
  formData.value = {
    title: '',
    address: '',
    price: '',
    dealType: '',
    propertyType: '',
    description: '',
  }
}

const closeModal = () => {
  agentStore.closeModal('propertyModal')
  resetForm()
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
}
</style>
