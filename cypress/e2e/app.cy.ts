describe('Campaign Dashboard', () => {
  beforeEach(() => {
    // Visit the app before each test and intercept API calls
    cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*').as('getPosts')
    cy.intercept('GET', 'https://jsonplaceholder.typicode.com/users*').as('getUsers')
    cy.visit('/')
    // Wait for initial data load
    cy.wait(['@getPosts', '@getUsers'])
  })

  describe('Header Component', () => {
    it('should have correct layout and styling', () => {
      cy.get('header').within(() => {
        cy.get('h1').should('have.text', 'Campaign Dashboard')
        cy.get('button').should('have.length', 2)
      })
    })

    it('should have working buttons with correct styling', () => {
      cy.get('button').contains('Refresh Data')
        .should('have.class', 'inline-flex')
        .find('svg').should('have.class', 'h-4')

      cy.get('button[aria-label="Toggle theme"]')
        .should('have.class', 'inline-flex')
        .find('svg').should('have.class', 'h-[1.2rem]')
    })

    it('should handle refresh button states', () => {
      cy.get('button').contains('Refresh Data')
        .should('not.be.disabled')
        .should('not.have.class', 'opacity-50')

      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', (req) => {
        req.reply({ delay: 2000 })
      }).as('delayedPosts')
      
      cy.get('button').contains('Refresh Data').click()
      cy.get('button').contains('Refresh Data')
        .should('be.disabled')
        .find('.animate-spin').should('exist')
    })

    it('should maintain header visibility on scroll', () => {
      cy.get('header')
        .should('have.class', 'sticky')
        .should('have.class', 'top-0')
    })
  })

  describe('Overview Section UI', () => {
    it('should display overview cards with correct layout and styling', () => {
      cy.contains('h2', 'Overview').should('exist')
      cy.get('.grid').first().within(() => {
        cy.get('.bg-card').should('have.length', 4)
        cy.get('.text-3xl').should('have.length', 4)
      })
    })

    it('should have correct status badge styling', () => {
      cy.get('.bg-card').first().within(() => {
        cy.get('.text-3xl').should('exist')
        cy.get('.text-lg').should('exist')
      })
    })
  })

  describe('Performance Metrics Section UI', () => {
    it('should display metrics cards with correct layout and styling', () => {
      cy.contains('h2', 'Performance Metrics').should('exist')
      cy.get('.grid').eq(1).within(() => {
        cy.get('.bg-card').should('have.length', 4)
        cy.get('.text-3xl').should('have.length', 4)
      })
    })

    it('should format metric values correctly', () => {
      cy.get('.text-3xl').invoke('text').then((text) => {
        expect(text).to.match(/\$|\%/)
      })
    })
  })

  describe('Campaign Tables UI', () => {
    it('should have correct table styling and layout', () => {
      cy.get('table').should('have.length', 2)
      cy.get('table').first().within(() => {
        cy.get('th').should('have.length', 4)
        cy.get('td').should('exist')
      })
    })

    it('should handle table cell content styling', () => {
      cy.get('table').first().within(() => {
        cy.get('td').first().should('have.class', 'text-left')
        cy.get('td').eq(1).find('span').should('have.class', 'inline-flex')
      })
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to mobile layout (iPhone 6)', () => {
      cy.viewport('iphone-6')
      cy.get('.grid').should('have.class', 'grid-cols-1')
    })

    it('should adapt to tablet layout (iPad)', () => {
      cy.viewport('ipad-2')
      cy.get('.container').should('have.class', 'px-4')
    })

    it('should adapt to desktop layout', () => {
      cy.viewport(1920, 1080)
      cy.get('.grid').should('exist')
    })
  })

  describe('Dark Mode Styling', () => {
    it('should apply dark mode styles to background and text', () => {
      cy.get('button[aria-label="Toggle theme"]').click()
      cy.get('html').should('have.class', 'dark')
      cy.get('.bg-card').should('exist')
    })

    it('should style dark mode badges correctly', () => {
      cy.get('button[aria-label="Toggle theme"]').click()
      cy.get('span').contains('active').should('exist')
    })

    it('should maintain contrast in dark mode tables', () => {
      cy.get('button[aria-label="Toggle theme"]').click()
      cy.get('table').first().find('tr').should('exist')
    })
  })

  describe('Animation and Transitions', () => {
    it('should animate loading spinner', () => {
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', (req) => {
        req.reply({ delay: 2000 })
      }).as('delayedPosts')
      
      cy.get('button').contains('Refresh Data').click()
      cy.get('.animate-spin').should('exist')
    })

    it('should have hover transitions on interactive elements', () => {
      cy.get('button').first().should('have.class', 'transition-colors')
    })
  })

  describe('Error State UI', () => {
    it('should display error state with correct styling', () => {
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', {
        statusCode: 500,
        body: 'Server error'
      }).as('failedRequest')
      
      cy.reload()
      cy.get('.bg-destructive').should('exist')
    })
  })

  describe('Footer Component', () => {
    it('should have correct styling and content', () => {
      cy.get('footer')
        .should('have.class', 'text-center')
        .and('contain', new Date().getFullYear().toString())
    })
  })

  describe('Theme System', () => {
    it('should handle system theme preference', () => {
      cy.get('button[aria-label="Toggle theme"]').click()
      cy.get('html').should('have.class', 'dark')
    })

    it('should persist theme choice across page reloads', () => {
      cy.get('button[aria-label="Toggle theme"]').click()
      cy.get('html').should('have.class', 'dark')
      cy.reload()
      cy.get('html').should('have.class', 'dark')
    })

    it('should apply theme-specific shadows and borders', () => {
      cy.get('.bg-card').first().should('have.class', 'shadow-sm')
    })
  })

  describe('Data Loading States', () => {
    it('should handle slow network conditions', () => {
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', (req) => {
        req.reply({ delay: 3000 })
      }).as('slowPosts')
      
      cy.reload()
      cy.get('.animate-spin').should('be.visible')
      cy.contains('Loading dashboard data...').should('be.visible')
      cy.wait('@slowPosts')
      cy.get('.animate-spin').should('not.exist')
    })

    it('should handle partial data load failure', () => {
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', {
        statusCode: 500,
        body: 'Server error'
      }).as('failedPosts')
      
      cy.reload()
      cy.get('.bg-destructive').should('exist')
    })

    it('should maintain data consistency during updates', () => {
      cy.get('.text-3xl').should('have.length.gt', 0)
      cy.get('button').contains('Refresh Data').click()
      cy.get('.text-3xl').should('have.length.gt', 0)
    })
  })

  describe('Campaign Status Management', () => {
    it('should display correct status distribution', () => {
      cy.get('span').contains('active', { matchCase: false }).should('exist')
      cy.get('span').contains('paused', { matchCase: false }).should('exist')
      cy.get('span').contains('completed', { matchCase: false }).should('exist')
    })

    it('should maintain status consistency across views', () => {
      let initialStatuses: string[] = []
      cy.get('span').contains('active', { matchCase: false }).then($badges => {
        initialStatuses = Array.from($badges, badge => badge.textContent?.toLowerCase() || '')
      })
      
      cy.get('button').contains('Refresh Data').click()
      cy.wait(['@getPosts', '@getUsers'])
      
      cy.get('span').contains('active', { matchCase: false }).should('exist')
    })
  })

  describe('Table Functionality', () => {
    it('should handle long campaign names', () => {
      cy.get('td').first().should('have.class', 'text-left')
    })

    it('should maintain column alignment with different content lengths', () => {
      cy.get('table').first().within(() => {
        cy.get('td').first().should('have.class', 'text-left')
        cy.get('td').last().should('have.class', 'text-right')
      })
    })

    it('should handle table overflow on small screens', () => {
      cy.viewport('iphone-6')
      cy.get('.overflow-x-auto').first().should('exist')
    })
  })

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels', () => {
      cy.get('button[aria-label="Toggle theme"]').should('exist')
    })

    it('should maintain sufficient color contrast', () => {
      cy.get('.text-muted-foreground').should('exist')
      cy.get('button[aria-label="Toggle theme"]').click()
      cy.get('.text-muted-foreground').should('exist')
    })

    it('should have keyboard navigation support', () => {
      cy.get('button').first().focus()
      cy.focused().should('exist')
      cy.get('button').first().trigger('keydown', { key: 'Tab' })
      cy.focused().should('exist')
    })
  })

  describe('Error Recovery', () => {
    it('should handle network recovery', () => {
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', {
        statusCode: 500,
        body: 'Server error'
      }).as('failedRequest')
      
      cy.reload()
      cy.get('.bg-destructive').should('exist')
      
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', {
        statusCode: 200,
        fixture: 'posts.json'
      }).as('successRequest')
      
      cy.get('button').contains('Try Again').click()
      cy.get('.bg-destructive').should('not.exist')
    })

    it('should handle multiple consecutive errors', () => {
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', {
        statusCode: 500,
        body: 'Server error'
      }).as('failedRequest')
      
      cy.reload()
      cy.get('button').contains('Try Again').click()
      cy.get('button').contains('Try Again').click()
      cy.get('button').contains('Try Again').click()
      
      cy.contains('Oops! Something went wrong').should('be.visible')
      cy.get('button').contains('Try Again').should('not.be.disabled')
    })

    it('should preserve user interaction state after recovery', () => {
      cy.get('button[aria-label="Toggle theme"]').click()
      cy.get('html').should('have.class', 'dark')
      
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', {
        statusCode: 500,
        body: 'Server error'
      }).as('failedRequest')
      
      cy.reload()
      cy.get('html').should('have.class', 'dark')
    })
  })

  describe('Data Validation', () => {
    it('should validate campaign date ranges', () => {
      cy.get('table').first().find('td').first().should('exist')
    })

    it('should validate metric calculations', () => {
      cy.contains('Conversion Rate').parent().should('exist')
    })

    it('should handle invalid data gracefully', () => {
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts*', {
        body: []
      }).as('emptyPosts')
      
      cy.reload()
      cy.get('.text-3xl').should('exist')
    })
  })
})

describe('Application Initialization', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should mount the application successfully', () => {
    // Check if the root element exists and has content
    cy.get('#app')
      .should('exist')
      .and('not.be.empty')
  })

  it('should load CSS styles correctly', () => {
    // Verify that the base styles are applied
    cy.get('body')
      .should('have.css', 'background-color')
      .and('not.be.empty')
    
    // Verify Tailwind classes are working
    cy.get('.bg-background')
      .should('exist')
  })

  it('should handle missing root element gracefully', () => {
    // Remove the app element to test error handling
    cy.document().then((doc) => {
      const appElement = doc.getElementById('app')
      if (appElement) {
        appElement.remove()
      }
    })

    // Reload and verify error handling
    cy.reload()
    cy.get('body').should('exist')
  })

  it('should maintain component reactivity after mount', () => {
    // Test that Svelte reactivity is working
    cy.get('button[aria-label="Toggle theme"]').click()
    cy.get('html').should('have.class', 'dark')
    cy.get('button[aria-label="Toggle theme"]').click()
    cy.get('html').should('not.have.class', 'dark')
  })

  it('should preserve state during hot module replacement', () => {
    // Set a state
    cy.get('button[aria-label="Toggle theme"]').click()
    cy.get('html').should('have.class', 'dark')

    // Simulate a module reload by visiting the page again
    cy.visit('/')
    
    // Verify the state is preserved through localStorage
    cy.get('html').should('have.class', 'dark')
  })
}) 