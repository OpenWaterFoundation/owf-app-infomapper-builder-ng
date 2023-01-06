import { Directive, 
          ElementRef } from '@angular/core';

@Directive({
  selector: '[overlayLoading]'
})
export class OverlayLoadingDirective {


  constructor(private el: ElementRef) {
    const element = this.el.nativeElement;
    
    // circle.style.stroke = '#9db66b';
  }

}
