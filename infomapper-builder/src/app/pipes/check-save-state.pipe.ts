import { Pipe,
          PipeTransform } from '@angular/core';

import * as IM            from '@OpenWaterFoundation/common/services';
import { Observable }     from 'rxjs/internal/Observable';
import { BuildManager }   from '../build/build-manager';


@Pipe({
  name: 'checkSaveState'
})
export class CheckSaveStatePipe implements PipeTransform {

  /** Singleton BuildManager instance to uniquely add different nodes to the
   * displayed tree. */
  buildManager: BuildManager = BuildManager.getInstance();

  transform(node: IM.TreeNodeData): Observable<boolean> {
    return this.buildManager.isNodeInSavedState(node);
  }
}