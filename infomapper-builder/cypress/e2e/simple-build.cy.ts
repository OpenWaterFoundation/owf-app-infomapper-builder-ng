
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

  describe('when building a simple app config file', () => {

    it('should complete the Application node config form', () => {
      let appId = '0';
      // Input to enter to each tested field in the config.
      let title = 'Poudre Basin Information';
      let version = '3.0.0 (2022-08-01)';

      cy.get('[data-cy="' + appId + '-node-dropdown-menu"]').should('be.visible');
      // Prevent from being scrolled behind the second nav bar.
      // https://github.com/cypress-io/cypress/issues/9739
      cy.get('[data-cy="' + appId + '-node-dropdown-menu"]').click({ scrollBehavior: false });
      cy.get('[data-cy="main-dialog-container"]').should('not.exist');
      cy.get('[data-cy="' + appId + '-edit-config-button"]').click();
      cy.get('[data-cy="main-dialog-container"]').should('exist').and('be.visible');
      // The Save button should be disabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      // Fill out the required form fields.
      cy.get('[data-cy="' + appId + '-app-config-title"]').type(title);
      cy.wait(250);
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      cy.get('[data-cy="' + appId + '-app-config-version"]').type(version);
      // The Save button should now be enabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.enabled');
      cy.get('[data-cy="dialog-lower-save-button"]').click();
      cy.wait(250);
      // Confirm the label and name are correct after the dialog config is saved.
      // cy.get('[data-cy="' + appId + '-tree-node-level-and-name"').contains(' Poudre Basin Information');
    });

    it('should add a Datastore node to the tree', () => {
      let appId = '0';
      let datastoreId = '0/0/0';

      cy.get('[data-cy="' + appId + '-node-dropdown-menu"]').should('be.visible');
      // Prevent from being scrolled behind the second nav bar.
      cy.get('[data-cy="' + appId + '-node-dropdown-menu"]').click({ scrollBehavior: false });
      cy.get('[data-cy="' + datastoreId + '-tree-node-no-children"]').should('not.exist');
      cy.get('[data-cy="' + appId + '-add-datastore-button"]').click();
      cy.get('[data-cy="' + datastoreId + '-tree-node-no-children"').should('exist');
    });

    it('should complete the Datastore node config form', () => {
      let datastoreId = '0/0/0';
      // Input to enter to each tested field in the config.
      let name = 'StateModGitHub';
      let type = 'owf.datastore.statemod';
      let rootUrl = 'https://raw.githubusercontent/path';

      cy.get('[data-cy="' + datastoreId + '-node-dropdown-menu"]').should('be.visible');
      // Prevent from being scrolled behind the second nav bar.
      // https://github.com/cypress-io/cypress/issues/9739
      cy.get('[data-cy="' + datastoreId + '-node-dropdown-menu"]').click({ scrollBehavior: false });
      cy.get('[data-cy="main-dialog-container"]').should('not.exist');
      cy.get('[data-cy="' + datastoreId + '-edit-config-button"]').click();
      cy.get('[data-cy="main-dialog-container"]').should('exist').and('be.visible');
      // The Save button should be disabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      // Fill out the required form fields.
      cy.get('[data-cy="' + datastoreId + '-datastore-config-name"]').type(name);
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      cy.get('[data-cy="' + datastoreId + '-datastore-config-type"]').type(type);
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      cy.get('[data-cy="' + datastoreId + '-datastore-config-rootUrl"]').type(rootUrl);
      // The Save button should now be enabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.enabled');
      cy.get('[data-cy="dialog-lower-save-button"]').click();
      cy.wait(250);
    });

    it('should add a Main Menu node to the tree', () => {
      let appId = '0';
      let mainMenuId = '0/1/0';

      cy.get('[data-cy="' + appId + '-node-dropdown-menu"]').should('be.visible');
      // Prevent from being scrolled behind the second nav bar.
      cy.get('[data-cy="' + appId + '-node-dropdown-menu"]').click({ scrollBehavior: false });
      cy.get('[data-cy="' + mainMenuId + '-tree-node-no-children"]').should('not.exist');
      cy.get('[data-cy="' + appId + '-add-main-menu-button"]').click();
      cy.get('[data-cy="' + mainMenuId + '-tree-node-no-children"]').should('exist');
    });

    it('should complete the Main Menu node config form', () => {
      let nodeId = '0/1/0';
      // Input to enter to each tested field in the config.
      let id = 'Dashboards';
      let name = 'Dashboards';
      let description = 'Menu for dashboards ';

      cy.get('[data-cy="' + nodeId + '-node-dropdown-menu"]').should('be.visible');
      // Prevent from being scrolled behind the second nav bar.
      // https://github.com/cypress-io/cypress/issues/9739
      cy.get('[data-cy="' + nodeId + '-node-dropdown-menu"]').click({ scrollBehavior: false });
      cy.get('[data-cy="main-dialog-container"]').should('not.exist');
      cy.get('[data-cy="' + nodeId + '-edit-config-button"]').click();
      cy.get('[data-cy="main-dialog-container"]').should('exist').and('be.visible');
      // The Save button should be disabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      // Fill out the required form fields.
      cy.get('[data-cy="' + nodeId + '-main-menu-config-id"]').type(id);
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      cy.get('[data-cy="' + nodeId + '-main-menu-config-name"]').type(name);
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      cy.get('[data-cy="' + nodeId + '-main-menu-config-description"]').type(description);
      // The Save button should now be enabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.enabled');
      cy.get('[data-cy="dialog-lower-save-button"]').click();
      cy.wait(250);
    });

    it('should add a SubMenu node to the tree', () => {
      let mainMenuId = '0/1/0';
      let subMenuId = '0/1/0/0';

      cy.get('[data-cy="' + mainMenuId + '-node-dropdown-menu"]').should('be.visible');
      // Prevent from being scrolled behind the second nav bar.
      cy.get('[data-cy="' + mainMenuId + '-node-dropdown-menu"]').click({ scrollBehavior: false });
      cy.get('[data-cy="' + subMenuId + '-tree-node-no-children"]').should('not.exist');
      cy.get('[data-cy="' + mainMenuId + '-add-subMenu-button"]').click();
      cy.get('[data-cy="' + subMenuId + '-tree-node-no-children"]').should('exist');
    });

    it('should complete the first SubMenu node config form', () => {
      let nodeId = '0/1/0/0';
      // Input to enter to each tested field in the config.
      let id = 'poudre-main-dashboard';
      let name = 'Main Dashboard';
      let description = 'Main Test dashboard.';
      let actionPathOrUrl = '/dashboards/main/main-dashboard.json';
      let tooltip = 'Poudre Basin main dashboard';

      cy.get('[data-cy="' + nodeId + '-node-dropdown-menu"]').should('be.visible');
      // Prevent from being scrolled behind the second nav bar.
      // https://github.com/cypress-io/cypress/issues/9739
      cy.get('[data-cy="' + nodeId + '-node-dropdown-menu"]').click({ scrollBehavior: false });
      cy.get('[data-cy="main-dialog-container"]').should('not.exist');
      cy.get('[data-cy="' + nodeId + '-edit-config-button"]').click();
      cy.get('[data-cy="main-dialog-container"]').should('exist').and('be.visible');
      // The Save button should be disabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      // Fill out the required form fields.
      cy.get('[data-cy="' + nodeId + '-subMenu-config-id"]').type(id);
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      cy.get('[data-cy="' + nodeId + '-subMenu-config-name"]').type(name);
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      cy.get('[data-cy="' + nodeId + '-subMenu-config-description"]').type(description);
      // 
      cy.get('[data-cy="' + nodeId + '-subMenu-config-dashboardFile"]').should('not.exist');
      cy.get('[data-cy="' + nodeId + '-subMenu-config-action"]').click().get('mat-option')
      .contains('dashboard').click();
      cy.get('[data-cy="' + nodeId + '-subMenu-config-dashboardFile"]').should('exist');
      cy.get('[data-cy="' + nodeId + '-subMenu-config-dashboardFile"]').type(actionPathOrUrl);

      cy.get('[data-cy="' + nodeId + '-subMenu-config-tooltip"]').type(tooltip);

      // The Save button should now be enabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.enabled');
      cy.get('[data-cy="dialog-lower-save-button"]').click();
      cy.wait(250);
    });

    it('should add a SubMenu node to the tree', () => {
      let mainMenuId = '0/1/0';
      let subMenuId = '0/1/0/1';

      cy.get('[data-cy="' + mainMenuId + '-node-dropdown-menu"]').should('be.visible');
      // Prevent from being scrolled behind the second nav bar.
      cy.get('[data-cy="' + mainMenuId + '-node-dropdown-menu"]').click({ scrollBehavior: false });
      cy.get('[data-cy="' + subMenuId + '-tree-node-no-children"]').should('not.exist');
      cy.get('[data-cy="' + mainMenuId + '-add-subMenu-button"]').click();
      cy.get('[data-cy="' + subMenuId + '-tree-node-no-children"]').should('exist');
    });

    it('should complete the second SubMenu node config form', () => {
      let nodeId = '0/1/0/1';
      // Input to enter to each tested field in the config.
      let id = 'poudre-basin-water-supply-dashboard';
      let name = 'Water Supply (for Basin) Dashboard';
      let description = 'Water supply for basin indicators.';
      let actionPathOrUrl = '/dashboards/water-supply-basin/water-supply-basin-dashboard.json';
      let tooltip = 'Poudre Basin water supply indicators';

      cy.get('[data-cy="' + nodeId + '-node-dropdown-menu"]').should('be.visible');
      // Prevent from being scrolled behind the second nav bar.
      // https://github.com/cypress-io/cypress/issues/9739
      cy.get('[data-cy="' + nodeId + '-node-dropdown-menu"]').click({ scrollBehavior: false });
      cy.get('[data-cy="main-dialog-container"]').should('not.exist');
      cy.get('[data-cy="' + nodeId + '-edit-config-button"]').click();
      cy.get('[data-cy="main-dialog-container"]').should('exist').and('be.visible');
      // The Save button should be disabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      // Fill out the required form fields.
      cy.get('[data-cy="' + nodeId + '-subMenu-config-id"]').type(id);
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      cy.get('[data-cy="' + nodeId + '-subMenu-config-name"]').type(name);
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.disabled');
      cy.get('[data-cy="' + nodeId + '-subMenu-config-description"]').type(description);
      // 
      cy.get('[data-cy="' + nodeId + '-subMenu-config-dashboardFile"]').should('not.exist');
      cy.get('[data-cy="' + nodeId + '-subMenu-config-action"]').click().get('mat-option')
      .contains('dashboard').click();
      cy.get('[data-cy="' + nodeId + '-subMenu-config-dashboardFile"]').should('exist');
      cy.get('[data-cy="' + nodeId + '-subMenu-config-dashboardFile"]').type(actionPathOrUrl);

      cy.get('[data-cy="' + nodeId + '-subMenu-config-tooltip"]').type(tooltip);

      // The Save button should now be enabled.
      cy.get('[data-cy="dialog-lower-save-button"]').should('be.enabled');
      cy.get('[data-cy="dialog-lower-save-button"]').click();
      cy.wait(250);
    });

  });

})