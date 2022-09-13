import { Component,
          OnDestroy,
          OnInit }                 from '@angular/core';
import { FormControl,
          FormGroup,
          Validators }             from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl }       from '@angular/cdk/tree';

import { faChevronDown,
          faChevronRight }         from '@fortawesome/free-solid-svg-icons';
import { Subject,
          takeUntil }              from 'rxjs'; 

import { ActivatedRoute,
          ParamMap }               from '@angular/router';

import { CommonLoggerService }     from '@OpenWaterFoundation/common/services';
import * as IM                     from '@OpenWaterFoundation/common/services';

import { AppService }              from '../app.service';


@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent implements OnInit, OnDestroy {

  /**
   * 
   */
  appBuilderForm = new FormGroup({
    title: new FormControl('', Validators.required),
    homePage: new FormControl({ value: '/content-page/home.md', disabled: true }),
    favicon: new FormControl(''),
    version: new FormControl(''),
    mainMenu: new FormGroup({
      name: new FormControl('', Validators.required),
      action: new FormControl('', Validators.required),
      id: new FormControl('', Validators.required),
      tooltip: new FormControl('')
    })
  });
  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** All used FontAwesome icons in the AppConfigComponent. */
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  /**
   * 
   */
  treeControl = new NestedTreeControl<IM.TreeNodeData>(node => node.children);
  /**
   * 
   */
  treeDataSource = new MatTreeNestedDataSource<IM.TreeNodeData>();
  /**
   * 
   */
  treeNodeData: IM.TreeNodeData[] = [
    {
      name: 'Application configuration',
      children: [{name: 'Menu'}]
    }
  ];
  /** Boolean set to false if the URL id for this Build component does not exist
   * in any `app-config.json` mainMenu or subMenu id. */
  validBuildID = true;


  constructor(private logger: CommonLoggerService, private actRoute: ActivatedRoute,
  private appService: AppService) { }


  /**
   * 
   */
  addMainMenuToApp(): void {

    this.treeNodeData[0].children.push({
      name: 'Menu'
    });
    this.treeDataSource.data = this.treeNodeData;
  }
  
  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

  /**
   * 
   */
  initTreeNode(): void {
    this.treeDataSource.data = this.treeNodeData;
  }

  ngOnInit(): void {
    // When the parameters in the URL are changed the map will refresh and load
    // according to new configuration data.
    this.actRoute.paramMap.pipe(takeUntil(this.destroyed)).subscribe((paramMap: ParamMap) => {

      var buildID = paramMap.get('builderId');
      this.validBuildID = this.appService.validURLConfigID(buildID);

      if (this.validBuildID === false) {
        return;
      }

      this.initTreeNode();
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
