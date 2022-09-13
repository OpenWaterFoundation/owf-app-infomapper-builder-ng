import { Component,
          Input,
          OnInit }                 from '@angular/core';
import { FormGroup }               from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl }       from '@angular/cdk/tree';

import { faChevronDown,
          faChevronRight }         from '@fortawesome/free-solid-svg-icons';

interface AppConfigNode {
  name: string;
  children?: any[];
}

const TREE_DATA = [
  {
    name: 'Application configuration',
    children: [
      {
        name: 'Menu',
        children: [{name: 'SubMenu'}]
      }
    ]
  }
];

@Component({
  selector: 'app-config',
  templateUrl: './app-config.component.html',
  styleUrls: ['./app-config.component.scss']
})
export class AppConfigComponent implements OnInit {

  /**
   * 
   */
  @Input('appBuilderForm') appBuilderFormGroup: FormGroup;
  /** All used FontAwesome icons in the AppConfigComponent. */
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  /**
   * 
   */
  treeControl = new NestedTreeControl<any>(node => node.children);
  /**
   * 
   */
  treeDataSource = new MatTreeNestedDataSource<any>();


  constructor() { }


  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

  initTreeNode(): void {
    this.treeDataSource.data = TREE_DATA;
  }

  ngOnInit(): void {
    this.initTreeNode();
  }

}
