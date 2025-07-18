// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Property Management Commands
Cypress.Commands.add('addProperty', (propertyData) => {
  cy.get('[data-testid="add-property-btn"]').click()
  cy.get('[data-testid="property-modal"]').should('be.visible')

  cy.get('#propertyTitle').type(propertyData.title)
  cy.get('#propertyAddress').type(propertyData.address)
  cy.get('#propertyPrice').type(propertyData.price.toString())
  cy.get('#propertyDealType').select(propertyData.dealType)
  cy.get('#propertyType').select(propertyData.propertyType)

  if (propertyData.description) {
    cy.get('#propertyDescription').type(propertyData.description)
  }

  cy.get('[data-testid="submit-property"]').click()
  cy.get('[data-testid="property-modal"]').should('not.exist')
})

Cypress.Commands.add('editProperty', (propertyId, updateData) => {
  cy.get(`[data-testid="property-${propertyId}"] [data-testid="edit-btn"]`).click()
  cy.get('[data-testid="edit-property-modal"]').should('be.visible')

  if (updateData.title) {
    cy.get('#propertyTitle').clear().type(updateData.title)
  }
  if (updateData.price) {
    cy.get('#propertyPrice').clear().type(updateData.price.toString())
  }
  if (updateData.description) {
    cy.get('#propertyDescription').clear().type(updateData.description)
  }

  cy.get('[data-testid="submit-property"]').click()
  cy.get('[data-testid="edit-property-modal"]').should('not.exist')
})

Cypress.Commands.add('deleteProperty', (propertyId) => {
  cy.get(`[data-testid="property-${propertyId}"] [data-testid="delete-btn"]`).click()
  cy.get('[data-testid="confirm-delete"]').click()
})

// Subscription Commands
Cypress.Commands.add('paySubscription', () => {
  cy.get('[data-testid="pay-subscription-btn"]').click()
  cy.get('[data-testid="payment-success"]', { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('openSubscriptionModal', () => {
  cy.get('[data-testid="manage-subscription-btn"]').click()
  cy.get('[data-testid="subscription-modal"]').should('be.visible')
})

// Map Commands
Cypress.Commands.add('clickOnMap', (lat, lng) => {
  cy.get('[data-testid="map-container"]').click(lat, lng)
})

Cypress.Commands.add('waitForMapLoad', () => {
  cy.get('[data-testid="map-container"]').should('be.visible')
  cy.wait(2000) // Wait for map to fully load
})

// Photo Upload Commands
Cypress.Commands.add('uploadPhotos', (fileNames) => {
  const files = fileNames.map(fileName => `cypress/fixtures/${fileName}`)
  cy.get('[data-testid="photo-upload"]').selectFile(files, { force: true })
})

// Filter Commands
Cypress.Commands.add('applyPropertyFilter', (filterType, value) => {
  cy.get(`[data-testid="filter-${filterType}"]`).select(value)
  cy.get('[data-testid="apply-filters"]').click()
})

// Authentication Commands (for future use)
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('[data-testid="login-btn"]').click()
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-btn"]').click()
  cy.url().should('include', '/login')
})

// Utility Commands
Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-testid="${testId}"]`)
})

Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('exist')
})

Cypress.Commands.add('scrollToElement', (selector) => {
  cy.get(selector).scrollIntoView()
})

// Form Validation Commands
Cypress.Commands.add('checkFormValidation', (fieldSelector, errorMessage) => {
  cy.get(fieldSelector).should('have.class', 'error')
  cy.get(`${fieldSelector} + .error-message`).should('contain', errorMessage)
})

// Modal Commands
Cypress.Commands.add('closeModal', (modalTestId) => {
  cy.get(`[data-testid="${modalTestId}"] [data-testid="close-modal"]`).click()
  cy.get(`[data-testid="${modalTestId}"]`).should('not.exist')
})

// Wait for API calls
Cypress.Commands.add('waitForApiCall', (alias) => {
  cy.wait(`@${alias}`)
})

// Check responsive design
Cypress.Commands.add('checkResponsiveElement', (selector) => {
  // Desktop
  cy.setDesktopViewport()
  cy.get(selector).should('be.visible')

  // Tablet
  cy.setTabletViewport()
  cy.get(selector).should('be.visible')

  // Mobile
  cy.setMobileViewport()
  cy.get(selector).should('be.visible')
})
