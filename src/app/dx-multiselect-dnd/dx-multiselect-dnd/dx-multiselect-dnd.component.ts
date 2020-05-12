import { Component } from '@angular/core';
import { DxMultiselectDndService, Employee } from './dx-multiselect-dnd.service';

@Component({
  selector: 'app-dx-multiselect-dnd',
  templateUrl: './dx-multiselect-dnd.component.html',
  styleUrls: ['./dx-multiselect-dnd.component.scss'],
  providers: [DxMultiselectDndService],
})
export class DxMultiselectDndComponent {
  employees: Employee[];

  constructor(service: DxMultiselectDndService) {
    this.employees = service.getEmployees();
  }

  onDragChange(e) {
    const nodes = e.element.querySelectorAll('.dx-treeview-node');
    if (
      nodes[e.toIndex].closest(
        `[data-item-id="${nodes[e.fromIndex].getAttribute('data-item-id')}"]`
      )
    ) {
      e.cancel = true;
    }
  }

  onReorder(e) {
    const employees = this.employees.slice();
    const nodes = e.element.querySelectorAll('.dx-treeview-node');
    const sourceId = nodes[e.fromIndex].getAttribute('data-item-id');
    const sourceIndex = employees.findIndex(item => item.ID === +sourceId);
    const sourceData = employees[sourceIndex];
    const targetId = nodes[e.toIndex].getAttribute('data-item-id');
    const targetIndex = employees.findIndex(item => item.ID === +targetId);
    const targetData = employees[targetIndex];

    if (e.dropInsideItem) {
      sourceData.Head_ID = targetData.ID;
    } else {
      sourceData.Head_ID = targetData.Head_ID;
      employees.splice(sourceIndex, 1);
      employees.splice(targetIndex, 0, sourceData);
    }
    this.employees = employees;
  }
}
