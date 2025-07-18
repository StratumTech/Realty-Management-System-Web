import { describe, it, expect, beforeEach, vi } from 'vitest'
import { geocodingService } from '@/services/geocodingService'

describe('Geocoding Service', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('Reverse Geocoding', () => {
    it('should return formatted address for valid coordinates', async () => {
      const mockResponse = {
        display_name: 'Test Address, Moscow, Russia',
        address: {
          city: 'Moscow',
          road: 'Test Street',
          house_number: '1'
        }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await geocodingService.reverseGeocode(55.7558, 37.6176)
      
      expect(result).toBe('Moscow, Test Street, 1')
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('reverse?format=json&lat=55.7558&lon=37.6176')
      )
    })

    it('should handle API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(geocodingService.reverseGeocode(55.7558, 37.6176))
        .rejects.toThrow('Не удалось получить адрес для указанных координат')
    })

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(geocodingService.reverseGeocode(55.7558, 37.6176))
        .rejects.toThrow('Не удалось получить адрес для указанных координат')
    })

    it('should handle API response errors', async () => {
      const mockResponse = {
        error: 'Invalid coordinates'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      await expect(geocodingService.reverseGeocode(55.7558, 37.6176))
        .rejects.toThrow('Не удалось получить адрес для указанных координат')
    })
  })

  describe('Forward Geocoding', () => {
    it('should return coordinates for valid address', async () => {
      const mockResponse = [{
        lat: '55.7558',
        lon: '37.6176',
        display_name: 'Moscow, Russia',
        address: {
          city: 'Moscow',
          road: 'Test Street'
        }
      }]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await geocodingService.forwardGeocode('Moscow, Test Street')
      
      expect(result).toMatchObject({
        lat: 55.7558,
        lng: 37.6176,
        display_name: 'Moscow, Russia',
        formatted_address: expect.any(String)
      })
    })

    it('should handle address not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      await expect(geocodingService.forwardGeocode('Invalid Address'))
        .rejects.toThrow('Не удалось найти координаты для указанного адреса')
    })

    it('should handle API errors in forward geocoding', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      await expect(geocodingService.forwardGeocode('Test Address'))
        .rejects.toThrow('Не удалось найти координаты для указанного адреса')
    })
  })

  describe('Address Formatting', () => {
    it('should format address with all components', () => {
      const data = {
        address: {
          city: 'Moscow',
          road: 'Tverskaya Street',
          house_number: '1'
        }
      }

      const result = geocodingService.formatAddress(data)
      expect(result).toBe('Moscow, Tverskaya Street, 1')
    })

    it('should handle missing address components', () => {
      const data = {
        address: {
          city: 'Moscow'
        }
      }

      const result = geocodingService.formatAddress(data)
      expect(result).toBe('Moscow')
    })

    it('should fallback to display_name when no address', () => {
      const data = {
        display_name: 'Fallback Address'
      }

      const result = geocodingService.formatAddress(data)
      expect(result).toBe('Fallback Address')
    })

    it('should handle completely empty data', () => {
      const data = {}

      const result = geocodingService.formatAddress(data)
      expect(result).toBe('Неизвестный адрес')
    })
  })

  describe('Address Search', () => {
    it('should return search results for valid query', async () => {
      const mockResponse = [
        {
          display_name: 'Moscow, Russia',
          lat: '55.7558',
          lon: '37.6176',
          type: 'city',
          importance: 0.9,
          address: { city: 'Moscow' }
        }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await geocodingService.searchAddresses('Moscow', 5)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        display_name: 'Moscow, Russia',
        lat: 55.7558,
        lng: 37.6176,
        type: 'city',
        importance: 0.9
      })
    })

    it('should return empty array for short queries', async () => {
      const result = await geocodingService.searchAddresses('Mo', 5)
      expect(result).toEqual([])
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should handle search API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await geocodingService.searchAddresses('Moscow', 5)
      expect(result).toEqual([])
    })
  })

  describe('Utility Functions', () => {
    it('should validate coordinates correctly', () => {
      expect(geocodingService.isValidCoordinates(55.7558, 37.6176)).toBe(true)
      expect(geocodingService.isValidCoordinates(91, 37.6176)).toBe(false)
      expect(geocodingService.isValidCoordinates(55.7558, 181)).toBe(false)
      expect(geocodingService.isValidCoordinates(NaN, 37.6176)).toBe(false)
      expect(geocodingService.isValidCoordinates('55.7558', 37.6176)).toBe(false)
    })

    it('should calculate distance between coordinates', () => {
      const distance = geocodingService.getDistance(55.7558, 37.6176, 55.7558, 37.6176)
      expect(distance).toBe(0)

      const distance2 = geocodingService.getDistance(55.7558, 37.6176, 55.7600, 37.6200)
      expect(distance2).toBeGreaterThan(0)
      expect(distance2).toBeLessThan(1) // Should be less than 1km
    })

    it('should convert degrees to radians', () => {
      expect(geocodingService.deg2rad(180)).toBeCloseTo(Math.PI)
      expect(geocodingService.deg2rad(90)).toBeCloseTo(Math.PI / 2)
      expect(geocodingService.deg2rad(0)).toBe(0)
    })
  })
})
