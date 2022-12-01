import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import * as IM from '@OpenWaterFoundation/common/services';


@Injectable({
  providedIn: 'root'
})
export class FileService {

  private _bucketPath = new BehaviorSubject('');

  private _currentLevelItems = new BehaviorSubject({});

  private allFiles: any;

  private fullBucketPath = '';

  private map = new Map<string, IM.FileNode>();

  private idCount = -1;

  private querySubject: BehaviorSubject<IM.FileNode[]>;


  constructor() { }


  /**
   * 
   */
  get bucketPath(): Observable<string> {
    return this._bucketPath.asObservable();
  }

  /**
   * 
   */
  get currentLevelItems(): any {
    return this._currentLevelItems.asObservable();
  }

  /**
   * 
   * @param path 
   */
  appendBucketPath(path: string): void {
    this.fullBucketPath = this.fullBucketPath + path + '/';
    this._bucketPath.next(this.fullBucketPath);
  }

  /**
   * 
   * @param fileElement 
   * @returns 
   */
  add(fileElement: IM.FileNode) {
    fileElement.id = (++this.idCount).toString();
    this.map.set(fileElement.id, this.clone(fileElement));
    return fileElement;
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
   * @param id 
   */
  delete(id: string) {
    this.map.delete(id);
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  get(id: string) {
    return this.map.get(id);
  }

  /**
   * 
   */
  popBucketPath(): void {
    var elements = this.fullBucketPath.split('/');
    elements.pop();
    elements.pop();

    if (elements.length) {
      this.fullBucketPath = elements.join('/') + '/';
      this._bucketPath.next(this.fullBucketPath);
    } else {
      this.fullBucketPath = '';
      this._bucketPath.next(this.fullBucketPath);
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
   * @param folderId 
   * @returns 
   */
   queryInFolder(folderId: string) {
    const result: IM.FileNode[] = [];
    this.map.forEach(element => {
      if (element.parent === folderId) {
        result.push(this.clone(element));
      }
    });
    if (!this.querySubject) {
      this.querySubject = new BehaviorSubject(result);
    } else {
      this.querySubject.next(result);
    }
    return this.querySubject.asObservable();
  }

  setAllFiles(allFiles: any): void {
    this.allFiles = this.clone(allFiles);
    this._currentLevelItems.next(this.clone(allFiles));
  }

  setCurrentLevelItems(items: any): void {
    this._currentLevelItems.next(this.clone(items));
  }

  /**
   * 
   * @param id 
   * @param update 
   */
  update(id: string, update: Partial<IM.FileNode>) {
    let element = this.map.get(id);
    element = Object.assign(element, update);
    this.map.set(element.id, element);
  }

  updateCurrentLevelItems(currentItem: any): void {
    // var currentItems: any;

    // var splits = this.fullBucketPath.split('/');
    // splits = splits.filter((key: string) => { return key != '' });
    // console.log('Splits:', splits);

    // splits.forEach((key: string, i: number) => {
    //   if (i === 0) {
    //     currentItems = this.clone(this.allFiles[key]);
    //   } else {
    //     currentItems = this.clone(currentItems[key]);
    //   }
    // });

    // console.log('currentItems:', currentItems);
    // this._currentLevelItems.next(this.clone(currentItems));
    console.log('currentItems:', currentItem);
    this._currentLevelItems.next(this.clone(currentItem));
  }
  
}
