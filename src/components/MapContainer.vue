<template>
  <div class="map-container">
    <div class="map-title">
      🗺️ Карта недвижимости
      <div style="margin-left: auto;">
        <button class="btn btn-primary btn-small" @click="addProperty">
          ➕ Добавить объект
        </button>
      </div>
    </div>
    <div class="map-controls">
      <button class="map-control-btn" @click="zoomIn" title="Приблизить">🔍+</button>
      <button class="map-control-btn" @click="zoomOut" title="Отдалить">🔍-</button>
      <button class="map-control-btn" @click="resetView" title="Сбросить вид">🏠</button>
      <button class="map-control-btn" @click="toggleView" title="Переключить вид">🌐</button>
    </div>
    <div ref="mapContainer" class="leaflet-map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAgentStore } from '@/stores/agent'

const agentStore = useAgentStore()
const mapContainer = ref(null)

// Leaflet объекты
let map = null
let markers = []

// Настройки карты
const mapSettings = computed(() => agentStore.mapSettings)
const properties = computed(() => agentStore.properties)

onMounted(() => {
  initLeafletMap()
  addPropertyMarkers()

  // Слушаем изменения в списке недвижимости
  watch(properties, () => {
    updatePropertyMarkers()
  }, { deep: true })
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

const initLeafletMap = () => {
  // Создаем карту
  map = L.map(mapContainer.value).setView(
    [mapSettings.value.center.lat, mapSettings.value.center.lng],
    mapSettings.value.zoom
  )

  // Добавляем тайлы карты
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  // Обработчик клика по карте для добавления новой недвижимости
  map.on('click', (e) => {
    if (confirm('Добавить новую недвижимость в этом месте?')) {
      // Открываем модальное окно с предзаполненными координатами
      agentStore.openModal('propertyModal')
      // Можно сохранить координаты для использования в модальном окне
      agentStore.tempCoordinates = { lat: e.latlng.lat, lng: e.latlng.lng }
    }
  })
}

const addPropertyMarkers = () => {
  properties.value.forEach(property => {
    createPropertyMarker(property)
  })
}

const updatePropertyMarkers = () => {
  // Удаляем старые маркеры
  markers.forEach(marker => {
    map.removeLayer(marker)
  })
  markers = []

  // Создаем новые маркеры для каждой недвижимости
  properties.value.forEach(property => {
    createPropertyMarker(property)
  })
}

const createPropertyMarker = (property) => {
  // Создаем иконку маркера в зависимости от типа и статуса
  const iconColor = property.status === 'paid' ? 'green' : 'orange'
  const iconSymbol = property.dealType === 'sale' ? '🏠' : '🏢'

  // Создаем HTML для кастомной иконки
  const iconHtml = `
    <div style="
      background-color: ${iconColor};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      font-size: 16px;
    ">
      ${iconSymbol}
    </div>
  `

  const customIcon = L.divIcon({
    html: iconHtml,
    className: 'custom-property-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })

  // Создаем маркер
  const marker = L.marker([property.coordinates.lat, property.coordinates.lng], {
    icon: customIcon
  }).addTo(map)

  // Создаем popup с информацией о недвижимости
  const popupContent = createPopupContent(property)
  marker.bindPopup(popupContent)

  markers.push(marker)
  return marker
}

const createPopupContent = (property) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + '₽'
  }

  const getDealTypeText = (dealType) => {
    return dealType === 'sale' ? 'Продажа' : 'Аренда'
  }

  const statusText = property.status === 'paid' ? 'Оплачено' : 'Не оплачено'
  const statusColor = property.status === 'paid' ? '#4caf50' : '#ff9800'

  let rentalInfo = ''
  if (property.dealType === 'rent' && property.rental && property.rental.currentTenant) {
    rentalInfo = `
      <div style="margin-top: 10px; padding: 8px; background: #f0f8ff; border-radius: 4px;">
        <strong>Текущий арендатор:</strong><br>
        ${property.rental.currentTenant.name}<br>
        📞 ${property.rental.currentTenant.phone}
      </div>
    `
  }

  return `
    <div style="min-width: 200px;">
      <h4 style="margin: 0 0 8px 0; color: #333;">${property.title}</h4>
      <p style="margin: 4px 0; color: #666;">📍 ${property.address}</p>
      <p style="margin: 4px 0; color: #4caf50; font-weight: bold;">💰 ${formatPrice(property.price)} (${getDealTypeText(property.dealType)})</p>
      <p style="margin: 4px 0;">🏠 ${property.propertyType}</p>
      <div style="margin: 8px 0;">
        <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
          ${statusText}
        </span>
      </div>
      ${rentalInfo}
      <div style="margin-top: 10px;">
        <button onclick="editProperty(${property.id})" style="background: #4caf50; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 4px;">
          ✏️ Редактировать
        </button>
      </div>
    </div>
  `
}

// Функции управления картой
const zoomIn = () => {
  const currentZoom = map.getZoom()
  map.setZoom(currentZoom + 1)
}

const zoomOut = () => {
  const currentZoom = map.getZoom()
  map.setZoom(currentZoom - 1)
}

const resetView = () => {
  map.setView([mapSettings.value.center.lat, mapSettings.value.center.lng], mapSettings.value.zoom)
}

const toggleView = () => {
  // Переключение между обычной картой и спутниковым видом
  const currentView = mapSettings.value.view
  const newView = currentView === 'map' ? 'satellite' : 'map'

  agentStore.updateMapSettings({ view: newView })

  // Удаляем текущий слой
  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map.removeLayer(layer)
    }
  })

  // Добавляем новый слой
  if (newView === 'satellite') {
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 19
    }).addTo(map)
  } else {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)
  }
}

const addProperty = () => {
  agentStore.openModal('propertyModal')
}

// Глобальная функция для редактирования недвижимости (вызывается из popup)
window.editProperty = (propertyId) => {
  const property = properties.value.find(p => p.id === propertyId)
  if (property) {
    agentStore.selectedProperty = property
    agentStore.openModal('editPropertyModal')
  }
}

// Обработка изменения размера окна
const handleResize = () => {
  if (map) {
    map.invalidateSize()
  }
}

// Добавляем обработчик изменения размера
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // Очищаем глобальную функцию
  delete window.editProperty
})
</script>

<style scoped>
.map-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.map-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.map-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.map-control-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-control-btn:hover {
  background: #4caf50;
  color: white;
  transform: translateY(-2px);
}

.leaflet-map {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

/* Стили для кастомных маркеров */
:deep(.custom-property-marker) {
  background: transparent !important;
  border: none !important;
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

.btn-primary {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .map-container {
    min-height: 300px;
  }

  .leaflet-map {
    height: 250px;
  }

  .map-title {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
