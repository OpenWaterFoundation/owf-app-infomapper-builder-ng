import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import * as IM from '@OpenWaterFoundation/common/services';


@Injectable({
  providedIn: 'root'
})
export class FileService {

  private map = new Map<string, IM.FileNode>();

  private idCount = -1;

  private querySubject: BehaviorSubject<IM.FileNode[]>;


  constructor() { }


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
  clone(element: IM.FileNode) {
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
   * @param update 
   */
  update(id: string, update: Partial<IM.FileNode>) {
    let element = this.map.get(id);
    element = Object.assign(element, update);
    this.map.set(element.id, element);
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

  /**
   * 
   * @param id 
   * @returns 
   */
  get(id: string) {
    return this.map.get(id);
  }

  
}
