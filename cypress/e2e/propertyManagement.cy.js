describe('Property Management E2E Tests', () => {
  beforeEach(() => {
    cy.clearAppState()
    cy.visit('/')
    cy.waitForPageLoad()
  })

  describe('Property Creation', () => {
    it('should create a new property successfully', () => {
      // Mock geocoding API
      cy.intercept('GET', '**/nominatim.openstreetmap.org/search**', {
        fixture: 'geocoding-response.json'
      }).as('geocoding')

      // Open property creation modal
      cy.get('[data-testid="add-property-btn"]').click()
      cy.get('[data-testid="property-modal"]').should('be.visible')

      // Fill in property details
      cy.get('#propertyTitle').type('Тестовая квартира E2E')
      cy.get('#propertyAddress').type('Москва, ул. Тверская, 1')
      cy.get('#propertyPrice').type('5000000')
      cy.get('#propertyDealType').select('sale')
      cy.get('#propertyType').select('2+1')
      cy.get('#propertyDescription').type('Отличная квартира в центре города')

      // Test geocoding
      cy.get('[data-testid="geocode-btn"]').click()
      cy.wait('@geocoding')
      cy.get('[data-testid="geocoding-status"]').should('contain', '✅')

      // Upload photos
      cy.get('[data-testid="photo-upload"]').selectFile([
        'cypress/fixtures/test-image-1.jpg',
        'cypress/fixtures/test-image-2.jpg'
      ], { force: true })

      // Wait for photos to upload
      cy.get('[data-testid="photo-preview"]').should('have.length', 2)

      // Submit form
      cy.get('[data-testid="submit-property"]').click()

      // Verify property was created
      cy.get('[data-testid="property-modal"]').should('not.exist')
      cy.get('[data-testid="properties-list"]').should('contain', 'Тестовая квартира E2E')
      
      // Verify property appears on map
      cy.waitForMapLoad()
      cy.get('[data-testid="map-marker"]').should('have.length.at.least', 1)
    })

    it('should handle form validation errors', () => {
      cy.get('[data-testid="add-property-btn"]').click()
      cy.get('[data-testid="property-modal"]').should('be.visible')

      // Try to submit empty form
      cy.get('[data-testid="submit-property"]').click()

      // Check validation errors
      cy.checkFormValidation('#propertyTitle', 'Заголовок обязателен')
      cy.checkFormValidation('#propertyAddress', 'Адрес обязателен')
      cy.checkFormValidation('#propertyPrice', 'Цена обязательна')

      // Modal should still be open
      cy.get('[data-testid="property-modal"]').should('be.visible')
    })

    it('should handle geocoding errors gracefully', () => {
      // Mock geocoding error
      cy.intercept('GET', '**/nominatim.openstreetmap.org/search**', {
        statusCode: 500,
        body: { error: 'Service unavailable' }
      }).as('geocodingError')

      cy.get('[data-testid="add-property-btn"]').click()
      cy.get('#propertyAddress').type('Неверный адрес')
      cy.get('[data-testid="geocode-btn"]').click()
      
      cy.wait('@geocodingError')
      cy.get('[data-testid="geocoding-status"]').should('contain', '❌')
      cy.get('[data-testid="geocoding-error"]').should('be.visible')
    })

    it('should handle photo upload errors', () => {
      cy.get('[data-testid="add-property-btn"]').click()
      
      // Try to upload invalid file
      cy.get('[data-testid="photo-upload"]').selectFile([
        'cypress/fixtures/invalid-file.txt'
      ], { force: true })

      cy.get('[data-testid="upload-error"]').should('contain', 'Можно загружать только изображения')
    })
  })

  describe('Property Editing', () => {
    beforeEach(() => {
      // Setup test data with existing property
      cy.setupTestData()
      cy.reload()
      cy.waitForPageLoad()
    })

    it('should edit property successfully', () => {
      // Find and click edit button for first property
      cy.get('[data-testid="property-1"] [data-testid="edit-btn"]').click()
      cy.get('[data-testid="edit-property-modal"]').should('be.visible')

      // Verify form is pre-filled
      cy.get('#propertyTitle').should('have.value', 'Test Property 1')
      cy.get('#propertyPrice').should('have.value', '5000000')

      // Update property details
      cy.get('#propertyTitle').clear().type('Обновленная квартира')
      cy.get('#propertyPrice').clear().type('5500000')
      cy.get('#propertyDescription').clear().type('Обновленное описание')

      // Submit changes
      cy.get('[data-testid="submit-property"]').click()

      // Verify changes were saved
      cy.get('[data-testid="edit-property-modal"]').should('not.exist')
      cy.get('[data-testid="property-1"]').should('contain', 'Обновленная квартира')
      cy.get('[data-testid="property-1"]').should('contain', '5 500 000')
    })

    it('should preserve existing photos when editing', () => {
      cy.get('[data-testid="property-1"] [data-testid="edit-btn"]').click()
      
      // Check that existing photos are loaded
      cy.get('[data-testid="photo-preview"]').should('have.length.at.least', 1)
      
      // Make a simple change without touching photos
      cy.get('#propertyTitle').clear().type('Новый заголовок')
      cy.get('[data-testid="submit-property"]').click()
      
      // Verify photos are preserved
      cy.get('[data-testid="property-1"] [data-testid="edit-btn"]').click()
      cy.get('[data-testid="photo-preview"]').should('have.length.at.least', 1)
    })
  })

  describe('Property Deletion', () => {
    beforeEach(() => {
      cy.setupTestData()
      cy.reload()
      cy.waitForPageLoad()
    })

    it('should delete property with confirmation', () => {
      // Count initial properties
      cy.get('[data-testid^="property-"]').then($properties => {
        const initialCount = $properties.length

        // Delete first property
        cy.get('[data-testid="property-1"] [data-testid="delete-btn"]').click()
        
        // Confirm deletion
        cy.get('[data-testid="confirm-delete"]').click()

        // Verify property was deleted
        cy.get('[data-testid^="property-"]').should('have.length', initialCount - 1)
        cy.get('[data-testid="property-1"]').should('not.exist')
      })
    })

    it('should cancel deletion when user cancels', () => {
      cy.get('[data-testid^="property-"]').then($properties => {
        const initialCount = $properties.length

        // Try to delete property
        cy.get('[data-testid="property-1"] [data-testid="delete-btn"]').click()
        
        // Cancel deletion
        cy.get('[data-testid="cancel-delete"]').click()

        // Verify property still exists
        cy.get('[data-testid^="property-"]').should('have.length', initialCount)
        cy.get('[data-testid="property-1"]').should('exist')
      })
    })
  })

  describe('Property Filtering', () => {
    beforeEach(() => {
      cy.setupTestData()
      cy.reload()
      cy.waitForPageLoad()
    })

    it('should filter properties by deal type', () => {
      // Apply sale filter
      cy.get('[data-testid="filter-dealType"]').select('sale')
      cy.get('[data-testid="apply-filters"]').click()

      // Verify only sale properties are shown
      cy.get('[data-testid^="property-"]').each($property => {
        cy.wrap($property).should('contain', 'Продажа')
      })
    })

    it('should filter properties by price range', () => {
      // Set price filter
      cy.get('[data-testid="filter-minPrice"]').type('1000000')
      cy.get('[data-testid="filter-maxPrice"]').type('6000000')
      cy.get('[data-testid="apply-filters"]').click()

      // Verify properties are within price range
      cy.get('[data-testid^="property-"]').each($property => {
        cy.wrap($property).find('[data-testid="property-price"]').then($price => {
          const price = parseInt($price.text().replace(/\D/g, ''))
          expect(price).to.be.within(1000000, 6000000)
        })
      })
    })

    it('should clear filters', () => {
      // Apply filters
      cy.get('[data-testid="filter-dealType"]').select('sale')
      cy.get('[data-testid="apply-filters"]').click()

      // Clear filters
      cy.get('[data-testid="clear-filters"]').click()

      // Verify all properties are shown again
      cy.get('[data-testid^="property-"]').should('have.length.at.least', 2)
    })
  })

  describe('Map Integration', () => {
    beforeEach(() => {
      cy.setupTestData()
      cy.reload()
      cy.waitForPageLoad()
      cy.waitForMapLoad()
    })

    it('should show properties on map', () => {
      // Verify map markers exist
      cy.get('[data-testid="map-marker"]').should('have.length.at.least', 2)
    })

    it('should show property popup on marker hover', () => {
      // Hover over first marker
      cy.get('[data-testid="map-marker"]').first().trigger('mouseover')
      
      // Verify popup appears
      cy.get('[data-testid="property-popup"]').should('be.visible')
      cy.get('[data-testid="property-popup"]').should('contain', 'Test Property')
    })

    it('should add property by clicking on map', () => {
      // Click on map to add property
      cy.get('[data-testid="map-container"]').click(400, 300)
      
      // Verify property modal opens with coordinates
      cy.get('[data-testid="property-modal"]').should('be.visible')
      cy.get('[data-testid="coordinates-display"]').should('be.visible')
    })
  })

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.setupTestData()
      cy.reload()
      cy.waitForPageLoad()
    })

    it('should work correctly on mobile devices', () => {
      cy.setMobileViewport()
      
      // Check that main elements are visible
      cy.get('[data-testid="properties-list"]').should('be.visible')
      cy.get('[data-testid="add-property-btn"]').should('be.visible')
      
      // Test property creation on mobile
      cy.get('[data-testid="add-property-btn"]').click()
      cy.get('[data-testid="property-modal"]').should('be.visible')
      
      // Modal should be responsive
      cy.get('[data-testid="property-modal"]').should('have.css', 'width')
    })

    it('should work correctly on tablet devices', () => {
      cy.setTabletViewport()
      
      // Check layout on tablet
      cy.get('[data-testid="sidebar"]').should('be.visible')
      cy.get('[data-testid="main-content"]').should('be.visible')
      cy.get('[data-testid="map-container"]').should('be.visible')
    })
  })

  describe('Performance', () => {
    it('should load page within acceptable time', () => {
      const start = Date.now()
      
      cy.visit('/')
      cy.waitForPageLoad()
      
      cy.then(() => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(5000) // 5 seconds
      })
    })

    it('should handle large number of properties', () => {
      // Setup many properties
      cy.window().then((win) => {
        const manyProperties = Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          title: `Property ${i + 1}`,
          address: `Address ${i + 1}`,
          price: 1000000 + i * 10000,
          dealType: i % 2 === 0 ? 'sale' : 'rent',
          propertyType: '2+1',
          coordinates: { lat: 55.7558 + i * 0.001, lng: 37.6176 + i * 0.001 }
        }))
        
        win.localStorage.setItem('test_properties', JSON.stringify(manyProperties))
      })
      
      cy.reload()
      cy.waitForPageLoad()
      
      // Check that page still loads and is responsive
      cy.get('[data-testid="properties-list"]').should('be.visible')
      cy.get('[data-testid="property-count"]').should('contain', '100')
    })
  })
})
