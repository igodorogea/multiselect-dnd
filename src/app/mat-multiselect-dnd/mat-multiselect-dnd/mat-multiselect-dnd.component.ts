import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

declare const faker: any;

@Component({
  selector: 'app-mat-multiselect-dnd',
  templateUrl: './mat-multiselect-dnd.component.html',
  styleUrls: ['./mat-multiselect-dnd.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMultiselectDndComponent implements OnInit {
  items: string[];
  initialSelectedIndexes: number[];

  ngOnInit() {
    this.updateItems();
    this.updateSelectedItems();
  }

  updateList(data: any[]) {
    console.log(data);
  }

  updateItems() {
    this.items = Array.from({ length: 10000 }, faker.lorem.words);
  }

  updateSelectedItems() {
    const newList = [];
    Array.from({
      length: Math.floor(Math.random() * 10) + 100,
    }).forEach(() => {
      while (true) {
        const index = Math.floor(Math.random() * 9999);
        if (!newList.includes(index)) {
          newList.push(index);
          return;
        }
      }
    });
    this.initialSelectedIndexes = newList;
  }
}
