import { NgModule }                 from '@angular/core';

import { CdkStepperModule }         from '@angular/cdk/stepper';
import { CdkTableModule }           from '@angular/cdk/table';
import { CdkTreeModule }            from '@angular/cdk/tree';
import { DragDropModule }           from '@angular/cdk/drag-drop';
import { OverlayModule }            from '@angular/cdk/overlay';
import { PortalModule }             from '@angular/cdk/portal';
import { ScrollingModule }          from '@angular/cdk/scrolling';

import { MatButtonModule }          from '@angular/material/button';
import { MatCardModule }            from '@angular/material/card';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatDividerModule }         from '@angular/material/divider';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatGridListModule }        from '@angular/material/grid-list';
import { MatIconModule }            from '@angular/material/icon';
import { MatInputModule }           from '@angular/material/input';
import { MatListModule }            from '@angular/material/list';
import { MatMenuModule }            from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule }          from '@angular/material/select';
import { MatSidenavModule }         from '@angular/material/sidenav';
import { MatSnackBarModule }        from '@angular/material/snack-bar';
import { MatTabsModule }            from '@angular/material/tabs';
import { MatToolbarModule }         from '@angular/material/toolbar';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { MatTreeModule }            from '@angular/material/tree';

@NgModule({
    exports: [
      CdkStepperModule,
      CdkTableModule,
      CdkTreeModule,
      DragDropModule,
      OverlayModule,
      PortalModule,
      ScrollingModule,
  
      MatButtonModule,
      MatCardModule,
      MatDialogModule,
      MatDividerModule,
      MatFormFieldModule,
      MatGridListModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      MatMenuModule,
      MatProgressSpinnerModule,
      MatSelectModule,
      MatSidenavModule,
      MatSnackBarModule,
      MatTabsModule,
      MatToolbarModule,
      MatTooltipModule,
      MatTreeModule
    ]
  })
 export class MaterialModule { }
  