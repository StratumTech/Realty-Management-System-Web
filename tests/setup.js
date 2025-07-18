import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'

// Глобальные моки
global.fetch = vi.fn()
global.navigator = {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
}

// Мок для localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Мок для URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Мок для FileReader
global.FileReader = class {
  constructor() {
    this.readAsDataURL = vi.fn()
    this.result = 'data:image/jpeg;base64,mock-base64-data'
    this.onload = null
    this.onerror = null
  }
}

// Мок для Leaflet
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getZoom: vi.fn(() => 12),
    setZoom: vi.fn(),
    eachLayer: vi.fn(),
    closePopup: vi.fn()
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn()
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    bindPopup: vi.fn(),
    openPopup: vi.fn()
  })),
  popup: vi.fn(() => ({
    setLatLng: vi.fn(),
    setContent: vi.fn(),
    openOn: vi.fn()
  })),
  icon: vi.fn(),
  divIcon: vi.fn(),
  latLng: vi.fn((lat, lng) => ({ lat, lng })),
  latLngBounds: vi.fn()
}))

// Глобальная конфигурация Vue Test Utils
config.global.plugins = [createPinia()]

// Мок для window.alert и confirm
global.alert = vi.fn()
global.confirm = vi.fn(() => true)

// Мок для ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Мок для IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Очистка моков перед каждым тестом
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
  fetch.mockClear()
})
