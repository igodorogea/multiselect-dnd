import {Injectable, OnDestroy} from '@angular/core';

@Injectable({providedIn: 'root'})
export class SvgIconRegistry implements OnDestroy {
  private _svgIcons = new Map<string, string>();

  public ngOnDestroy(): void {
    this._svgIcons.clear();
  }

  addSvgIcon(iconName: string, svgContent: string): void {
    this._svgIcons.set(iconName, svgContent);
  }

  getSvgIcon(iconName: string): string {
    if (!this._svgIcons.has(iconName)) {
      throw Error(`Invalid icon name: "${iconName}"`);
    }
    return this._svgIcons.get(iconName);
  }
}
