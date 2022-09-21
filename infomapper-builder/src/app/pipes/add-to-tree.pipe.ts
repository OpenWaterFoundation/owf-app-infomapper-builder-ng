import { Pipe,
          PipeTransform } from '@angular/core';

import * as IM            from '@OpenWaterFoundation/common/services';

@Pipe({
  name: 'addToTree'
})
export class AddToTreePipe implements PipeTransform {

  transform(node: IM.TreeNodeData): string | boolean {

    if (node.level === 'Application') {
      return 'Add Menu';
    } else if (node.level === 'Main Menu') {
      return 'Add SubMenu';
    } else if (node.level === 'SubMenu') {
      return false;
    } 

    return 'Add to tree';
  }

}
