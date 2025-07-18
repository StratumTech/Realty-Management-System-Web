import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAgentStore } from '@/stores/agent'

describe('Agent Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAgentStore()
  })

  describe('Initial State', () => {
    it('should have correct initial agent data', () => {
      expect(store.agent).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        phone: expect.any(String),
        subscriptionStatus: expect.stringMatching(/^(active|inactive)$/)
      })
    })

    it('should have empty properties array initially', () => {
      expect(store.properties).toBeInstanceOf(Array)
    })

    it('should have default map settings', () => {
      expect(store.mapSettings).toMatchObject({
        zoom: expect.any(Number),
        center: {
          lat: expect.any(Number),
          lng: expect.any(Number)
        },
        view: expect.any(String)
      })
    })
  })

  describe('Getters', () => {
    beforeEach(() => {
      store.properties = [
        { id: 1, dealType: 'sale', propertyStatus: 'available' },
        { id: 2, dealType: 'rent', propertyStatus: 'sold' },
        { id: 3, dealType: 'sale', propertyStatus: 'available' }
      ]
    })

    it('should filter properties by deal type', () => {
      const saleProperties = store.propertiesByDealType('sale')
      expect(saleProperties).toHaveLength(2)
      expect(saleProperties.every(p => p.dealType === 'sale')).toBe(true)
    })

    it('should return total properties count', () => {
      expect(store.totalProperties).toBe(3)
    })
  })

  describe('Actions - Agent Management', () => {
    it('should update agent data', () => {
      const newData = { name: 'New Name', email: 'new@email.com' }
      store.updateAgent(newData)

      expect(store.agent.name).toBe('New Name')
      expect(store.agent.email).toBe('new@email.com')
    })
  })

  describe('Actions - Property Management', () => {
    it('should add new property', () => {
      const propertyData = {
        title: 'Test Property',
        address: 'Test Address',
        price: 1000000,
        dealType: 'sale',
        propertyType: '2+1'
      }

      const initialCount = store.properties.length
      const newProperty = store.addProperty(propertyData)

      expect(store.properties).toHaveLength(initialCount + 1)
      expect(newProperty).toMatchObject({
        id: expect.any(Number),
        title: 'Test Property',
        address: 'Test Address',
        price: 1000000,
        dealType: 'sale',
        propertyType: '2+1',
        createdAt: expect.any(Date),
        propertyStatus: 'available'
      })
    })

    it('should update existing property', () => {
      const property = {
        id: 1,
        title: 'Original Title',
        price: 1000000
      }
      store.properties = [property]

      const updateData = {
        title: 'Updated Title',
        price: 2000000
      }

      store.updateProperty(1, updateData)

      const updatedProperty = store.properties.find(p => p.id === 1)
      expect(updatedProperty.title).toBe('Updated Title')
      expect(updatedProperty.price).toBe(2000000)
    })

    it('should remove property', () => {
      store.properties = [
        { id: 1, title: 'Property 1' },
        { id: 2, title: 'Property 2' }
      ]

      store.removeProperty(1)

      expect(store.properties).toHaveLength(1)
      expect(store.properties.find(p => p.id === 1)).toBeUndefined()
    })
  })

  describe('Actions - Subscription Management', () => {
    it('should pay subscription successfully', async () => {
      store.agent.subscriptionStatus = 'inactive'

      await store.paySubscription(25)

      expect(store.agent.subscriptionStatus).toBe('active')
      expect(store.agent.lastPaymentDate).toBeInstanceOf(Date)
      expect(store.agent.paymentHistory[0]).toMatchObject({
        amount: 25,
        status: 'success'
      })
    })

    it('should check subscription status correctly', () => {
      store.agent.subscriptionStatus = 'active'
      store.agent.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      expect(store.checkSubscriptionStatus()).toBe(true)

      store.agent.subscriptionStatus = 'inactive'
      expect(store.checkSubscriptionStatus()).toBe(false)
    })

    it('should return visible properties based on subscription', () => {
      store.properties = [
        { id: 1, title: 'Property 1' },
        { id: 2, title: 'Property 2' }
      ]

      store.agent.subscriptionStatus = 'active'
      store.agent.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      expect(store.getVisibleProperties()).toHaveLength(2)

      store.agent.subscriptionStatus = 'inactive'
      expect(store.getVisibleProperties()).toHaveLength(0)
    })

    it('should check if user can edit properties', () => {
      store.agent.subscriptionStatus = 'active'
      store.agent.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      expect(store.canEditProperties()).toBe(true)

      store.agent.subscriptionStatus = 'inactive'
      expect(store.canEditProperties()).toBe(false)
    })
  })

  describe('Actions - Modal Management', () => {
    it('should open modal', () => {
      store.openModal('propertyModal')
      expect(store.modals.propertyModal).toBe(true)
    })

    it('should close modal', () => {
      store.modals.propertyModal = true
      store.closeModal('propertyModal')
      expect(store.modals.propertyModal).toBe(false)
    })
  })

  describe('Actions - Map Management', () => {
    it('should update map settings', () => {
      const newSettings = { zoom: 15, view: 'satellite' }
      store.updateMapSettings(newSettings)

      expect(store.mapSettings.zoom).toBe(15)
      expect(store.mapSettings.view).toBe('satellite')
    })

    it('should generate random coordinates', () => {
      const coords = store.generateRandomCoordinates()

      expect(coords).toMatchObject({
        lat: expect.any(Number),
        lng: expect.any(Number)
      })
      expect(coords.lat).toBeGreaterThan(55.5)
      expect(coords.lat).toBeLessThan(56.0)
    })
  })

  describe('Actions - Personal Link', () => {
    it('should copy personal link successfully', () => {
      const result = store.copyPersonalLink()
      expect(result).toBe(true)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(store.agent.personalLink)
    })

    it('should handle clipboard failure gracefully', () => {
      navigator.clipboard = undefined
      const result = store.copyPersonalLink()
      expect(result).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle property update errors', () => {
      expect(() => {
        store.updateProperty(999, { title: 'Test' })
      }).not.toThrow()
    })

    it('should handle property removal errors', () => {
      expect(() => {
        store.removeProperty(999)
      }).not.toThrow()
    })
  })
})
