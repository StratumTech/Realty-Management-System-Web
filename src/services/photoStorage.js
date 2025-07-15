class PhotoStorageService {
  constructor() {
    this.storageKey = 'realty_photos'
    this.maxPhotos = 10
    this.maxFileSize = 5 * 1024 * 1024 // 5MB
  }

  /**
   * Сохранение фотографии в localStorage
   * @param {File} file - файл изображения
   * @returns {Promise<string>} - URL сохраненной фотографии
   */
  async savePhoto(file) {
    return new Promise((resolve, reject) => {
      // Проверяем размер файла
      if (file.size > this.maxFileSize) {
        reject(new Error(`Размер файла не должен превышать ${this.maxFileSize / 1024 / 1024}MB`))
        return
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        reject(new Error('Можно загружать только изображения'))
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const photoData = {
            id: this.generatePhotoId(),
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target.result, // base64 строка
            timestamp: Date.now()
          }

          // Сохраняем в localStorage
          this.storePhotoData(photoData)

          // Возвращаем URL для отображения
          resolve(photoData.data)
        } catch (error) {
          reject(new Error('Ошибка при сохранении фотографии'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Ошибка при чтении файла'))
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * Сохранение массива фотографий
   * @param {FileList|Array} files - массив файлов
   * @returns {Promise<Array<string>>} - массив URL сохраненных фотографий
   */
  async savePhotos(files) {
    const fileArray = Array.from(files)
    const savedPhotos = []

    for (const file of fileArray) {
      try {
        const photoUrl = await this.savePhoto(file)
        savedPhotos.push(photoUrl)
      } catch (error) {
        console.error(`Ошибка при сохранении файла ${file.name}:`, error)
        // Продолжаем сохранение остальных файлов
      }
    }

    return savedPhotos
  }

  /**
   * Удаление фотографии из localStorage
   * @param {string} photoUrl - URL фотографии для удаления
   */
  deletePhoto(photoUrl) {
    try {
      const storedPhotos = this.getStoredPhotos()
      const photoId = this.extractPhotoId(photoUrl)

      if (photoId) {
        delete storedPhotos[photoId]
        this.saveStoredPhotos(storedPhotos)
      }
    } catch (error) {
      console.error('Ошибка при удалении фотографии:', error)
    }
  }

  /**
   * Получение всех сохраненных фотографий
   * @returns {Object} - объект с данными фотографий
   */
  getStoredPhotos() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Ошибка при получении фотографий из localStorage:', error)
      return {}
    }
  }

  /**
   * Сохранение данных фотографий в localStorage
   * @param {Object} photos - объект с данными фотографий
   */
  saveStoredPhotos(photos) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(photos))
    } catch (error) {
      console.error('Ошибка при сохранении в localStorage:', error)
      throw new Error('Недостаточно места в localStorage')
    }
  }

  /**
   * Сохранение данных одной фотографии
   * @param {Object} photoData - данные фотографии
   */
  storePhotoData(photoData) {
    const storedPhotos = this.getStoredPhotos()
    storedPhotos[photoData.id] = photoData
    this.saveStoredPhotos(storedPhotos)
  }

  /**
   * Генерация уникального ID для фотографии
   * @returns {string} - уникальный ID
   */
  generatePhotoId() {
    return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Извлечение ID фотографии из URL
   * @param {string} photoUrl - URL фотографии
   * @returns {string|null} - ID фотографии или null
   */
  extractPhotoId(photoUrl) {
    // Для base64 URL ищем ID в метаданных
    const storedPhotos = this.getStoredPhotos()

    for (const [id, photoData] of Object.entries(storedPhotos)) {
      if (photoData.data === photoUrl) {
        return id
      }
    }

    return null
  }

  /**
   * Очистка старых фотографий (старше 30 дней)
   */
  cleanupOldPhotos() {
    try {
      const storedPhotos = this.getStoredPhotos()
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      let hasChanges = false

      for (const [id, photoData] of Object.entries(storedPhotos)) {
        if (photoData.timestamp < thirtyDaysAgo) {
          delete storedPhotos[id]
          hasChanges = true
        }
      }

      if (hasChanges) {
        this.saveStoredPhotos(storedPhotos)
      }
    } catch (error) {
      console.error('Ошибка при очистке старых фотографий:', error)
    }
  }

  /**
   * Получение размера используемого хранилища
   * @returns {number} - размер в байтах
   */
  getStorageSize() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? new Blob([stored]).size : 0
    } catch (error) {
      return 0
    }
  }

  /**
   * Проверка доступного места в localStorage
   * @returns {boolean} - есть ли место для новых фотографий
   */
  hasStorageSpace() {
    try {
      // Пробуем сохранить тестовые данные
      const testKey = 'storage_test'
      const testData = 'x'.repeat(1024) // 1KB
      localStorage.setItem(testKey, testData)
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Конвертация blob URL в base64 для сохранения
   * @param {string} blobUrl - blob URL
   * @returns {Promise<string>} - base64 строка
   */
  async convertBlobToBase64(blobUrl) {
    return new Promise((resolve, reject) => {
      fetch(blobUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        .catch(reject)
    })
  }

  /**
   * Инициализация сервиса (очистка старых фото)
   */
  init() {
    this.cleanupOldPhotos()
  }
}

// Создаем единственный экземпляр сервиса
export const photoStorage = new PhotoStorageService()

// Инициализируем при загрузке
photoStorage.init()

export default photoStorage
