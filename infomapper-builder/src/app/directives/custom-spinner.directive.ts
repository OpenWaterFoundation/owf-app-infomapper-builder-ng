import { Directive, 
          ElementRef } from '@angular/core';

@Directive({
  selector: '[appCustomSpinner]'
})
export class CustomSpinnerDirective {


  constructor(private el: ElementRef) {
    const element = this.el.nativeElement;
    console.log('Element:', element);
    var circle = element.querySelector("circle");
    console.log('Circle:', circle);
    circle.style.stroke = '#9db66b';
  }

}
