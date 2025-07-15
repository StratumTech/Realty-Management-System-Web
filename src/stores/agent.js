import { defineStore } from 'pinia'
import { propertyService } from '@/services/propertyService.js'

export const useAgentStore = defineStore('agent', {
  state: () => ({
    agent: {
      id: 1,
      name: 'Иван Петров',
      email: 'ivan.petrov@email.com',
      phone: '+7 (999) 123-45-67',
      region: 'moscow',
      avatar: '👤',
      personalLink: 'https://realestate.com/agent/ivan-petrov',
      subscriptionStatus: 'active', // 'active' | 'inactive'
      lastPaymentDate: new Date('2024-07-01'),
      nextPaymentDate: new Date('2024-08-01'),
      paymentHistory: [
        {
          id: 1,
          date: '2024-07-01',
          amount: 25,
          status: 'success'
        },
        {
          id: 2,
          date: '2024-06-01',
          amount: 20,
          status: 'success'
        },
        {
          id: 3,
          date: '2024-05-01',
          amount: 15,
          status: 'success'
        }
      ]
    },

    properties: [
      {
        id: 1,
        title: 'Квартира в центре',
        address: 'Москва, ул. Тверская, 1',
        price: 15000000,
        dealType: 'sale',
        propertyType: '2+1',
        description: 'Прекрасная квартира в самом центре Москвы',
        coordinates: { lat: 55.7558, lng: 37.6176 },
        createdAt: new Date('2024-01-15'),
        tags: ['Центр города', 'Евроремонт', 'Рядом метро', 'Балкон'],
        propertyStatus: 'available', // available, sold, reserved
        photos: [
          'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Фото+1',
          'https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=Фото+2'
        ],
        showings: [
          {
            id: 1,
            date: new Date('2024-07-15'),
            time: '14:00',
            clientName: 'Иван Петров',
            clientPhone: '+7 (999) 123-45-67',
            comment: 'Первичный показ, клиент заинтересован'
          }
        ],
        rental: null
      },
      {
        id: 2,
        title: 'Студия на Арбате',
        address: 'Москва, ул. Арбат, 25',
        price: 80000,
        dealType: 'rent',
        propertyType: 'studio',
        description: 'Уютная студия для молодой семьи',
        coordinates: { lat: 55.7522, lng: 37.5927 },
        createdAt: new Date('2024-02-10'),
        tags: ['Центр города', 'Мебель', 'Техника', 'Рядом метро'],
        propertyStatus: 'rented', // available, rented, reserved
        photos: [
          'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Студия+1',
          'https://via.placeholder.com/400x300/7B1FA2/FFFFFF?text=Студия+2'
        ],
        showings: [],
        rental: {
          currentTenant: {
            name: 'Анна Иванова',
            phone: '+7 (999) 888-77-66',
            email: 'anna.ivanova@email.com',
            passportData: '1234 567890'
          },
          rentPeriods: [
            {
              id: 1,
              startDate: new Date('2024-02-01'),
              endDate: new Date('2024-07-31'),
              monthlyRent: 80000,
              deposit: 160000,
              status: 'active'
            }
          ],
          calendar: {
            bookedDates: [
              { start: new Date('2024-02-01'), end: new Date('2024-07-31'), tenant: 'Анна Иванова' }
            ],
            availableDates: [
              { start: new Date('2024-08-01'), end: new Date('2024-12-31') }
            ]
          }
        }
      }
    ],

    mapSettings: {
      zoom: 12,
      center: { lat: 55.7558, lng: 37.6176 },
      view: 'map'
    },

    modals: {
      propertyModal: false,
      profileModal: false,
      editPropertyModal: false,
      subscriptionModal: false
    },

    selectedProperty: null,

    tempCoordinates: null,
    tempAddress: null
  }),

  getters: {
    propertiesByStatus: (state) => (status) => {
      return state.properties.filter(property => property.status === status)
    },

    propertiesByDealType: (state) => (dealType) => {
      return state.properties.filter(property => property.dealType === dealType)
    },

    totalProperties: (state) => state.properties.length,


  },

  actions: {
    updateAgent(agentData) {
      this.agent = { ...this.agent, ...agentData }
    },

    addProperty(propertyData) {
      const coordinates = this.tempCoordinates || this.generateRandomCoordinates()

      const newProperty = {
        id: Date.now(),
        ...propertyData,

        createdAt: new Date(),
        coordinates: coordinates,
        tags: propertyData.tags || [],
        propertyStatus: 'available',
        showings: [],
        rental: propertyData.dealType === 'rent' ? {
          currentTenant: null,
          rentPeriods: [],
          calendar: {
            bookedDates: [],
            availableDates: []
          }
        } : null
      }

      this.properties.push(newProperty)
      this.tempCoordinates = null
      return newProperty
    },

    updateProperty(propertyId, propertyData) {
      const index = this.properties.findIndex(p => p.id === propertyId)
      if (index !== -1) {
        this.properties[index] = { ...this.properties[index], ...propertyData }
      }
    },

    removeProperty(propertyId) {
      const index = this.properties.findIndex(p => p.id === propertyId)
      if (index !== -1) {
        this.properties.splice(index, 1)
      }
    },



    updateMapSettings(settings) {
      this.mapSettings = { ...this.mapSettings, ...settings }
    },

    openModal(modalName) {
      this.modals[modalName] = true
    },

    closeModal(modalName) {
      this.modals[modalName] = false
    },

    closeAllModals() {
      Object.keys(this.modals).forEach(key => {
        this.modals[key] = false
      })
    },

    generateRandomCoordinates() {
      const moscowBounds = {
        north: 55.9,
        south: 55.6,
        east: 37.8,
        west: 37.4
      }

      return {
        lat: moscowBounds.south + Math.random() * (moscowBounds.north - moscowBounds.south),
        lng: moscowBounds.west + Math.random() * (moscowBounds.east - moscowBounds.west)
      }
    },

    addRentalPeriod(propertyId, rentalData) {
      const property = this.properties.find(p => p.id === propertyId)
      if (property && property.dealType === 'rent') {
        if (!property.rental) {
          property.rental = {
            currentTenant: null,
            rentPeriods: [],
            calendar: {
              bookedDates: [],
              availableDates: []
            }
          }
        }

        const newPeriod = {
          id: Date.now(),
          ...rentalData,
          status: 'active'
        }

        property.rental.rentPeriods.push(newPeriod)
        property.rental.currentTenant = rentalData.tenant

        property.rental.calendar.bookedDates.push({
          start: rentalData.startDate,
          end: rentalData.endDate,
          tenant: rentalData.tenant.name
        })
      }
    },

    updateRentalPeriod(propertyId, periodId, updateData) {
      const property = this.properties.find(p => p.id === propertyId)
      if (property && property.rental) {
        const periodIndex = property.rental.rentPeriods.findIndex(p => p.id === periodId)
        if (periodIndex !== -1) {
          property.rental.rentPeriods[periodIndex] = {
            ...property.rental.rentPeriods[periodIndex],
            ...updateData
          }
        }
      }
    },

    endRentalPeriod(propertyId, periodId) {
      const property = this.properties.find(p => p.id === propertyId)
      if (property && property.rental) {
        const period = property.rental.rentPeriods.find(p => p.id === periodId)
        if (period) {
          period.status = 'completed'
          period.endDate = new Date()
          property.rental.currentTenant = null
        }
      }
    },

    updatePropertyStatus(propertyId, status) {
      const property = this.properties.find(p => p.id === propertyId)
      if (property) {
        property.propertyStatus = status
      }
    },

    addShowing(propertyId, showingData) {
      const property = this.properties.find(p => p.id === propertyId)
      if (property) {
        const newShowing = {
          id: Date.now(),
          ...showingData,
          date: new Date(showingData.date)
        }
        property.showings.push(newShowing)
        return newShowing
      }
    },

    updateShowing(propertyId, showingId, updateData) {
      const property = this.properties.find(p => p.id === propertyId)
      if (property) {
        const showingIndex = property.showings.findIndex(s => s.id === showingId)
        if (showingIndex !== -1) {
          property.showings[showingIndex] = {
            ...property.showings[showingIndex],
            ...updateData,
            date: updateData.date ? new Date(updateData.date) : property.showings[showingIndex].date
          }
        }
      }
    },

    removeShowing(propertyId, showingId) {
      const property = this.properties.find(p => p.id === propertyId)
      if (property) {
        const showingIndex = property.showings.findIndex(s => s.id === showingId)
        if (showingIndex !== -1) {
          property.showings.splice(showingIndex, 1)
        }
      }
    },

    copyPersonalLink() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.agent.personalLink)
        return true
      }
      return false
    },

    async loadPropertiesFromApi(filters = {}) {
      try {
        const result = await propertyService.getProperties(filters)
        this.properties = result.properties.map(prop =>
          propertyService.transformFromApiFormat(prop)
        )
        return result
      } catch (error) {
        console.error('Failed to load properties:', error)
        throw error
      }
    },

    async createPropertyViaApi(propertyData) {
      try {
        const apiResponse = await propertyService.createProperty(propertyData)
        const newProperty = propertyService.transformFromApiFormat(apiResponse)
        this.properties.push(newProperty)
        return newProperty
      } catch (error) {
        console.error('Failed to create property:', error)
        throw error
      }
    },

    async updatePropertyViaApi(propertyId, updateData) {
      try {
        const property = this.properties.find(p => p.id === propertyId)
        if (!property) {
          throw new Error('Property not found')
        }

        const apiResponse = await propertyService.updateProperty(property.id, updateData)
        const updatedProperty = propertyService.transformFromApiFormat(apiResponse)

        const index = this.properties.findIndex(p => p.id === propertyId)
        if (index !== -1) {
          this.properties[index] = updatedProperty
        }

        return updatedProperty
      } catch (error) {
        console.error('Failed to update property:', error)
        throw error
      }
    },

    async deletePropertyViaApi(propertyId) {
      try {
        const property = this.properties.find(p => p.id === propertyId)
        if (!property) {
          throw new Error('Property not found')
        }

        await propertyService.deleteProperty(property.id)

        const index = this.properties.findIndex(p => p.id === propertyId)
        if (index !== -1) {
          this.properties.splice(index, 1)
        }

        return true
      } catch (error) {
        console.error('Failed to delete property:', error)
        throw error
      }
    },

    async paySubscription(amount) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))

        this.agent.subscriptionStatus = 'active'
        this.agent.lastPaymentDate = new Date()

        const nextPayment = new Date()
        nextPayment.setMonth(nextPayment.getMonth() + 1)
        this.agent.nextPaymentDate = nextPayment

        const newPayment = {
          id: Date.now(),
          date: new Date().toISOString(),
          amount: amount,
          status: 'success'
        }
        this.agent.paymentHistory.unshift(newPayment)

        return true
      } catch (error) {
        console.error('Failed to pay subscription:', error)
        throw error
      }
    },

    checkSubscriptionStatus() {
      const now = new Date()
      const nextPayment = new Date(this.agent.nextPaymentDate)

      if (now > nextPayment) {
        this.agent.subscriptionStatus = 'inactive'
      }

      return this.agent.subscriptionStatus === 'active'
    },

    canEditProperties() {
      return this.checkSubscriptionStatus()
    },

    getVisibleProperties() {
      if (this.checkSubscriptionStatus()) {
        return this.properties
      } else {
        return []
      }
    }
  }
})
