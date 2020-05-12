import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMultiselectDndComponent } from './mat-multiselect-dnd/mat-multiselect-dnd.component';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MultiselectComponent } from './multiselect/multiselect.component';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { MultiselectSearchComponent } from './multiselect/search/multiselect-search.component';

@NgModule({
  declarations: [
    MatMultiselectDndComponent,
    MultiselectComponent,
    SvgIconComponent,
    MultiselectSearchComponent,
  ],
  imports: [
    CommonModule,
    DragDropModule,
    ScrollingModule,
    RouterModule.forChild([
      {
        path: '',
        component: MatMultiselectDndComponent,
      },
    ]),
  ],
})
export class MatMultiselectDndModule {}
