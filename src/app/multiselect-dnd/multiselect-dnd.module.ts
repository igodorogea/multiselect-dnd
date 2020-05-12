import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MultiselectComponent} from './multiselect.component';
import {MultiselectSearchComponent} from './search/multiselect-search.component';
import {SvgIconModule} from '../svg-icon/svg-icon.module';

@NgModule({
  declarations: [MultiselectComponent, MultiselectSearchComponent],
  imports: [CommonModule, DragDropModule, ScrollingModule, SvgIconModule],
  exports: [MultiselectComponent],
})
export class MultiselectDndModule {}
