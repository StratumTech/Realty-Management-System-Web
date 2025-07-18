// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style')
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }'
  style.setAttribute('data-hide-command-log-request', '')
  app.document.head.appendChild(style)
}

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  return true
})

// Custom viewport sizes
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667) // iPhone 6/7/8
})

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024) // iPad
})

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720) // Desktop
})

// Wait for page to be fully loaded
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'Vue')
  cy.get('body').should('be.visible')
})

// Mock API responses
Cypress.Commands.add('mockApiResponse', (method, url, response, statusCode = 200) => {
  cy.intercept(method, url, {
    statusCode,
    body: response
  }).as('apiCall')
})

// Clear application state
Cypress.Commands.add('clearAppState', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
})

// Setup test data
Cypress.Commands.add('setupTestData', () => {
  cy.window().then((win) => {
    // Setup test properties
    const testProperties = [
      {
        id: 1,
        title: 'Test Property 1',
        address: 'Test Address 1',
        price: 5000000,
        dealType: 'sale',
        propertyType: '2+1',
        coordinates: { lat: 55.7558, lng: 37.6176 }
      },
      {
        id: 2,
        title: 'Test Property 2',
        address: 'Test Address 2',
        price: 50000,
        dealType: 'rent',
        propertyType: '1+1',
        coordinates: { lat: 55.7522, lng: 37.5927 }
      }
    ]

    win.localStorage.setItem('test_properties', JSON.stringify(testProperties))
  })
})
