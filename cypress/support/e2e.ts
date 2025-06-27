import '@testing-library/cypress/add-commands'

// Cypress Testing Library adds custom commands and improves the readability
// of your tests. Instead of using cy.get('[data-testid="example"]'),
// you can use cy.findByTestId('example')

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here if needed
    }
  }
} 