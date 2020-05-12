import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {MultiselectDataModel, MultiselectStore} from './multiselect.store';
import {SvgIconRegistry} from '../svg-icon/svg-icon.registry';

const arrowForwardIcon = require('!raw-loader!./arrow_forward_ios-24px.svg');
const doubleArrowIcon = require('!raw-loader!./double_arrow-24px.svg');

@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [MultiselectStore],
})
export class MultiselectComponent implements OnInit, OnChanges {
  @HostBinding('class') class = 'multiselect-dnd';
  @Input() sourceLabel: string;
  @Input() targetLabel: string;
  @Input() sourceData: string[];
  @Input() initialSelectedIndexes: number[];
  @Output() update = new EventEmitter<any[]>();

  public vm$ = this._store.vm$;

  constructor(
    private _store: MultiselectStore,
    private _iconRegistry: SvgIconRegistry
  ) {
    _iconRegistry.addSvgIcon(
      'arrow_forward',
      arrowForwardIcon.default || arrowForwardIcon
    );
    _iconRegistry.addSvgIcon(
      'double_arrow',
      doubleArrowIcon.default || doubleArrowIcon
    );
  }

  public ngOnInit() {
    this._store.updateData(this.sourceData, this.initialSelectedIndexes);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.sourceData || changes.initialSelectedIndexes) {
      this._store.updateData(this.sourceData, this.initialSelectedIndexes);
    }
  }

  public filterSourceData(searchTerm: string) {
    this._store.filterSourceData(searchTerm);
  }

  public filterTargetData(searchTerm: string) {
    this._store.filterTargetData(searchTerm);
  }

  public selectSourceItem(index: number, event: MouseEvent) {
    console.log(event);
    this._store.selectSourceItem(index);
  }

  public selectTargetItem(index: number, event: MouseEvent) {
    console.log(event);
    this._store.selectTargetItem(index);
  }

  public drop(event: CdkDragDrop<MultiselectDataModel[]>) {
    console.log(event);
    if (event.previousContainer === event.container) {
      if (event.currentIndex !== event.previousIndex) {
        this._store.orderTargetData(event.previousIndex, event.currentIndex);
      }
    } else {
      this._store.dropItemFromSourceToTarget(
        event.item.data,
        event.currentIndex
      );
    }
  }

  public moveSelectedFromSourceToTarget() {
    this._store.moveSelectedFromSourceToTarget();
  }

  public moveSelectedFromTargetToSource() {
    this._store.moveSelectedFromTargetToSource();
  }

  public moveAllFromSourceToTarget() {
    this._store.moveAllFromSourceToTarget();
  }

  public moveAllFromTargetToSource() {
    this._store.moveAllFromTargetToSource();
  }
}
