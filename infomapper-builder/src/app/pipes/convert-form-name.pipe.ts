import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertFormName'
})
export class ConvertFormNamePipe implements PipeTransform {

  /**
   * Converts the provided string from a form to one of the following types:
   *   * `description` - String describing what the selected action requires.
   *   * `title`       - Capitalizes the first letter of the first word for displaying
   *                     purposes.
   *   * `placeholder` - The string to be shown as the form's placeholder.
   *   * `property`    - Gets the property version of the given `formName`.
   * @param formName The form string to use for conversion.
   * @param conversion The type of conversion to perform.
   * @returns The desired converted string to be displayed in the dialog.
   */
  transform(formName: string, conversion: string): string {

    switch(conversion) {
      case 'description':
        return this.getFormNameDescription(formName);
      case 'title':
        return this.getTitleName(formName);
      case 'placeholder':
        return this.getPlaceholder(formName);
      case 'property':
        return this.getPropertyName(formName);
      
    }
    return '';
  }

  /**
   * 
   * @param formName 
   * @returns 
   */
  private getFormNameDescription(formName: string): string {

    switch(formName) {
      case 'contentPage':
        return 'Path or URL to a markdown file to display as a Content Page.';
      case 'dashboard':
        return 'Path or URL to a dashboard JSON file to display as a Dashboard Page.';
      case 'displayMap':
        return 'Path or URL to a GeoMapProject JSON file to display as a Map Page.';
      case 'externalLink':
        return 'External URL link. A new web browser tab will be opened.';
    }
    return '';
  }

  /**
   * 
   * @param formName 
   * @returns 
   */
  private getPlaceholder(formName: string): string {

    switch(formName) {
      case 'contentPage': return '/content-pages/about-the-project.md';
      case 'dashboard': return '/dashboards/dashboard.json';
      case 'displayMap': return 'data-maps/map-config-files/map.json';
      case 'externalLink': return 'https://opewaterfoundation.org';
    }
    return '';
  }

  /**
   * 
   * @param formName 
   * @returns 
   */
  private getPropertyName(formName: string): string {

    switch(formName) {
      case 'contentPage': return 'markdownFile';
      case 'dashboard': return 'dashboardFile';
      case 'displayMap': return 'mapProject';
      case 'externalLink': return 'url';
    }
    return '';
  }

  /**
   * 
   * @param formName 
   * @returns 
   */
  private getTitleName(formName: string): string {

    switch(formName) {
      case 'contentPage': return 'Content Page';
      case 'dashboard': return 'Dashboard';
      case 'displayMap': return 'GeoMap';
      case 'externalLink': return 'External Link';
    }
    return '';
  }

}
