import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxListModule, DxSortableModule, DxTreeViewModule } from 'devextreme-angular';
import { DxMultiselectDndComponent } from './dx-multiselect-dnd/dx-multiselect-dnd.component';
import { RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';
import { DxMultiselectDndListComponent } from './dx-multiselect-dnd-list/dx-multiselect-dnd-list.component';

@NgModule({
  declarations: [DxMultiselectDndComponent, DxMultiselectDndListComponent],
  imports: [
    CommonModule,
    DxTreeViewModule,
    DxSortableModule,
    DxListModule,
    RouterModule.forChild([
      {
        path: 'tree',
        component: DxMultiselectDndComponent,
      },
      {
        path: 'list',
        component: DxMultiselectDndListComponent,
      },
      {
        path: '',
        redirectTo: 'tree',
      },
    ]),
  ],
})
export class DxMultiselectDndModule {
  constructor() {
    // Add lazy loaded css
    if (environment.production) {
      const element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = 'devextreme.css';
      document.body.appendChild(element);
      // const element2 = document.createElement('link');
      // element2.rel = 'stylesheet';
      // element2.href = 'devextreme-light-compact.css';
      // document.body.appendChild(element2);
    } else {
      const element = document.createElement('script');
      element.src = 'devextreme.js';
      document.body.appendChild(element);
      // const element2 = document.createElement('script');
      // element2.src = 'devextreme-light-compact.js';
      // document.body.appendChild(element2);
    }
  }
}
