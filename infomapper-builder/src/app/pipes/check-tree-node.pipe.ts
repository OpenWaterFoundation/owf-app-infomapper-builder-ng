import { Pipe,
          PipeTransform } from '@angular/core';

import * as IM            from '@OpenWaterFoundation/common/services';


@Pipe({ name: 'checkTreeNode' })
export class CheckTreeNodePipe implements PipeTransform {

  transform(node: IM.TreeFlatNode): boolean {
    
    switch(node.level) {
      case 'Application':
      case 'Datastores':
      case 'Main Menus':
        return true;
      default:
        return false;
    }
  }
}