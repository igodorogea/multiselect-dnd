import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {CdkDragDrop, CdkDragStart} from '@angular/cdk/drag-drop';
import {
  MultiselectDataModel,
  MultiselectGroupModel,
  MultiselectStore,
} from './multiselect.store';
import {SvgIconRegistry} from '../svg-icon/svg-icon.registry';
import {animate, state, style, transition, trigger} from '@angular/animations';

const arrowForwardIcon = require('!raw-loader!./icons/arrow_forward_ios-24px.svg');
const doubleArrowIcon = require('!raw-loader!./icons/double_arrow-24px.svg');
const foldIcon = require('!raw-loader!./icons/shrink2.svg');
const unfoldIcon = require('!raw-loader!./icons/enlarge2.svg');

@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [MultiselectStore],
  animations: [
    trigger('targetGroupExpansion', [
      state('collapsed, void', style({height: '0px', visibility: 'hidden'})),
      state('expanded', style({height: '*', visibility: 'visible'})),
      transition('expanded <=> collapsed, void => collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ])
  ]
})
export class MultiselectComponent implements OnInit, OnChanges {
  @HostBinding('class') class = 'multiselect-dnd';
  @Input() sourceLabel: string;
  @Input() targetLabel: string;
  @Input() sourceData: string[];
  @Input() initialSelectedIndexes: number[];
  @Output() update = new EventEmitter<any[]>();
  @ContentChild('targetItemTemplate') targetItemTemplate: TemplateRef<any>;
  @ContentChild('targetGroupItemTemplate') targetGroupItemTemplate: TemplateRef<any>;

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
    _iconRegistry.addSvgIcon('fold', foldIcon.default || foldIcon);
    _iconRegistry.addSvgIcon('unfold', unfoldIcon.default || unfoldIcon);
  }

  public ngOnInit() {
    this._store.updateData(this.sourceData, this.initialSelectedIndexes);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.sourceData || changes.initialSelectedIndexes) {
      this._store.updateData(this.sourceData, this.initialSelectedIndexes);
    }
  }

  public dragStarted(
    event: CdkDragStart,
    list: MultiselectDataModel[],
    item: MultiselectDataModel,
    previewCountRef: HTMLDivElement
  ) {
    const count = list.filter(i => i.selected && i !== item).length + 1;
    if (count > 1) {
      const previewClass = ['msb-drag-preview'];
      if (count === 2) {
        previewClass.push('msb-dragging-2');
      }
      if (count >= 3) {
        previewClass.push('msb-dragging-3');
      }
      event.source._dragRef.previewClass = previewClass;
      previewCountRef.innerHTML = `${count}`;
      const sub = event.source.ended.subscribe(() => {
        event.source._dragRef.previewClass = undefined;
        previewCountRef.innerHTML = '';
        sub.unsubscribe();
      });
    }
  }

  public trackByGroupIndex(index: number, group: MultiselectGroupModel) {
    return group.index;
  }

  public trackBySourceIndex(index: number, item: MultiselectDataModel) {
    return item.sourceIndex;
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
    this._store.selectTargetItem(index);
  }

  public selectTargetGroupItem(
    groupIndex: number,
    index: number,
    event: MouseEvent
  ) {
    this._store.selectTargetGroupItem(groupIndex, index);
  }

  public dropGroup(
    groupIndex: number,
    event: CdkDragDrop<MultiselectDataModel[]>
  ) {
    console.log(event);
    if (event.previousContainer === event.container) {
      if (event.currentIndex !== event.previousIndex) {
        this._store.orderTargetGroupData(
          groupIndex,
          event.previousIndex,
          event.currentIndex
        );
      }
    } else {
      this._store.dropItemIntoTargetGroup(
        event.previousContainer.data,
        groupIndex,
        event.item.data,
        event.currentIndex
      );
    }
  }

  public drop(event: CdkDragDrop<MultiselectDataModel[]>) {
    console.log(event);
    if (event.previousContainer === event.container) {
      if (event.currentIndex !== event.previousIndex) {
        this._store.orderTargetData(event.previousIndex, event.currentIndex);
      }
    } else {
      this._store.dropItemIntoTarget(
        event.previousContainer.data,
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

  public groupSelectedTargetItems() {
    this._store.groupSelectedTargetItems();
  }

  public removeTargetGroup(group: MultiselectGroupModel) {
    this._store.removeTargetGroup(group);
  }

  public selectAllItemsInList(
    event: KeyboardEvent,
    list: MultiselectDataModel[]
  ) {
    this._store.selectAllItemsInList(list);
    event.preventDefault();
  }

  public toggleTargetGroup(group: MultiselectGroupModel) {
    this._store.toggleTargetGroup(group);
  }
}
