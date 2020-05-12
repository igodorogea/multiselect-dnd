import { Component, ElementRef, HostBinding, Input, ViewEncapsulation } from '@angular/core';
import { svgIconsList } from './svg-icons-list';

@Component({
  selector: 'app-svg-icon[svgIcon]',
  template: '',
  styleUrls: ['./svg-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SvgIconComponent {
  @HostBinding('class') class = 'svg-icon';
  @Input() temp: number;
  @Input()
  set svgIcon(iconName: keyof typeof svgIconsList) {
    const content = svgIconsList[iconName];
    if (!content) {
      throw Error(`Invalid icon name: "${iconName}"`);
    }
    this._ref.nativeElement.innerHTML = content;
  }

  constructor(private _ref: ElementRef) {}
}
