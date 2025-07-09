import { defineStore } from 'pinia'

export const useAgentStore = defineStore('agent', {
  state: () => ({
    agent: {
      id: 1,
      name: 'Иван Петров',
      email: 'ivan.petrov@email.com',
      phone: '+7 (999) 123-45-67',
      region: 'moscow',
      avatar: '👤',
      personalLink: 'https://realestate.com/agent/ivan-petrov'
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
        status: 'paid',
        createdAt: new Date('2024-01-15'),
    
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
        status: 'unpaid',
        createdAt: new Date('2024-02-10'),
  
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
      editPropertyModal: false
    },

    selectedProperty: null,

    tempCoordinates: null
  }),

  getters: {
    propertiesByStatus: (state) => (status) => {
      return state.properties.filter(property => property.status === status)
    },
    
    propertiesByDealType: (state) => (dealType) => {
      return state.properties.filter(property => property.dealType === dealType)
    },
    
    totalProperties: (state) => state.properties.length,
    
    paidPropertiesCount: (state) => {
      return state.properties.filter(property => property.status === 'paid').length
    },
    
    unpaidPropertiesCount: (state) => {
      return state.properties.filter(property => property.status === 'unpaid').length
    }
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
        status: 'unpaid',
        createdAt: new Date(),
        coordinates: coordinates,
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
   
    payForProperty(propertyId) {
      const property = this.properties.find(p => p.id === propertyId)
      if (property) {
        property.status = 'paid'
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
    copyPersonalLink() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.agent.personalLink)
        return true
      }
      return false
    }
  }
})
