import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertFormName'
})
export class ConvertFormNamePipe implements PipeTransform {

  /**
   * Converts the provided string from a form to one of the following types:
   *   * `title`    - Capitalizes the first letter of the first word for displaying
   *                  purposes.
   *   * `property` - Gets the property version of the given `formName`.
   * @param formName The form string to convert.
   * @param conversion The type of conversion to perform.
   * @returns The converted form name.
   */
  transform(formName: string, conversion: string): string {

    switch(conversion) {
      case 'title':
        return this.getTitleName(formName);
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
