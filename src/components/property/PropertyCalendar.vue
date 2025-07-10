<template>
  <div class="property-calendar">
    <div class="calendar-header">
      <h4>📅 {{ calendarTitle }}</h4>
      <div class="calendar-controls">
        <button @click="previousMonth" class="nav-btn">‹</button>
        <span class="current-month">{{ currentMonthYear }}</span>
        <button @click="nextMonth" class="nav-btn">›</button>
      </div>
    </div>

    <div class="calendar-legend">
      <div class="legend-item">
        <span class="legend-color available"></span>
        <span>Свободно</span>
      </div>
      <div v-if="dealType === 'rent'" class="legend-item">
        <span class="legend-color rented"></span>
        <span>Арендовано</span>
      </div>
      <div v-if="dealType === 'sale'" class="legend-item">
        <span class="legend-color showing"></span>
        <span>Показ</span>
      </div>
      <div class="legend-item">
        <span class="legend-color selected"></span>
        <span>Выбрано</span>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="days">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="day"
          :class="getDayClasses(day)"
          @click="selectDay(day)"
        >
          <span class="day-number">{{ day.number }}</span>
          <div v-if="day.events.length > 0" class="day-events">
            <div
              v-for="event in day.events.slice(0, 2)"
              :key="event.id"
              class="event-dot"
              :class="event.type"
              :title="event.title"
            ></div>
            <div v-if="day.events.length > 2" class="more-events">+{{ day.events.length - 2 }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEventModal" class="event-modal-overlay" @click="closeEventModal">
      <div class="event-modal" @click.stop>
        <h5>{{ eventModalTitle }}</h5>
        <form @submit.prevent="saveEvent">
          <div class="form-group">
            <label>Дата</label>
            <input v-model="eventForm.date" type="date" required readonly />
          </div>

          <div v-if="dealType === 'sale'" class="form-group">
            <label>Время показа</label>
            <input v-model="eventForm.time" type="time" required />
          </div>

          <div v-if="dealType === 'sale'" class="form-group">
            <label>Имя клиента</label>
            <input v-model="eventForm.clientName" type="text" required />
          </div>

          <div v-if="dealType === 'sale'" class="form-group">
            <label>Телефон клиента</label>
            <input v-model="eventForm.clientPhone" type="tel" />
          </div>

          <div v-if="dealType === 'rent'" class="form-group">
            <label>Тип события</label>
            <select v-model="eventForm.eventType" required>
              <option value="available">Доступно для аренды</option>
              <option value="rented">Арендовано</option>
              <option value="maintenance">Обслуживание</option>
            </select>
          </div>

          <div class="form-group">
            <label>Комментарий</label>
            <textarea v-model="eventForm.comment" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEventModal" class="btn btn-secondary">Отмена</button>
            <button type="submit" class="btn btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="selectedDay && selectedDay.events.length > 0" class="selected-day-events">
      <h5>События {{ formatDate(selectedDay.date) }}</h5>
      <div class="events-list">
        <div
          v-for="event in selectedDay.events"
          :key="event.id"
          class="event-item"
          :class="event.type"
        >
          <div class="event-header">
            <strong>{{ event.title }}</strong>
            <button @click="removeEvent(event.id)" class="remove-event">✕</button>
          </div>
          <div v-if="event.time" class="event-time">🕐 {{ event.time }}</div>
          <div v-if="event.clientName" class="event-client">👤 {{ event.clientName }}</div>
          <div v-if="event.clientPhone" class="event-phone">📞 {{ event.clientPhone }}</div>
          <div v-if="event.comment" class="event-comment">💬 {{ event.comment }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  dealType: {
    type: String,
    required: true
  },
  propertyId: {
    type: Number,
    required: true
  },
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-event', 'remove-event'])

const currentDate = ref(new Date())
const selectedDay = ref(null)
const showEventModal = ref(false)
const eventForm = ref({
  date: '',
  time: '',
  clientName: '',
  clientPhone: '',
  eventType: 'available',
  comment: ''
})

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const calendarTitle = computed(() => {
  return props.dealType === 'rent' ? 'Календарь аренды' : 'Календарь показов'
})

const eventModalTitle = computed(() => {
  return props.dealType === 'rent' ? 'Добавить событие аренды' : 'Запланировать показ'
})

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)

  const dayOfWeek = (firstDay.getDay() + 6) % 7
  startDate.setDate(startDate.getDate() - dayOfWeek)

  const days = []
  const currentDateObj = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    const dayEvents = getEventsForDate(currentDateObj)

    days.push({
      date: new Date(currentDateObj),
      number: currentDateObj.getDate(),
      isCurrentMonth: currentDateObj.getMonth() === month,
      isToday: isToday(currentDateObj),
      events: dayEvents
    })

    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }

  return days
})

const getEventsForDate = (date) => {
  return props.events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.toDateString() === date.toDateString()
  })
}

const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getDayClasses = (day) => {
  const classes = []

  if (!day.isCurrentMonth) classes.push('other-month')
  if (day.isToday) classes.push('today')
  if (selectedDay.value && day.date.toDateString() === selectedDay.value.date.toDateString()) {
    classes.push('selected')
  }

  if (day.events.some(e => e.type === 'rented')) classes.push('has-rental')
  if (day.events.some(e => e.type === 'showing')) classes.push('has-showing')

  return classes
}

const selectDay = (day) => {
  if (!day.isCurrentMonth) return

  selectedDay.value = day

  if (day.events.length === 0) {
    openEventModal(day.date)
  }
}

const openEventModal = (date) => {
  eventForm.value = {
    date: date.toISOString().split('T')[0],
    time: '',
    clientName: '',
    clientPhone: '',
    eventType: 'available',
    comment: ''
  }
  showEventModal.value = true
}

const closeEventModal = () => {
  showEventModal.value = false
}

const saveEvent = () => {
  const eventData = {
    id: Date.now(),
    date: new Date(eventForm.value.date),
    type: props.dealType === 'rent' ? eventForm.value.eventType : 'showing',
    title: props.dealType === 'rent'
      ? getEventTypeTitle(eventForm.value.eventType)
      : `Показ ${eventForm.value.clientName}`,
    time: eventForm.value.time,
    clientName: eventForm.value.clientName,
    clientPhone: eventForm.value.clientPhone,
    comment: eventForm.value.comment
  }

  emit('add-event', eventData)
  closeEventModal()
}

const removeEvent = (eventId) => {
  emit('remove-event', eventId)
}

const getEventTypeTitle = (type) => {
  const titles = {
    available: 'Доступно',
    rented: 'Арендовано',
    maintenance: 'Обслуживание'
  }
  return titles[type] || type
}

const formatDate = (date) => {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}
</script>

<style scoped>
.property-calendar {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #0056b3;
}

.current-month {
  font-weight: 600;
  min-width: 150px;
  text-align: center;
}

.calendar-legend {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.available { background: #28a745; }
.legend-color.rented { background: #dc3545; }
.legend-color.showing { background: #007bff; }
.legend-color.selected { background: #ffc107; }

.calendar-grid {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8f9fa;
}

.weekday {
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: #666;
  border-right: 1px solid #dee2e6;
}

.weekday:last-child {
  border-right: none;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day {
  min-height: 60px;
  padding: 0.25rem;
  border-right: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  position: relative;
  background: white;
  transition: background-color 0.2s ease;
}

.day:hover {
  background: #f8f9fa;
}

.day.other-month {
  color: #ccc;
  background: #f8f9fa;
}

.day.today {
  background: #e3f2fd;
}

.day.selected {
  background: #fff3cd;
  border-color: #ffc107;
}

.day.has-rental {
  border-left: 4px solid #dc3545;
}

.day.has-showing {
  border-left: 4px solid #007bff;
}

.day-number {
  font-weight: 500;
}

.day-events {
  margin-top: 0.25rem;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 2px;
}

.event-dot.rented { background: #dc3545; }
.event-dot.showing { background: #007bff; }
.event-dot.available { background: #28a745; }

.more-events {
  font-size: 0.7rem;
  color: #666;
}

.event-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.event-modal {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.selected-day-events {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-item {
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  background: #f8f9fa;
}

.event-item.rented {
  border-left-color: #dc3545;
}

.event-item.showing {
  border-left-color: #007bff;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.remove-event {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  border-radius: 4px;
}

.remove-event:hover {
  background: #dc3545;
  color: white;
}

.event-time,
.event-client,
.event-phone,
.event-comment {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}
</style>
