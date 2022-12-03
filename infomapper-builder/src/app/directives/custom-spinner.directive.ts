import { Directive, 
          ElementRef } from '@angular/core';

@Directive({
  selector: '[appCustomSpinner]'
})
export class CustomSpinnerDirective {


  constructor(private el: ElementRef) {
    const element = this.el.nativeElement;
    
    // circle.style.stroke = '#9db66b';
  }

}
