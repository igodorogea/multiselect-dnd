import { Component } from '@angular/core';
import { DxMultiselectDndListService, Task } from './dx-multiselect-dnd-list.service';

@Component({
  selector: 'app-dx-multiselect-dnd-list',
  templateUrl: './dx-multiselect-dnd-list.component.html',
  styleUrls: ['./dx-multiselect-dnd-list.component.scss'],
  providers: [DxMultiselectDndListService],
})
export class DxMultiselectDndListComponent {
  doingTasks: Task[];
  plannedTasks: Task[];

  constructor(service: DxMultiselectDndListService) {
    this.doingTasks = service.getDoingTasks();
    this.plannedTasks = service.getPlannedTasks();
  }

  onDragStart(e) {
    e.itemData = e.fromData[e.fromIndex];
  }

  onAdd(e) {
    e.toData.splice(e.toIndex, 0, e.itemData);
  }

  onRemove(e) {
    e.fromData.splice(e.fromIndex, 1);
  }
}
