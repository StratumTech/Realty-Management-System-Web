<template>
  <div class="map-container">
    <div class="map-title">
      🗺️ Карта недвижимости
      <div style="margin-left: auto;">
        <button
          class="btn btn-primary btn-small"
          @click="addProperty"
          :disabled="!canAddProperties"
          :title="!canAddProperties ? 'Оплатите подписку для добавления объектов' : ''"
        >
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
import { geocodingService } from '@/services/geocodingService'

const agentStore = useAgentStore()
const mapContainer = ref(null)

let map = null
let markers = []

const mapSettings = computed(() => agentStore.mapSettings)
const properties = computed(() => agentStore.getVisibleProperties())
const canAddProperties = computed(() => agentStore.canEditProperties())

onMounted(() => {
  initLeafletMap()
  addPropertyMarkers()

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
  map = L.map(mapContainer.value).setView(
    [mapSettings.value.center.lat, mapSettings.value.center.lng],
    mapSettings.value.zoom
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  map.on('click', async (e) => {
    if (!canAddProperties.value) {
      alert('Оплатите подписку для добавления недвижимости')
      return
    }

    const lat = e.latlng.lat
    const lng = e.latlng.lng

    try {
      const loadingPopup = L.popup()
        .setLatLng([lat, lng])
        .setContent('<div style="text-align: center;">🔄 Получение адреса...</div>')
        .openOn(map)

      const address = await geocodingService.reverseGeocode(lat, lng)

      map.closePopup(loadingPopup)

      if (confirm(`Добавить новую недвижимость по адресу:\n${address}?`)) {
        agentStore.tempCoordinates = { lat, lng }
        agentStore.tempAddress = address
        agentStore.openModal('propertyModal')
      }
    } catch (error) {
      map.closePopup()

      console.error('Ошибка получения адреса:', error)

      if (confirm(`Не удалось получить адрес для данной точки.\nДобавить недвижимость с координатами ${lat.toFixed(6)}, ${lng.toFixed(6)}?`)) {
        agentStore.tempCoordinates = { lat, lng }
        agentStore.tempAddress = `Координаты: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        agentStore.openModal('propertyModal')
      }
    }
  })
}

const addPropertyMarkers = () => {
  properties.value.forEach(property => {
    createPropertyMarker(property)
  })
}

const updatePropertyMarkers = () => {
  markers.forEach(marker => {
    map.removeLayer(marker)
  })
  markers = []

  properties.value.forEach(property => {
    createPropertyMarker(property)
  })
}

const createPropertyMarker = (property) => {
  const iconColor = property.status === 'paid' ? 'green' : 'orange'
  const iconSymbol = property.dealType === 'sale' ? '🏠' : '🏢'

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

  const marker = L.marker([property.coordinates.lat, property.coordinates.lng], {
    icon: customIcon
  }).addTo(map)

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

  let photosSection = ''
  if (property.photos && property.photos.length > 0) {
    const photosHtml = property.photos.slice(0, 3).map((photo, index) =>
      `<img src="${photo}" alt="Фото ${index + 1}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 4px; margin-right: 4px; cursor: pointer;" onclick="openPhotoModal('${photo}')" />`
    ).join('')

    const morePhotos = property.photos.length > 3 ? `<span style="font-size: 0.8rem; color: #666;">+${property.photos.length - 3} фото</span>` : ''

    photosSection = `
      <div style="margin-top: 10px;">
        <strong>Фотографии:</strong><br>
        <div style="margin-top: 5px;">
          ${photosHtml}
          ${morePhotos}
        </div>
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
      ${photosSection}
      <div style="margin-top: 10px;">
        <button onclick="editProperty(${property.id})" style="background: #4caf50; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 4px;">
          ✏️ Редактировать
        </button>
      </div>
    </div>
  `
}

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
  const currentView = mapSettings.value.view
  const newView = currentView === 'map' ? 'satellite' : 'map'

  agentStore.updateMapSettings({ view: newView })

  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map.removeLayer(layer)
    }
  })

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
  if (!canAddProperties.value) {
    alert('Оплатите подписку для добавления недвижимости')
    return
  }
  agentStore.openModal('propertyModal')
}

window.editProperty = (propertyId) => {
  const property = properties.value.find(p => p.id === propertyId)
  if (property) {
    agentStore.selectedProperty = property
    agentStore.openModal('editPropertyModal')
  }
}

window.openPhotoModal = (photoUrl) => {
  const modal = document.createElement('div')
  modal.style.cssText = `
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
    cursor: pointer;
  `

  const img = document.createElement('img')
  img.src = photoUrl
  img.style.cssText = `
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
  `

  modal.appendChild(img)
  document.body.appendChild(modal)

  modal.addEventListener('click', () => {
    document.body.removeChild(modal)
  })

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(modal)
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)
}

const handleResize = () => {
  if (map) {
    map.invalidateSize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  delete window.editProperty
  delete window.openPhotoModal
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
