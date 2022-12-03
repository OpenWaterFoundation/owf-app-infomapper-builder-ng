import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import * as IM from '@OpenWaterFoundation/common/services';


@Injectable({
  providedIn: 'root'
})
export class FileService {

  private _bucketPath = new BehaviorSubject('');

  private _currentLevelItems = new BehaviorSubject({});

  private _isLoading = new BehaviorSubject(true);

  private allFiles: any;

  private _fullBucketPath = '';

  private idCount = -1;

  private querySubject: BehaviorSubject<IM.FileNode[]>;


  constructor() { }


  get allOriginalFiles(): any {
    return this.allFiles;
  }

  /**
   * 
   */
  get bucketPath(): Observable<string> {
    return this._bucketPath.asObservable();
  }

  /**
   * 
   */
  get currentLevelItems(): Observable<any> {
    return this._currentLevelItems.asObservable();
  }

  /**
   * 
   */
  get isLoading(): Observable<boolean> {
    return this._isLoading.asObservable();
  }

  /**
   * 
   * @param path 
   */
  appendBucketPath(path: string): void {
    this._fullBucketPath = this._fullBucketPath + path + '/';
    this._bucketPath.next(this._fullBucketPath);
  }

  /**
   * 
   * @param element 
   * @returns 
   */
  clone(element: any) {
    return JSON.parse(JSON.stringify(element));
  }

  /**
   * 
   * @param item 
   */
  navigateDown(item: any): void {
    this.appendBucketPath(item.key);
    this.updateCurrentLevelItems(item.value);
  }

  /**
   * 
   */
  navigateUp(): void {
    this.popBucketPath();

    var navigatedItem: any;
    var folderNames = this._fullBucketPath.split('/').filter(item => { return item; })

    if (folderNames.length) {
      folderNames.forEach((name: string, i: number) => {
        if (i === 0) {
          navigatedItem = this.clone(this.allFiles[name]);
        } else {
          navigatedItem = this.clone(navigatedItem[name]);
        }
      });
      this.updateCurrentLevelItems(navigatedItem);
    }
    else {
      this.updateCurrentLevelItems(this.allFiles);
    }
    
  }

  /**
   * 
   */
  popBucketPath(): void {
    var elements = this._fullBucketPath.split('/');
    elements.pop();
    elements.pop();

    if (elements.length) {
      this._fullBucketPath = elements.join('/') + '/';
      this._bucketPath.next(this._fullBucketPath);
    } else {
      this._fullBucketPath = '';
      this._bucketPath.next(this._fullBucketPath);
    }
    
  }

  /**
   * 
   * @param allFiles 
   * @returns 
   */
  processStorageList(allFiles: any): any {

    const filesystem = {};
    // https://stackoverflow.com/questions/44759750/how-can-i-create-a-nested-object-representation-of-a-folder-structure
    const add = (source: string, target: any, item: any) => {
      const elements = source.split('/');
      const element = elements.shift();
      if (!element) return; // blank
      target[element] = target[element] || { __data: item }; // element;
      if (elements.length) {
        target[element] = typeof target[element] === 'object' ? target[element] : {};
        add(elements.join('/'), target[element], item);
      }
    };

    allFiles.forEach((item: any) => add(item.key, filesystem, item));
    return filesystem;
  }

  /**
   * 
   */
   resetFullBucketPath() {
    this._fullBucketPath = '';
    this._bucketPath.next(this._fullBucketPath);
  }

  /**
   * 
   * @param allFiles 
   */
  setAllFiles(allFiles: any): void {
    this.allFiles = this.clone(allFiles);
    this._currentLevelItems.next(this.clone(allFiles));
    this._isLoading.next(false);
  }

  /**
   * 
   * @param items 
   */
  setCurrentLevelItems(items: any): void {
    this._currentLevelItems.next(this.clone(items));
  }

  /**
   * 
   * @param loading 
   */
  setToLoading(loading: boolean) {
    this._isLoading.next(loading);
  }

  /**
   * 
   * @param currentItem 
   */
  updateCurrentLevelItems(currentItem: any): void {
    this._currentLevelItems.next(this.clone(currentItem));
  }
  
}
