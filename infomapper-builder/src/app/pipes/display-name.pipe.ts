import { Pipe,
          PipeTransform } from '@angular/core';

import * as IM            from '@OpenWaterFoundation/common/services';


@Pipe({
  name: 'displayName'
})
export class DisplayNamePipe implements PipeTransform {

  // THIS PIPE IS CURRENTLY UNUSED.
  transform(node: IM.TreeNodeData): string {
    return '';
  }
}