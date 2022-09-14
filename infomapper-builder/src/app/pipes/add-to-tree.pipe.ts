import { Pipe,
          PipeTransform } from '@angular/core';

import * as IM            from '@OpenWaterFoundation/common/services';

@Pipe({
  name: 'addToTree'
})
export class AddToTreePipe implements PipeTransform {

  transform(node: IM.TreeNodeData): string {

    if (node.name.includes('Application:')) {
      return 'Add Menu';
    } else if (node.name.includes('Menu:')) {
      return 'Add SubMenu';
    }

    return 'Add to tree';
  }

}
