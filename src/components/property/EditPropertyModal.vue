<template>
  <div v-if="isOpen" class="modal" @click="closeModal">
    <div class="modal-content large-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Редактировать недвижимость</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">

        <div class="section">
          <h4 class="section-title">📋 Основная информация</h4>
          <form @submit.prevent="saveProperty">
            <div class="form-group">
              <label for="editTitle">Название *</label>
              <input
                type="text"
                id="editTitle"
                v-model="formData.title"
                required
              >
            </div>

            <div class="form-group">
              <label for="editAddress">Адрес *</label>
              <input
                type="text"
                id="editAddress"
                v-model="formData.address"
                required
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="editPrice">Цена *</label>
                <input
                  type="number"
                  id="editPrice"
                  v-model="formData.price"
                  required
                >
              </div>
              <div class="form-group">
                <label for="editDealType">Тип сделки *</label>
                <select id="editDealType" v-model="formData.dealType" required>
                  <option value="sale">Продажа</option>
                  <option value="rent">Аренда</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="editPropertyType">Тип недвижимости *</label>
              <select id="editPropertyType" v-model="formData.propertyType" required>
                <option value="1+1">1+1 (евро)</option>
                <option value="2+1">2+1 (две спальни и зал)</option>
                <option value="3+1">3+1 (три спальни и зал)</option>
                <option value="studio">Студия</option>
                <option value="house">Дом</option>
                <option value="commercial">Коммерческая</option>
              </select>
            </div>

            <div class="form-group">
              <label for="editDescription">Описание</label>
              <textarea
                id="editDescription"
                v-model="formData.description"
                rows="3"
              ></textarea>
            </div>

            <TagsInput v-model="formData.tags" />

            <PropertyStatus
              v-model="formData.propertyStatus"
              :deal-type="formData.dealType"
            />

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Сохранить изменения</button>
            </div>
          </form>
        </div>

        <div class="section">
          <h4>📅 Календарь и события</h4>
          <PropertyCalendar
            :deal-type="formData.dealType"
            :property-id="selectedProperty?.id"
            :events="calendarEvents"
            @add-event="addCalendarEvent"
            @remove-event="removeCalendarEvent"
          />
        </div>

        <div v-if="formData.dealType === 'rent'" class="section">
          <h4 class="section-title">🏠 Управление арендой</h4>

          <div class="rental-calendar">
            <h5>📅 Календарь аренды</h5>
            <div class="calendar-info">
              <div v-if="rentalPeriods.length > 0" class="periods-list">
                <div
                  v-for="period in rentalPeriods"
                  :key="period.id"
                  class="period-item"
                  :class="{ 'active': period.status === 'active' }"
                >
                  <div class="period-dates">
                    <strong>{{ formatDate(period.startDate) }} - {{ formatDate(period.endDate) }}</strong>
                  </div>
                  <div class="period-details">
                    <span class="tenant-name">{{ period.tenant?.name || 'Неизвестно' }}</span>
                    <span class="period-rent">{{ formatPrice(period.monthlyRent) }}/мес</span>
                    <span class="period-status" :class="`status-${period.status}`">
                      {{ getStatusText(period.status) }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="no-periods">
                <p>Периоды аренды не найдены</p>
              </div>
            </div>
          </div>

          <div v-if="currentTenant" class="current-tenant">
            <h5>Текущий арендатор</h5>
            <div class="tenant-info">
              <p><strong>Имя:</strong> {{ currentTenant.name }}</p>
              <p><strong>Телефон:</strong> {{ currentTenant.phone }}</p>
              <p><strong>Email:</strong> {{ currentTenant.email }}</p>
              <p><strong>Паспорт:</strong> {{ currentTenant.passportData }}</p>
            </div>
            <button
              type="button"
              class="btn btn-danger btn-small"
              @click="endCurrentRental"
            >
              Завершить аренду
            </button>
          </div>
          <div v-else class="add-tenant">
            <h5>Добавить арендатора</h5>
            <div class="form-row">
              <div class="form-group">
                <label>Имя арендатора *</label>
                <input type="text" v-model="newTenant.name" required>
              </div>
              <div class="form-group">
                <label>Телефон *</label>
                <input type="tel" v-model="newTenant.phone" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="newTenant.email">
              </div>
              <div class="form-group">
                <label>Паспортные данные</label>
                <input type="text" v-model="newTenant.passportData">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Дата начала аренды *</label>
                <input type="date" v-model="newTenant.startDate" required>
              </div>
              <div class="form-group">
                <label>Дата окончания аренды *</label>
                <input type="date" v-model="newTenant.endDate" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Ежемесячная плата *</label>
                <input type="number" v-model="newTenant.monthlyRent" required>
              </div>
              <div class="form-group">
                <label>Залог</label>
                <input type="number" v-model="newTenant.deposit">
              </div>
            </div>
            <button
              type="button"
              class="btn btn-primary"
              @click="addTenant"
            >
              Добавить арендатора
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAgentStore } from '@/stores/agent'
import TagsInput from './TagsInput.vue'
import PropertyStatus from './PropertyStatus.vue'
import PropertyCalendar from './PropertyCalendar.vue'

const agentStore = useAgentStore()

const isOpen = computed(() => agentStore.modals.editPropertyModal)
const selectedProperty = computed(() => agentStore.selectedProperty)

const formData = ref({
  title: '',
  address: '',
  price: '',
  dealType: '',
  propertyType: '',
  description: '',
  tags: [],
  propertyStatus: 'available'
})

const newTenant = ref({
  name: '',
  phone: '',
  email: '',
  passportData: '',
  startDate: '',
  endDate: '',
  monthlyRent: '',
  deposit: ''
})

const currentTenant = computed(() => {
  if (selectedProperty.value && selectedProperty.value.rental) {
    return selectedProperty.value.rental.currentTenant
  }
  return null
})

const rentalPeriods = computed(() => {
  if (selectedProperty.value && selectedProperty.value.rental) {
    return selectedProperty.value.rental.rentPeriods || []
  }
  return []
})

const calendarEvents = computed(() => {
  if (!selectedProperty.value) return []

  const events = []

  if (selectedProperty.value.showings) {
    selectedProperty.value.showings.forEach(showing => {
      events.push({
        id: showing.id,
        date: showing.date,
        type: 'showing',
        title: `Показ ${showing.clientName}`,
        time: showing.time,
        clientName: showing.clientName,
        clientPhone: showing.clientPhone,
        comment: showing.comment
      })
    })
  }

  if (selectedProperty.value.rental && selectedProperty.value.rental.rentPeriods) {
    selectedProperty.value.rental.rentPeriods.forEach(period => {
      const startDate = new Date(period.startDate)
      const endDate = new Date(period.endDate)

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        events.push({
          id: `rental-${period.id}-${d.getTime()}`,
          date: new Date(d),
          type: 'rented',
          title: `Арендовано: ${period.tenant?.name || 'Неизвестно'}`,
          comment: `Аренда до ${formatDate(endDate)}`
        })
      }
    })
  }

  return events
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price) + '₽'
}

const getStatusText = (status) => {
  const statusTexts = {
    active: 'Активна',
    completed: 'Завершена',
    cancelled: 'Отменена'
  }
  return statusTexts[status] || status
}

const loadPropertyData = () => {
  if (selectedProperty.value) {
    formData.value = {
      title: selectedProperty.value.title,
      address: selectedProperty.value.address,
      price: selectedProperty.value.price,
      dealType: selectedProperty.value.dealType,
      propertyType: selectedProperty.value.propertyType,
      description: selectedProperty.value.description || '',
      tags: selectedProperty.value.tags || [],
      propertyStatus: selectedProperty.value.propertyStatus || 'available'
    }
  }
}

const resetNewTenant = () => {
  newTenant.value = {
    name: '',
    phone: '',
    email: '',
    passportData: '',
    startDate: '',
    endDate: '',
    monthlyRent: formData.value.price || '',
    deposit: ''
  }
}

const closeModal = () => {
  agentStore.closeModal('editPropertyModal')
  agentStore.selectedProperty = null
}

const saveProperty = () => {
  if (!selectedProperty.value) return

  agentStore.updateProperty(selectedProperty.value.id, {
    title: formData.value.title,
    address: formData.value.address,
    price: parseInt(formData.value.price),
    dealType: formData.value.dealType,
    propertyType: formData.value.propertyType,
    description: formData.value.description
  })

  alert('Недвижимость успешно обновлена!')
}

const addTenant = () => {
  if (!selectedProperty.value || !newTenant.value.name || !newTenant.value.phone ||
      !newTenant.value.startDate || !newTenant.value.endDate || !newTenant.value.monthlyRent) {
    alert('Пожалуйста, заполните все обязательные поля')
    return
  }

  const tenantData = {
    tenant: {
      name: newTenant.value.name,
      phone: newTenant.value.phone,
      email: newTenant.value.email,
      passportData: newTenant.value.passportData
    },
    startDate: new Date(newTenant.value.startDate),
    endDate: new Date(newTenant.value.endDate),
    monthlyRent: parseInt(newTenant.value.monthlyRent),
    deposit: parseInt(newTenant.value.deposit) || 0
  }

  agentStore.addRentalPeriod(selectedProperty.value.id, tenantData)
  resetNewTenant()
  alert('Арендатор успешно добавлен!')
}

const addCalendarEvent = (eventData) => {
  if (!selectedProperty.value) return

  if (eventData.type === 'showing') {
    // Добавляем показ
    agentStore.addShowing(selectedProperty.value.id, {
      date: eventData.date,
      time: eventData.time,
      clientName: eventData.clientName,
      clientPhone: eventData.clientPhone,
      comment: eventData.comment
    })
  } else if (eventData.type === 'rented') {
    // TODO: добавить доп логику обработки
  }
}

const removeCalendarEvent = (eventId) => {
  if (!selectedProperty.value) return

  if (typeof eventId === 'number') {
    agentStore.removeShowing(selectedProperty.value.id, eventId)
  }
}

const endCurrentRental = () => {
  if (!selectedProperty.value || !currentTenant.value) return

  if (confirm('Вы действительно хотите завершить текущую аренду?')) {
    const activePeriod = selectedProperty.value.rental.rentPeriods.find(p => p.status === 'active')
    if (activePeriod) {
      agentStore.endRentalPeriod(selectedProperty.value.id, activePeriod.id)
      alert('Аренда завершена')
    }
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    loadPropertyData()
    resetNewTenant()
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
  max-width: 800px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.large-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 20px 20px 0 0;
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

.modal-body {
  padding: 2rem;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #f8f9fa;
}

.section-title {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.current-tenant {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.tenant-info p {
  margin: 0.5rem 0;
  color: #555;
}

.add-tenant {
  background: white;
  padding: 1rem;
  border-radius: 8px;
}

.add-tenant h5 {
  margin: 0 0 1rem 0;
  color: #333;
}

.rental-calendar {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.rental-calendar h5 {
  margin: 0 0 1rem 0;
  color: #333;
}

.periods-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.period-item {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.period-item.active {
  border-color: #4caf50;
  background: #e8f5e8;
}

.period-dates {
  margin-bottom: 0.5rem;
  color: #333;
}

.period-details {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.tenant-name {
  color: #555;
  font-weight: 500;
}

.period-rent {
  color: #4caf50;
  font-weight: 600;
}

.period-status {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.no-periods {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.form-actions {
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

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-2px);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .modal-content {
    width: 98%;
    margin: 1%;
  }

  .modal-body {
    padding: 1rem;
  }

  .section {
    padding: 1rem;
  }
}
</style>
