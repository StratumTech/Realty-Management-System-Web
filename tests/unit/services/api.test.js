import { describe, it, expect, beforeEach, vi } from 'vitest'
import { propertiesApi, usersApi, apiClient } from '@/services/api'

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('API Client', () => {
    it('should make GET requests correctly', async () => {
      const mockResponse = { data: 'test' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiClient.get('/test')

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should make POST requests correctly', async () => {
      const mockResponse = { id: 1 }
      const postData = { name: 'test' }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiClient.post('/test', postData)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      await expect(apiClient.get('/test'))
        .rejects.toThrow('HTTP error! status: 400')
    })

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(apiClient.get('/test'))
        .rejects.toThrow('Network error')
    })

    it('should include authorization headers when token exists', async () => {
      // Мокаем localStorage для токена
      localStorage.getItem.mockReturnValue('test-token')

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await apiClient.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Properties API', () => {
    it('should get properties with filters', async () => {
      const mockProperties = [
        { id: 1, title: 'Property 1' },
        { id: 2, title: 'Property 2' }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProperties)
      })

      const result = await propertiesApi.getProperties({ dealType: 'sale' })

      expect(result).toEqual(mockProperties)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/properties'),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should get property by uuid', async () => {
      const mockProperty = { uuid: 'test-uuid', title: 'Property 1' }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProperty)
      })

      const result = await propertiesApi.getProperty('test-uuid')

      expect(result).toEqual(mockProperty)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/properties/test-uuid'),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should create new property', async () => {
      const newProperty = { title: 'New Property', price: 1000000 }
      const createdProperty = { uuid: 'new-uuid', ...newProperty }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdProperty)
      })

      const result = await propertiesApi.createProperty(newProperty)

      expect(result).toEqual(createdProperty)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/properties'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newProperty)
        })
      )
    })

    it('should update property', async () => {
      const updateData = { title: 'Updated Property' }
      const updatedProperty = { uuid: 'test-uuid', ...updateData }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedProperty)
      })

      const result = await propertiesApi.updateProperty('test-uuid', updateData)

      expect(result).toEqual(updatedProperty)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/properties/test-uuid'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      )
    })

    it('should delete property', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: {
          get: vi.fn().mockReturnValue('0')
        }
      })

      const result = await propertiesApi.deleteProperty('test-uuid')

      expect(result).toBeNull()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/properties/test-uuid'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('Users API', () => {
    it('should get user profile', async () => {
      const mockProfile = { id: 1, name: 'John Doe', email: 'john@example.com' }

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json')
        },
        json: () => Promise.resolve(mockProfile)
      })

      const result = await usersApi.getProfile()

      expect(result).toEqual(mockProfile)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/profile'),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should update user profile', async () => {
      const updateData = { name: 'Jane Doe', email: 'jane@example.com' }
      const updatedProfile = { id: 1, ...updateData }

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json')
        },
        json: () => Promise.resolve(updatedProfile)
      })

      const result = await usersApi.updateProfile(updateData)

      expect(result).toEqual(updatedProfile)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/profile'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      )
    })

    it('should upload avatar', async () => {
      const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })
      const mockResponse = { url: 'https://example.com/avatar.jpg' }

      // Мокаем только fetch для этого теста
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json')
        },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await usersApi.uploadAvatar(mockFile)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/avatar'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      )
    })

    it('should get avatar', async () => {
      const mockAvatar = { url: 'https://example.com/avatar.jpg' }

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json')
        },
        json: () => Promise.resolve(mockAvatar)
      })

      const result = await usersApi.getAvatar()

      expect(result).toEqual(mockAvatar)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/avatar'),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should delete avatar', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: {
          get: vi.fn().mockReturnValue('0')
        }
      })

      const result = await usersApi.deleteAvatar()

      expect(result).toBeNull()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/avatar'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle 401 unauthorized errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(propertiesApi.getProperties())
        .rejects.toThrow('HTTP error! status: 401')
    })

    it('should handle 404 not found errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(propertiesApi.getProperty('non-existent-uuid'))
        .rejects.toThrow('HTTP error! status: 404')
    })

    it('should handle 500 server errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(propertiesApi.getProperties())
        .rejects.toThrow('HTTP error! status: 500')
    })
  })
})
