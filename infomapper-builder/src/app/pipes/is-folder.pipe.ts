import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isFolder'
})
export class IsFolderPipe implements PipeTransform {

  transform(item: any, checkFor: string): boolean {

    switch(checkFor) {
      case 'isFolder':
        if (Object.keys(item.value).length > 1) {
          return true;
        } else {
          return false;
        }
      case 'isFile':
        if (Object.keys(item.value).length === 1) {
          return true;
        } else {
          return false;
        }
    }
    return false;
  }

}
