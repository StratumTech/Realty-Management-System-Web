import { describe, it, expect, beforeEach, vi } from 'vitest'
import { photoStorage } from '@/services/photoStorage'

describe('Photo Storage Service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Photo Saving', () => {
    it('should save photo to localStorage', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      // Мокаем FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,test-data',
        onload: null,
        onerror: null
      }

      global.FileReader = vi.fn(() => mockFileReader)

      const savePromise = photoStorage.savePhoto(mockFile)

      // Симулируем успешное чтение файла
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test-data' } })

      const result = await savePromise

      expect(result).toBe('data:image/jpeg;base64,test-data')
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should reject files that are too large', async () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

      await expect(photoStorage.savePhoto(largeFile))
        .rejects.toThrow('Размер файла не должен превышать 5MB')
    })

    it('should reject non-image files', async () => {
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      await expect(photoStorage.savePhoto(textFile))
        .rejects.toThrow('Можно загружать только изображения')
    })

    it('should handle FileReader errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null,
        onerror: null
      }

      global.FileReader = vi.fn(() => mockFileReader)

      const savePromise = photoStorage.savePhoto(mockFile)

      // Симулируем ошибку чтения файла
      mockFileReader.onerror()

      await expect(savePromise).rejects.toThrow('Ошибка при чтении файла')
    })
  })

  describe('Multiple Photos Saving', () => {
    it('should save multiple photos', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ]

      // Мокаем savePhoto для возврата успешных результатов
      vi.spyOn(photoStorage, 'savePhoto')
        .mockResolvedValueOnce('data:image/jpeg;base64,test-data1')
        .mockResolvedValueOnce('data:image/jpeg;base64,test-data2')

      const results = await photoStorage.savePhotos(files)

      expect(results).toHaveLength(2)
      expect(results[0]).toBe('data:image/jpeg;base64,test-data1')
      expect(results[1]).toBe('data:image/jpeg;base64,test-data2')
    })

    it('should continue saving other photos if one fails', async () => {
      const files = [
        new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' }), // Too large
        new File(['test'], 'test.jpg', { type: 'image/jpeg' }) // Valid
      ]

      // Мокаем savePhoto: первый файл отклоняется, второй успешно сохраняется
      vi.spyOn(photoStorage, 'savePhoto')
        .mockRejectedValueOnce(new Error('File too large'))
        .mockResolvedValueOnce('data:image/jpeg;base64,test-data')

      const results = await photoStorage.savePhotos(files)

      expect(results).toHaveLength(1) // Only one photo saved
      expect(results[0]).toBe('data:image/jpeg;base64,test-data')
    })
  })

  describe('Photo Deletion', () => {
    it('should delete photo from localStorage', () => {
      const mockPhotos = {
        'photo_123': {
          id: 'photo_123',
          data: 'data:image/jpeg;base64,test-data'
        }
      }

      localStorage.getItem.mockReturnValue(JSON.stringify(mockPhotos))

      photoStorage.deletePhoto('data:image/jpeg;base64,test-data')

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'realty_photos',
        JSON.stringify({})
      )
    })

    it('should handle deletion of non-existent photo', () => {
      localStorage.getItem.mockReturnValue('{}')

      expect(() => {
        photoStorage.deletePhoto('non-existent-url')
      }).not.toThrow()
    })

    it('should handle localStorage errors during deletion', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      expect(() => {
        photoStorage.deletePhoto('test-url')
      }).not.toThrow()
    })
  })

  describe('Storage Management', () => {
    it('should get stored photos', () => {
      const mockPhotos = {
        'photo_123': { id: 'photo_123', data: 'test-data' }
      }

      localStorage.getItem.mockReturnValue(JSON.stringify(mockPhotos))

      const result = photoStorage.getStoredPhotos()

      expect(result).toEqual(mockPhotos)
    })

    it('should return empty object if no photos stored', () => {
      localStorage.getItem.mockReturnValue(null)

      const result = photoStorage.getStoredPhotos()

      expect(result).toEqual({})
    })

    it('should handle JSON parse errors', () => {
      localStorage.getItem.mockReturnValue('invalid-json')

      const result = photoStorage.getStoredPhotos()

      expect(result).toEqual({})
    })

    it('should generate unique photo IDs', () => {
      const id1 = photoStorage.generatePhotoId()
      const id2 = photoStorage.generatePhotoId()

      expect(id1).toMatch(/^photo_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^photo_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('should extract photo ID from URL', () => {
      const mockPhotos = {
        'photo_123': {
          id: 'photo_123',
          data: 'data:image/jpeg;base64,test-data'
        }
      }

      localStorage.getItem.mockReturnValue(JSON.stringify(mockPhotos))

      const id = photoStorage.extractPhotoId('data:image/jpeg;base64,test-data')

      expect(id).toBe('photo_123')
    })

    it('should return null for non-existent photo URL', () => {
      localStorage.getItem.mockReturnValue('{}')

      const id = photoStorage.extractPhotoId('non-existent-url')

      expect(id).toBeNull()
    })
  })

  describe('Storage Cleanup', () => {
    it('should clean up old photos', () => {
      const now = Date.now()
      const oldTimestamp = now - (31 * 24 * 60 * 60 * 1000) // 31 days ago
      const recentTimestamp = now - (10 * 24 * 60 * 60 * 1000) // 10 days ago

      const mockPhotos = {
        'old_photo': {
          id: 'old_photo',
          timestamp: oldTimestamp
        },
        'recent_photo': {
          id: 'recent_photo',
          timestamp: recentTimestamp
        }
      }

      localStorage.getItem.mockReturnValue(JSON.stringify(mockPhotos))

      photoStorage.cleanupOldPhotos()

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'realty_photos',
        JSON.stringify({
          'recent_photo': {
            id: 'recent_photo',
            timestamp: recentTimestamp
          }
        })
      )
    })

    it('should not update storage if no old photos found', () => {
      const recentTimestamp = Date.now() - (10 * 24 * 60 * 60 * 1000)

      const mockPhotos = {
        'recent_photo': {
          id: 'recent_photo',
          timestamp: recentTimestamp
        }
      }

      localStorage.getItem.mockReturnValue(JSON.stringify(mockPhotos))

      photoStorage.cleanupOldPhotos()

      expect(localStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Storage Space Management', () => {
    it('should check storage space availability', () => {
      const hasSpace = photoStorage.hasStorageSpace()
      expect(typeof hasSpace).toBe('boolean')
    })

    it('should handle localStorage quota exceeded', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const hasSpace = photoStorage.hasStorageSpace()
      expect(hasSpace).toBe(false)
    })

    it('should get storage size', () => {
      localStorage.getItem.mockReturnValue('{"test": "data"}')

      const size = photoStorage.getStorageSize()
      expect(typeof size).toBe('number')
      expect(size).toBeGreaterThan(0)
    })
  })
})
