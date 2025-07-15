class GeocodingService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org'
  }

  /**
   * Reverse geocoding - получение адреса по координатам
   * @param {number} lat - широта
   * @param {number} lng - долгота
   * @returns {Promise<string>} - адрес
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `${this.baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=ru`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return this.formatAddress(data)
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      throw new Error('Не удалось получить адрес для указанных координат')
    }
  }

  /**
   * Forward geocoding - получение координат по адресу
   * @param {string} address - адрес
   * @returns {Promise<{lat: number, lng: number, display_name: string}>} - координаты и полный адрес
   */
  async forwardGeocode(address) {
    try {
      const encodedAddress = encodeURIComponent(address)
      const response = await fetch(
        `${this.baseUrl}/search?format=json&q=${encodedAddress}&addressdetails=1&limit=1&accept-language=ru`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        throw new Error('Адрес не найден')
      }

      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        formatted_address: this.formatAddress(result)
      }
    } catch (error) {
      console.error('Forward geocoding error:', error)
      throw new Error('Не удалось найти координаты для указанного адреса')
    }
  }

  /**
   * Форматирование адреса из ответа Nominatim
   * @param {Object} data - данные от Nominatim
   * @returns {string} - отформатированный адрес
   */
  formatAddress(data) {
    if (!data.address) {
      return data.display_name || 'Неизвестный адрес'
    }

    const address = data.address
    const parts = []

    // Город
    if (address.city) {
      parts.push(address.city)
    } else if (address.town) {
      parts.push(address.town)
    } else if (address.village) {
      parts.push(address.village)
    } else if (address.municipality) {
      parts.push(address.municipality)
    }

    // Улица и номер дома
    const streetParts = []
    if (address.road) {
      streetParts.push(address.road)
    }
    if (address.house_number) {
      streetParts.push(address.house_number)
    }

    if (streetParts.length > 0) {
      parts.push(streetParts.join(', '))
    }

    // Если ничего не найдено, используем display_name
    if (parts.length === 0) {
      return data.display_name || 'Неизвестный адрес'
    }

    return parts.join(', ')
  }

  /**
   * Проверка валидности координат
   * @param {number} lat - широта
   * @param {number} lng - долгота
   * @returns {boolean} - валидны ли координаты
   */
  isValidCoordinates(lat, lng) {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng)
    )
  }

  /**
   * Получение расстояния между двумя точками (в км)
   * @param {number} lat1 - широта первой точки
   * @param {number} lng1 - долгота первой точки
   * @param {number} lat2 - широта второй точки
   * @param {number} lng2 - долгота второй точки
   * @returns {number} - расстояние в километрах
   */
  getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // Радиус Земли в км
    const dLat = this.deg2rad(lat2 - lat1)
    const dLng = this.deg2rad(lng2 - lng1)
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  /**
   * Преобразование градусов в радианы
   * @param {number} deg - градусы
   * @returns {number} - радианы
   */
  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  /**
   * Поиск адресов с автодополнением
   * @param {string} query - поисковый запрос
   * @param {number} limit - максимальное количество результатов
   * @returns {Promise<Array>} - массив найденных адресов
   */
  async searchAddresses(query, limit = 5) {
    try {
      if (!query || query.length < 3) {
        return []
      }

      const encodedQuery = encodeURIComponent(query)
      const response = await fetch(
        `${this.baseUrl}/search?format=json&q=${encodedQuery}&addressdetails=1&limit=${limit}&accept-language=ru`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return data.map(item => ({
        display_name: item.display_name,
        formatted_address: this.formatAddress(item),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
        importance: item.importance
      }))
    } catch (error) {
      console.error('Address search error:', error)
      return []
    }
  }
}

export const geocodingService = new GeocodingService()
export default geocodingService
