import { Pipe,
          PipeTransform } from '@angular/core';

import * as IM            from '@OpenWaterFoundation/common/services';

@Pipe({
  name: 'addToTree'
})
export class AddToTreePipe implements PipeTransform {

  transform(node: IM.TreeNodeData): string | boolean {

    if (node.name.includes('Application:')) {
      return 'Add Menu';
    } else if (node.name.includes('Main Menu:')) {
      return 'Add SubMenu';
    } else if (node.name.includes('SubMenu:')) {
      return false;
    } 

    return 'Add to tree';
  }

}
