import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import {SvgIconRegistry} from './svg-icon.registry';

@Component({
  selector: 'app-svg-icon[svgIcon]',
  template: '',
  styleUrls: ['./svg-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SvgIconComponent {
  @HostBinding('class') class = 'svg-icon';
  @Input()
  set svgIcon(iconName: string) {
    this._ref.nativeElement.innerHTML = this._iconRegistry.getSvgIcon(iconName);
  }

  constructor(
    private _ref: ElementRef,
    private _iconRegistry: SvgIconRegistry
  ) {}
}
