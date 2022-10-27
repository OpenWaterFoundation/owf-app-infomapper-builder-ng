
describe('Test InfoMapper Builder navigation', () => {
  var port = 4200;

  describe('when on desktop', () => {

    it('should start at Content Page home page', () => {
      cy.visit('http://localhost:' + port);
      cy.url().should('match', /\/content-page\/home/);
    });
  
    it('should navigate to the Story training page', () => {
      cy.get('[data-cy="Training-main-menu"]').click();
      cy.url().should('match', /\/story\//);
    });
  
    it('should navigate to the Build page', () => {
      cy.get('[data-cy="Build-main-menu"]').click();
      cy.url().should('match', /\/build\//);
    });

  });

  // Set the screen size for all tests in this suite.
  describe('On mobile & smaller screens', {
    viewportHeight: 600,
    viewportWidth: 1000
  }, () => {

    it('should navigate back to Content Page home page', () => {
      cy.get('[data-cy="home-side-main-menu"').should('be.hidden');
      cy.get('[data-cy="side-nav-toggle-button"').click();
      cy.get('[data-cy="home-side-main-menu"').should('be.visible');

      cy.get('[data-cy="home-side-main-menu"]').click();
      cy.url().should('match', /\/content-page\/home/);
      cy.get('[data-cy="home-side-main-menu"').should('be.hidden');
    });

    it('should navigate back to the Build page', () => {
      cy.get('[data-cy="Build-side-main-menu"').should('be.hidden');
      cy.get('[data-cy="side-nav-toggle-button"').click();
      cy.get('[data-cy="Build-side-main-menu"').should('be.visible');

      cy.get('[data-cy="Build-side-main-menu"]').click();
      cy.url().should('match', /\/build\//);
      cy.get('[data-cy="Build-side-main-menu"').should('be.hidden');
    });

    it('should navigate back to the Story training page', () => {
      cy.get('[data-cy="Training-side-main-menu"').should('be.hidden');
      cy.get('[data-cy="side-nav-toggle-button"').click();
      cy.get('[data-cy="Training-side-main-menu"').should('be.visible');

      cy.get('[data-cy="Training-side-main-menu"]').click();
      cy.url().should('match', /\/story\//);
      cy.get('[data-cy="Training-side-main-menu"').should('be.hidden');
    });

    it('should open and close the side nav with the close menu item', () => {
      cy.get('[data-cy="close-side-main-menu"').should('be.hidden');
      cy.get('[data-cy="side-nav-toggle-button"').click();
      cy.get('[data-cy="close-side-main-menu"').should('be.visible');

      cy.get('[data-cy="close-side-main-menu"').click();
      cy.get('[data-cy="close-side-main-menu"').should('be.hidden');
    });

  });

})