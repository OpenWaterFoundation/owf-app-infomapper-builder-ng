import { Component,
          OnDestroy,
          OnInit }                 from '@angular/core';
import { FormBuilder,
          FormControl,
          FormGroup,
          Validators }             from '@angular/forms';
import { ActivatedRoute,
          ParamMap }               from '@angular/router';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef }           from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BreakpointObserver,
          Breakpoints }            from '@angular/cdk/layout';
import { NestedTreeControl }       from '@angular/cdk/tree';

import { faChevronDown,
          faChevronRight }         from '@fortawesome/free-solid-svg-icons';

import { Subject,
          takeUntil }              from 'rxjs'; 

import { CommonLoggerService }     from '@OpenWaterFoundation/common/services';
import * as IM                     from '@OpenWaterFoundation/common/services';

import { AppService }              from '../app.service';
import { DialogComponent }         from './builder-components/dialog/dialog.component';



@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent implements OnInit, OnDestroy {

  /**
   * 
   */
  appBuilderForm = new FormGroup({});
  /**
   * 
   */
  appConfigFG = new FormGroup({
    title: new FormControl('', Validators.required),
    homePage: new FormControl({ value: '/content-page/home.md', disabled: true }),
    favicon: new FormControl(''),
    version: new FormControl('')
  });

  currentScreenSize: string;
  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** All used FontAwesome icons in the AppConfigComponent. */
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;

  mainMenuCount = 0;
  /**
   * 
   */
  mainMenuFG = new FormGroup({
    name: new FormControl('', Validators.required),
    action: new FormControl('', Validators.required),
    id: new FormControl('', Validators.required),
    tooltip: new FormControl('')
  });
  /** Structure for nested Trees. */
  treeControl = new NestedTreeControl<IM.TreeNodeData>(node => node.children);
  /** The dataSource object that is used to display and update the tree on the DOM. */
  treeDataSource = new MatTreeNestedDataSource<IM.TreeNodeData>();
  /** Initial data for a new tree. */
  treeNodeData: IM.TreeNodeData[] = [
    {
      name: 'Application:',
      children: []
    }
  ];
  /** Boolean set to false if the URL id for this Build component does not exist
   * in any `app-config.json` mainMenu or subMenu id. */
  validBuildID = true;


  /**
   * Constructor for the BuildComponent.
   * @param logger OWF Common library for logging.
   * @param actRoute Provides access to information about the current route/URL.
   * @param appService The InfoMapper Builder's top level service.
   */
  constructor(private breakpointObserver: BreakpointObserver, private logger: CommonLoggerService,
  private actRoute: ActivatedRoute, private appService: AppService, private fb: FormBuilder,
  private dialog: MatDialog) {

    this.appBuilderForm.addControl('appConfigFG', this.appConfigFG);

    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ])
    .pipe(takeUntil(this.destroyed))
    .subscribe((result: any) => {
      for (const query of Object.keys(result.breakpoints)) {
        if (result.breakpoints[query]) {
          this.currentScreenSize = query;
        }
      }
    });
  }


  /**
   * Adds a
   */
  addToTree(nodeName: string): void {

    if (nodeName.includes('Application:')) {
      this.treeNodeData[0].children.push({name: 'Menu:'});
    } else if (nodeName.includes('Menu:')) {
      this.treeNodeData[0].children[0].children.push({name: 'SubMenu:'});
    }
    
    // This is required for Angular to see the changes and update the Tree.
    // https://stackoverflow.com/questions/50976766/how-to-update-nested-mat-tree-dynamically
    this.treeDataSource.data = null;
    this.treeDataSource.data = this.treeNodeData;
  }

  /**
   * Creates a dialog config object and sets its width & height properties based
   * on the current screen size.
   * @returns An object to be used for creating a dialog with its initial, min, and max
   * height and width conditionally.
   */
   private createDialogConfig(dialogConfigData: any): MatDialogConfig {

    var isMobile = (this.currentScreenSize === Breakpoints.XSmall ||
      this.currentScreenSize === Breakpoints.Small);

    return {
      data: dialogConfigData,
      panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
      height: isMobile ? "90vh" : "700px",
      width: isMobile ? "100vw" : "800px",
      minHeight: isMobile ? "90vh" : "300px",
      minWidth: isMobile ? "100vw" : "785px",
      maxHeight: isMobile ? "90vh" : "70vh",
      maxWidth: isMobile ? "100vw" : "95vw"
    }
  }

  /**
   * 
   */
  createInfoMapper(): void {
    for (const field in this.appBuilderForm.controls) {
      console.log('Input value for control ' + field + ': ', this.appBuilderForm.get(field).value);
    }
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

  /**
  * 
  */
   public openDialog(): void {
    var windowID = 'dialog';
    // if (this.windowManager.windowExists(windowID)) {
    //   return;
    // }

    var dialogConfigData = {
      appBuilderForm: this.appBuilderForm,
      windowID: windowID
    }

    var dialogRef: MatDialogRef<DialogComponent, any> = this.dialog.open(
      DialogComponent, this.createDialogConfig(dialogConfigData)
    );

    // this.windowManager.addWindow(windowID, WindowType.DOC);
  }

}
