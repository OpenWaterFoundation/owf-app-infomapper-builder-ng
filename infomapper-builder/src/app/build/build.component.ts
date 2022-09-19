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

import { first,
          Subject,
          takeUntil }              from 'rxjs'; 

import { CommonLoggerService }     from '@OpenWaterFoundation/common/services';
import * as IM                     from '@OpenWaterFoundation/common/services';

import { AppService }              from '../app.service';
import { DialogComponent }         from './builder-utility/dialog/dialog.component';
import { BuildManager }            from './build-manager';


@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent implements OnInit, OnDestroy {

  /** The main FormGroup for the entire application. */
  appBuilderForm = new FormGroup({});
  /** FormGroup to be used by the AppConfigComponent. */
  appConfigFG = new FormGroup({
    title: new FormControl('', Validators.required),
    homePage: new FormControl({ value: '/content-page/home.md', disabled: true }),
    version: new FormControl('', Validators.required),
    dataUnitsPath: new FormControl(''),
    favicon: new FormControl(''),
    googleAnalyticsTrackingId: new FormControl('')
  });
  /** Singleton BuildManager instance to uniquely add different nodes to the
   * displayed tree. */
  buildManager: BuildManager = BuildManager.getInstance();
  /** The current screen size. Used for dialogs to determine if they
   * should be shown for desktop or mobile screens. */
  currentScreenSize: string;
  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** All used FontAwesome icons in the AppConfigComponent. */
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  /** Counter for each dynamically created mainMenu. */
  mainMenuCount = 0;
  /** FormGroup to be used by the MenuComponent. */
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
      name: 'Application: New application',
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
    this.buildManager.addNodeToTree(this.treeNodeData[0], nodeName);
    
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
      disableClose: true,
      panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
      height: isMobile ? "90vh" : "850px",
      width: isMobile ? "100vw" : "800px",
      minHeight: isMobile ? "90vh" : "300px",
      minWidth: isMobile ? "100vw" : "800px",
      maxHeight: isMobile ? "90vh" : "90vh",
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

      console.log('paramMap:', paramMap);
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
   * @param choice 
   */
  nodeMenuChoice(choice: IM.MenuChoice): void {

    switch(choice.menuChoice) {
      case 'addMainMenu':
      case 'addSubmenu':
        this.addToTree(choice.nodeName);
        break;
      case 'editConfig':
        this.openConfigDialog(choice.nodeName);
    }
  }

  /**
  * 
  */
   public openConfigDialog(nodeName: string): void {

    var dialogConfigData = {
      appBuilderForm: this.appBuilderForm,
      nodeName: nodeName
    }

    var dialogRef: MatDialogRef<DialogComponent, any> = this.dialog.open(
      DialogComponent, this.createDialogConfig(dialogConfigData)
    );

    dialogRef.afterClosed().pipe(first()).subscribe((form: FormGroup) => {

      if (!form) {
        return;
      }

      for (const field in form.controls) {
        console.log('Input value from dialog for control ' + field + ': ', form.get(field).value);
        if (!form.get(field).value.title) {
          break;
        }
        this.treeNodeData[0].name = 'Application: ' + form.get(field).value.title;
      }
    });

  }

  updateTreeNodeName(): void {
    // Use in the future.
  }

}
