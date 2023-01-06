import { Injectable }      from '@angular/core';
import { Overlay }         from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { LoaderComponent } from '../build/builder-utility/loader/loader.component';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

  overlayRef = this.overlay.create({
    positionStrategy: this.overlay.position()
    // .flexibleConnectedTo(this.overlayOrigin.elementRef),
    .global().centerHorizontally().centerVertically(),
    hasBackdrop: true
  })

  constructor(private overlay: Overlay) {
  }
  
  showLoader() {
    this.overlayRef.attach(new ComponentPortal(LoaderComponent))
  }

  hideLoader() {
    this.overlayRef.detach()
  }
}