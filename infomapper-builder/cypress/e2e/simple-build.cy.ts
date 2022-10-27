
describe('Test InfoMapper Builder simple build', () => {
  var port = 4200;

  describe('when connected', () => {

    it('should start at Content Page home page', () => {
      cy.visit('http://localhost:' + port);
      cy.url().should('match', /\/content-page\/home/);
    });
  
    it('should navigate to the Build page', () => {
      cy.get('[data-cy="Build-main-menu"]').click();
      cy.url().should('match', /\/build\//);
    });

  });

  // describe('when building a simple app config file', () => {

  //   it('should complete the Application node config form', () => {
  //     cy.get('[data-cy="0-node-dropdown-menu"]').should('be.visible');
  //     cy.get('[data-cy="0-node-dropdown-menu"]').click();
  //   });

  // });

})