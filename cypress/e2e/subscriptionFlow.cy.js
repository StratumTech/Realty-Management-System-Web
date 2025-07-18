describe('Subscription Flow E2E Tests', () => {
  beforeEach(() => {
    cy.clearAppState()
    cy.visit('/')
    cy.waitForPageLoad()
  })

  describe('Subscription Info Widget', () => {
    it('should display correct subscription information', () => {
      // Check subscription info widget is visible
      cy.get('[data-testid="subscription-info"]').should('be.visible')
      
      // Check property count and amount
      cy.get('[data-testid="property-count"]').should('contain', '2') // From test data
      cy.get('[data-testid="subscription-amount"]').should('contain', '$10') // 2 * $5
      
      // Check subscription status
      cy.get('[data-testid="subscription-status"]').should('be.visible')
    })

    it('should update amount when properties are added', () => {
      // Check initial amount
      cy.get('[data-testid="subscription-amount"]').should('contain', '$10')
      
      // Add a new property
      cy.addProperty({
        title: 'New Test Property',
        address: 'Test Address',
        price: 3000000,
        dealType: 'sale',
        propertyType: '1+1',
        description: 'Test description'
      })
      
      // Check updated amount
      cy.get('[data-testid="subscription-amount"]').should('contain', '$15') // 3 * $5
      cy.get('[data-testid="property-count"]').should('contain', '3')
    })

    it('should show correct property count text for different numbers', () => {
      // Test with 1 property
      cy.window().then((win) => {
        const oneProperty = [{ id: 1, title: 'Single Property' }]
        win.localStorage.setItem('test_properties', JSON.stringify(oneProperty))
      })
      cy.reload()
      cy.waitForPageLoad()
      
      cy.get('[data-testid="property-count-text"]').should('contain', 'объект')
      
      // Test with 2-4 properties
      cy.window().then((win) => {
        const twoProperties = [
          { id: 1, title: 'Property 1' },
          { id: 2, title: 'Property 2' }
        ]
        win.localStorage.setItem('test_properties', JSON.stringify(twoProperties))
      })
      cy.reload()
      cy.waitForPageLoad()
      
      cy.get('[data-testid="property-count-text"]').should('contain', 'объекта')
      
      // Test with 5+ properties
      cy.window().then((win) => {
        const fiveProperties = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          title: `Property ${i + 1}`
        }))
        win.localStorage.setItem('test_properties', JSON.stringify(fiveProperties))
      })
      cy.reload()
      cy.waitForPageLoad()
      
      cy.get('[data-testid="property-count-text"]').should('contain', 'объектов')
    })
  })

  describe('Subscription Payment', () => {
    beforeEach(() => {
      // Set subscription as inactive
      cy.window().then((win) => {
        const agentData = {
          subscriptionStatus: 'inactive',
          properties: [
            { id: 1, title: 'Property 1' },
            { id: 2, title: 'Property 2' },
            { id: 3, title: 'Property 3' }
          ]
        }
        win.localStorage.setItem('agent_data', JSON.stringify(agentData))
      })
      cy.reload()
      cy.waitForPageLoad()
    })

    it('should show payment button for inactive subscription', () => {
      cy.get('[data-testid="subscription-status"]').should('contain', 'Неактивна')
      cy.get('[data-testid="subscription-warning"]').should('be.visible')
      cy.get('[data-testid="pay-subscription-btn"]').should('be.visible')
      cy.get('[data-testid="pay-subscription-btn"]').should('contain', 'Оплатить $15')
    })

    it('should complete payment flow successfully', () => {
      // Mock payment API
      cy.intercept('POST', '**/api/v1/payments', {
        statusCode: 200,
        body: { success: true, transactionId: 'test-123' }
      }).as('payment')

      // Click pay button
      cy.get('[data-testid="pay-subscription-btn"]').click()
      
      // Wait for payment to complete
      cy.wait('@payment')
      
      // Check success message
      cy.get('[data-testid="payment-success"]').should('be.visible')
      cy.get('[data-testid="payment-success"]').should('contain', 'Подписка успешно оплачена!')
      
      // Check subscription status changed
      cy.get('[data-testid="subscription-status"]').should('contain', 'Активна')
      cy.get('[data-testid="manage-subscription-btn"]').should('be.visible')
      cy.get('[data-testid="pay-subscription-btn"]').should('not.exist')
    })

    it('should handle payment errors gracefully', () => {
      // Mock payment error
      cy.intercept('POST', '**/api/v1/payments', {
        statusCode: 400,
        body: { error: 'Payment failed' }
      }).as('paymentError')

      cy.get('[data-testid="pay-subscription-btn"]').click()
      cy.wait('@paymentError')
      
      // Check error message
      cy.get('[data-testid="payment-error"]').should('be.visible')
      cy.get('[data-testid="payment-error"]').should('contain', 'Ошибка при оплате подписки')
      
      // Subscription should remain inactive
      cy.get('[data-testid="subscription-status"]').should('contain', 'Неактивна')
    })

    it('should disable button during payment processing', () => {
      // Mock slow payment
      cy.intercept('POST', '**/api/v1/payments', (req) => {
        req.reply((res) => {
          setTimeout(() => {
            res.send({ statusCode: 200, body: { success: true } })
          }, 2000)
        })
      }).as('slowPayment')

      const payBtn = cy.get('[data-testid="pay-subscription-btn"]')
      
      // Button should be enabled initially
      payBtn.should('not.be.disabled')
      payBtn.should('contain', 'Оплатить $15')
      
      // Click button
      payBtn.click()
      
      // Button should be disabled and show processing
      payBtn.should('be.disabled')
      payBtn.should('contain', 'Обработка...')
      
      // Wait for payment to complete
      cy.wait('@slowPayment')
      
      // Button should be enabled again (or hidden if payment successful)
      cy.get('[data-testid="manage-subscription-btn"]').should('be.visible')
    })

    it('should prevent multiple payment attempts', () => {
      // Mock payment that takes time
      cy.intercept('POST', '**/api/v1/payments', (req) => {
        req.reply((res) => {
          setTimeout(() => {
            res.send({ statusCode: 200, body: { success: true } })
          }, 1000)
        })
      }).as('payment')

      const payBtn = cy.get('[data-testid="pay-subscription-btn"]')
      
      // Click button multiple times quickly
      payBtn.click()
      payBtn.click()
      payBtn.click()
      
      // Should only make one API call
      cy.get('@payment.all').should('have.length', 1)
    })
  })

  describe('Subscription Management', () => {
    beforeEach(() => {
      // Set subscription as active
      cy.window().then((win) => {
        const agentData = {
          subscriptionStatus: 'active',
          lastPaymentDate: new Date().toISOString(),
          paymentHistory: [
            {
              id: 1,
              date: new Date().toISOString(),
              amount: 15,
              status: 'success'
            }
          ]
        }
        win.localStorage.setItem('agent_data', JSON.stringify(agentData))
      })
      cy.reload()
      cy.waitForPageLoad()
    })

    it('should show management button for active subscription', () => {
      cy.get('[data-testid="subscription-status"]').should('contain', 'Активна')
      cy.get('[data-testid="manage-subscription-btn"]').should('be.visible')
      cy.get('[data-testid="pay-subscription-btn"]').should('not.exist')
      cy.get('[data-testid="subscription-warning"]').should('not.exist')
    })

    it('should open subscription modal', () => {
      cy.get('[data-testid="manage-subscription-btn"]').click()
      cy.get('[data-testid="subscription-modal"]').should('be.visible')
      
      // Check modal content
      cy.get('[data-testid="subscription-modal"]').should('contain', 'Управление подпиской')
      cy.get('[data-testid="current-plan"]').should('be.visible')
      cy.get('[data-testid="payment-history"]').should('be.visible')
    })

    it('should display payment history in modal', () => {
      cy.openSubscriptionModal()
      
      // Check payment history
      cy.get('[data-testid="payment-history"]').should('contain', '$15.00')
      cy.get('[data-testid="payment-history"]').should('contain', 'success')
      cy.get('[data-testid="payment-date"]').should('be.visible')
    })

    it('should close modal correctly', () => {
      cy.openSubscriptionModal()
      
      // Close modal using close button
      cy.get('[data-testid="close-modal"]').click()
      cy.get('[data-testid="subscription-modal"]').should('not.exist')
      
      // Open modal again and close with escape key
      cy.openSubscriptionModal()
      cy.get('body').type('{esc}')
      cy.get('[data-testid="subscription-modal"]').should('not.exist')
    })
  })

  describe('Property Visibility Based on Subscription', () => {
    it('should hide properties when subscription is inactive', () => {
      // Set subscription as inactive
      cy.window().then((win) => {
        const agentData = {
          subscriptionStatus: 'inactive',
          properties: [
            { id: 1, title: 'Property 1' },
            { id: 2, title: 'Property 2' }
          ]
        }
        win.localStorage.setItem('agent_data', JSON.stringify(agentData))
      })
      cy.reload()
      cy.waitForPageLoad()
      
      // Properties should not be visible on map
      cy.waitForMapLoad()
      cy.get('[data-testid="map-marker"]').should('not.exist')
      
      // Properties list should show subscription message
      cy.get('[data-testid="subscription-required"]').should('be.visible')
      cy.get('[data-testid="subscription-required"]').should('contain', 'Оплатите подписку')
    })

    it('should show properties when subscription is active', () => {
      // Set subscription as active
      cy.window().then((win) => {
        const agentData = {
          subscriptionStatus: 'active',
          properties: [
            { id: 1, title: 'Property 1', coordinates: { lat: 55.7558, lng: 37.6176 } },
            { id: 2, title: 'Property 2', coordinates: { lat: 55.7522, lng: 37.5927 } }
          ]
        }
        win.localStorage.setItem('agent_data', JSON.stringify(agentData))
      })
      cy.reload()
      cy.waitForPageLoad()
      
      // Properties should be visible on map
      cy.waitForMapLoad()
      cy.get('[data-testid="map-marker"]').should('have.length', 2)
      
      // Properties list should show properties
      cy.get('[data-testid="properties-list"]').should('be.visible')
      cy.get('[data-testid^="property-"]').should('have.length', 2)
    })

    it('should disable property editing when subscription is inactive', () => {
      // Set subscription as inactive but with properties
      cy.window().then((win) => {
        const agentData = {
          subscriptionStatus: 'inactive',
          properties: [{ id: 1, title: 'Property 1' }]
        }
        win.localStorage.setItem('agent_data', JSON.stringify(agentData))
      })
      cy.reload()
      cy.waitForPageLoad()
      
      // Edit and delete buttons should be disabled
      cy.get('[data-testid="edit-btn"]').should('be.disabled')
      cy.get('[data-testid="delete-btn"]').should('be.disabled')
      cy.get('[data-testid="add-property-btn"]').should('be.disabled')
    })
  })

  describe('Subscription Status Persistence', () => {
    it('should persist subscription status across page reloads', () => {
      // Pay for subscription
      cy.window().then((win) => {
        const agentData = { subscriptionStatus: 'inactive' }
        win.localStorage.setItem('agent_data', JSON.stringify(agentData))
      })
      cy.reload()
      cy.waitForPageLoad()
      
      // Mock successful payment
      cy.intercept('POST', '**/api/v1/payments', {
        statusCode: 200,
        body: { success: true }
      }).as('payment')
      
      cy.get('[data-testid="pay-subscription-btn"]').click()
      cy.wait('@payment')
      
      // Verify subscription is active
      cy.get('[data-testid="subscription-status"]').should('contain', 'Активна')
      
      // Reload page
      cy.reload()
      cy.waitForPageLoad()
      
      // Subscription should still be active
      cy.get('[data-testid="subscription-status"]').should('contain', 'Активна')
      cy.get('[data-testid="manage-subscription-btn"]').should('be.visible')
    })
  })

  describe('Responsive Subscription UI', () => {
    it('should display subscription info correctly on mobile', () => {
      cy.setMobileViewport()
      
      cy.get('[data-testid="subscription-info"]').should('be.visible')
      cy.get('[data-testid="subscription-amount"]').should('be.visible')
      cy.get('[data-testid="property-count"]').should('be.visible')
      
      // Buttons should be full width on mobile
      cy.get('[data-testid="pay-subscription-btn"]').should('have.css', 'width')
    })

    it('should display subscription modal correctly on tablet', () => {
      cy.setTabletViewport()
      
      cy.openSubscriptionModal()
      
      // Modal should be responsive
      cy.get('[data-testid="subscription-modal"]').should('be.visible')
      cy.get('[data-testid="subscription-modal"]').should('have.css', 'max-width')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="subscription-info"]').should('have.attr', 'role', 'region')
      cy.get('[data-testid="pay-subscription-btn"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="subscription-status"]').should('have.attr', 'aria-live', 'polite')
    })

    it('should be keyboard navigable', () => {
      // Tab to pay button
      cy.get('body').tab()
      cy.focused().should('have.attr', 'data-testid', 'pay-subscription-btn')
      
      // Press enter to activate
      cy.focused().type('{enter}')
      
      // Should trigger payment flow
      cy.get('[data-testid="payment-processing"]').should('be.visible')
    })
  })
})
