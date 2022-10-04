import { Pipe,
          PipeTransform } from '@angular/core';

import * as IM            from '@OpenWaterFoundation/common/services';


@Pipe({
  name: 'checkSaveState'
})
export class CheckSaveStatePipe implements PipeTransform {

  transform(node: IM.TreeNodeData, savedState: boolean): boolean {

    // switch(node.level) {
    //   case 'Application':
        
    // }

    console.log('Save state:', savedState);
    console.log('Node:', node);

    // if (!savedState) {
    //   return true;
    // } else {
    //   return false;
    // }
    
    // return true;
    return false;
  }
}