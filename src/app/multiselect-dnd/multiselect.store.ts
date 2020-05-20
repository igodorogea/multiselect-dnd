import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {scan} from 'rxjs/operators';
import {MutationFn, updateVmFn} from './reactive-view-model';

export type MultiselectDataModel = {
  value: string;
  selected: boolean;
  hidden: boolean;
  sourceIndex: number;
};

export type MultiselectGroupModel = {
  items: MultiselectDataModel[];
  collapsed: boolean;
  index: number;
};

export interface IMultiselectVM {
  sourceData: MultiselectDataModel[];
  targetData: MultiselectDataModel[];
  targetGroups: MultiselectGroupModel[];
  searchTermSource: string;
  searchTermTarget: string;
  isDisabledMoveSelectedFromS2T: boolean;
  isDisabledMoveSelectedFromT2S: boolean;
  isDisabledMoveAllFromS2T: boolean;
  isDisabledMoveAllFromT2S: boolean;
}

interface IMultiselectVMInternal extends IMultiselectVM {
  _sourceData: MultiselectDataModel[];
  _targetData: MultiselectDataModel[];
  _targetGroups: MultiselectGroupModel[];
}

@Injectable()
export class MultiselectStore {
  private vmSubj = new ReplaySubject<MutationFn<IMultiselectVMInternal>>(1);
  public vm$: Observable<IMultiselectVM> = this.vmSubj.pipe(
    scan(updateVmFn<IMultiselectVM>(), {} as IMultiselectVM)
  );

  public updateData(data: string[], selectedIndexes?: number[]) {
    const targetData: MultiselectDataModel[] = [];
    const sourceData = data.map((value, index) => {
      const isHidden =
        Array.isArray(selectedIndexes) && selectedIndexes.includes(index);
      const item: MultiselectDataModel = {
        value,
        hidden: isHidden,
        selected: false,
        sourceIndex: index,
      };
      if (item.hidden) {
        targetData.push({...item, hidden: false});
      }
      return item;
    });
    this.vmSubj.next(vm => {
      return {
        ...vm,
        _targetGroups: [],
        ...this._updateSourceData(sourceData, vm.searchTermSource),
        ...this._updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  private _updateSourceData(
    _sourceData: MultiselectDataModel[],
    searchTerm?: string
  ): Partial<IMultiselectVMInternal> {
    const sourceData = this._filterList(_sourceData, searchTerm);
    return {
      _sourceData,
      sourceData,
      searchTermSource: searchTerm,
      isDisabledMoveSelectedFromS2T: !sourceData.some(i => i.selected),
      isDisabledMoveAllFromS2T: sourceData.length === 0,
    };
  }

  private _updateTargetData(
    _targetData: MultiselectDataModel[],
    searchTerm?: string
  ): Partial<IMultiselectVMInternal> {
    const targetData = this._filterList(_targetData, searchTerm);
    return {
      _targetData,
      targetData,
      searchTermTarget: searchTerm,
      isDisabledMoveSelectedFromT2S: !targetData.some(i => i.selected),
      isDisabledMoveAllFromT2S: targetData.length === 0,
    };
  }

  private _filterList(list: MultiselectDataModel[], searchTerm?: string) {
    return list.filter(
      item => !item.hidden && (!searchTerm || item.value.includes(searchTerm))
    );
  }

  private _updateTargetGroupsData(
    _targetGroups: MultiselectGroupModel[],
    searchTerm?: string
  ): Partial<IMultiselectVMInternal> {
    const targetGroups = searchTerm
      ? _targetGroups.map(group => ({
          ...group,
          items: this._searchInList(group.items, searchTerm),
        }))
      : _targetGroups;
    return {
      _targetGroups,
      targetGroups,
    };
  }

  private _searchInList(list: MultiselectDataModel[], term: string) {
    return list.filter(item => item.value.includes(term));
  }

  public filterSourceData(searchTerm: string) {
    this.vmSubj.next(vm => {
      return {...vm, ...this._updateSourceData(vm._sourceData, searchTerm)};
    });
  }

  public filterTargetData(searchTerm: string) {
    this.vmSubj.next(vm => {
      return {
        ...vm,
        ...this._updateTargetData(vm._targetData, searchTerm),
        ...this._updateTargetGroupsData(vm._targetGroups, searchTerm),
      };
    });
  }

  public orderTargetData(fromIndex: number, toIndex: number) {
    this.vmSubj.next(vm => {
      const fromSourceIndex = vm.targetData[fromIndex].sourceIndex;
      const toSourceIndex = vm.targetData[toIndex].sourceIndex;
      const _fromIndex = vm._targetData.findIndex(
        i => i.sourceIndex === fromSourceIndex
      );
      const _toIndex = vm._targetData.findIndex(
        i => i.sourceIndex === toSourceIndex
      );
      const targetData = vm._targetData.slice(0);
      const item = targetData.splice(_fromIndex, 1)[0];
      targetData.splice(_toIndex, 0, item);
      return {
        ...vm,
        ...this._updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  public dropItemIntoTarget(
    fromList: MultiselectDataModel[],
    fromIndex: number,
    toIndex: number
  ) {
    this.vmSubj.next(vm => {
      if (vm.sourceData === fromList) {
        return this._dropItemFromSourceToTarget(vm, fromIndex, toIndex);
      } else {
        return this._dropItemFromTargetGroupToTarget(
          vm,
          fromList,
          fromIndex,
          toIndex
        );
      }
    });
  }

  private _dropItemFromSourceToTarget(
    vm: IMultiselectVMInternal,
    fromIndex: number,
    toIndex: number
  ): IMultiselectVMInternal {
    const droppedItems: MultiselectDataModel[] = [];
    vm.sourceData.forEach(item => {
      if (item.selected || item.sourceIndex === fromIndex) {
        item.hidden = true;
        item.selected = false;
        droppedItems.push({...item, hidden: false});
      }
    });
    const targetData = this._insertItemIntoList(
      droppedItems,
      vm.targetData,
      vm._targetData,
      toIndex
    );
    return {
      ...vm,
      ...this._updateSourceData(vm._sourceData, vm.searchTermSource),
      ...this._updateTargetData(targetData, vm.searchTermTarget),
    };
  }

  private _dropItemFromTargetGroupToTarget(
    vm: IMultiselectVMInternal,
    fromGroupItems: MultiselectDataModel[],
    fromIndex: number,
    toIndex: number
  ): IMultiselectVMInternal {
    const droppedItems = fromGroupItems.filter(
      item => item.selected || item.sourceIndex === fromIndex
    );
    droppedItems.forEach(item => (item.selected = false));
    const targetGroups = vm._targetGroups.map(_group => {
      if (_group.items === fromGroupItems) {
        return {
          ..._group,
          items: _group.items.filter(item => !droppedItems.includes(item)),
        };
      }
      return _group;
    });
    const targetData = this._insertItemIntoList(
      droppedItems,
      vm.targetData,
      vm._targetData,
      toIndex
    );
    return {
      ...vm,
      ...this._updateTargetGroupsData(targetGroups, vm.searchTermTarget),
      ...this._updateTargetData(targetData, vm.searchTermTarget),
    };
  }

  private _insertItemIntoList(
    items: MultiselectDataModel[],
    list: MultiselectDataModel[],
    _list: MultiselectDataModel[],
    index: number
  ) {
    if (index > 0) {
      const toSourceIndex = list[index - 1].sourceIndex;
      const _toIndex = _list.findIndex(i => i.sourceIndex === toSourceIndex);
      index = _toIndex + 1;
    } else if (list.length > 0) {
      const toSourceIndex = list[0].sourceIndex;
      index = _list.findIndex(i => i.sourceIndex === toSourceIndex);
    } else if (_list.length > 0) {
      index = _list.length;
    }
    return [..._list.slice(0, index), ...items, ..._list.slice(index)];
  }

  public selectSourceItem(index: number) {
    this.vmSubj.next(vm => {
      return {
        ...vm,
        ...this._updateSourceData(
          this._markSelected(index, vm._sourceData),
          vm.searchTermSource
        ),
      };
    });
  }

  public selectTargetItem(index: number) {
    this.vmSubj.next(vm => {
      return {
        ...vm,
        ...this._updateTargetData(
          this._markSelected(index, vm._targetData),
          vm.searchTermTarget
        ),
      };
    });
  }

  public selectAllItemsInList(list: MultiselectDataModel[]) {
    this.vmSubj.next(vm => {
      switch (list) {
        case vm.sourceData:
          return {
            ...vm,
            ...this._updateSourceData(
              this._toggleSelectionInList(vm.sourceData, vm._sourceData),
              vm.searchTermSource
            ),
          };
        case vm.targetData:
          return {
            ...vm,
            ...this._updateTargetData(
              this._toggleSelectionInList(vm.targetData, vm._targetData),
              vm.searchTermTarget
            ),
          };
        default:
          const targetGroups = vm._targetGroups.map(_group => {
            if (_group.items === list) {
              return {
                ..._group,
                items: this._toggleSelectionInList(list, _group.items),
              };
            }
            return _group;
          });
          return {
            ...vm,
            ...this._updateTargetGroupsData(targetGroups, vm.searchTermTarget),
          };
      }
    });
  }

  private _toggleSelectionInList(list, _list) {
    const indexes = list.map(item => item.sourceIndex);
    const shouldSelect = list.some(item => !item.selected);
    return _list.map(item => {
      if (indexes.includes(item.sourceIndex)) {
        item.selected = shouldSelect;
      }
      return item;
    });
  }

  private _markSelected(index: number, list: MultiselectDataModel[]) {
    return list.map(item => {
      if (item.sourceIndex === index) {
        item.selected = !item.selected;
      }
      return item;
    });
  }

  public moveSelectedFromSourceToTarget() {
    this.vmSubj.next(vm => {
      const selectedItems: MultiselectDataModel[] = [];
      const indexes = vm.sourceData.map(i => i.sourceIndex);
      const sourceData = vm._sourceData.map(item => {
        if (item.selected && indexes.includes(item.sourceIndex)) {
          item.selected = false;
          selectedItems.push({...item});
          item.hidden = true;
        }
        return item;
      });
      const targetData = [...vm._targetData, ...selectedItems];
      return {
        ...vm,
        ...this._updateSourceData(sourceData, vm.searchTermSource),
        ...this._updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  public moveSelectedFromTargetToSource() {
    this.vmSubj.next(vm => {
      const selectedItems: number[] = [];
      const indexes = vm.targetData.map(item => item.sourceIndex);
      const targetData = vm._targetData.filter(item => {
        if (item.selected && indexes.includes(item.sourceIndex)) {
          selectedItems.push(item.sourceIndex);
          return false;
        }
        return true;
      });
      const sourceData = vm._sourceData.map(item => {
        if (selectedItems.includes(item.sourceIndex)) {
          item.hidden = false;
        }
        return item;
      });
      return {
        ...vm,
        ...this._updateSourceData(sourceData, vm.searchTermSource),
        ...this._updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  public moveAllFromSourceToTarget() {
    this.vmSubj.next(vm => {
      const selectedItems: MultiselectDataModel[] = [];
      const indexes = vm.sourceData.map(i => i.sourceIndex);
      const sourceData = vm._sourceData.map(item => {
        item.selected = false;
        if (indexes.includes(item.sourceIndex)) {
          selectedItems.push({...item});
          item.hidden = true;
        }
        return item;
      });
      const targetData = [...vm._targetData, ...selectedItems];
      return {
        ...vm,
        ...this._updateSourceData(sourceData, vm.searchTermSource),
        ...this._updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  public moveAllFromTargetToSource() {
    this.vmSubj.next(vm => {
      const selectedIndexes = vm.targetData.map(item => item.sourceIndex);
      const targetData = vm._targetData.filter(
        item => !selectedIndexes.includes(item.sourceIndex)
      );
      const sourceData = vm._sourceData.map(item => {
        if (selectedIndexes.includes(item.sourceIndex)) {
          item.hidden = false;
        }
        return item;
      });
      return {
        ...vm,
        ...this._updateSourceData(sourceData, vm.searchTermSource),
        ...this._updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  public groupSelectedTargetItems() {
    this.vmSubj.next(vm => {
      const selectedItems = vm.targetData.filter(item => item.selected);
      selectedItems.forEach(item => (item.selected = false));
      const targetData = vm._targetData.filter(
        item => !selectedItems.includes(item)
      );
      const group: MultiselectGroupModel = {
        items: selectedItems,
        collapsed: false,
        index: vm._targetGroups.length,
      };
      return {
        ...vm,
        ...this._updateTargetData(targetData, vm.searchTermTarget),
        ...this._updateTargetGroupsData(
          [...vm._targetGroups, group],
          vm.searchTermTarget
        ),
      };
    });
  }

  public selectTargetGroupItem(groupIndex: number, index: number) {
    this.vmSubj.next(vm => {
      const targetGroups = vm._targetGroups.map(group => {
        if (group.index === groupIndex) {
          return {
            ...group,
            items: this._markSelected(index, group.items),
          };
        }
        return group;
      });
      return {
        ...vm,
        ...this._updateTargetGroupsData(targetGroups, vm.searchTermTarget),
      };
    });
  }

  public orderTargetGroupData(
    groupIndex: number,
    fromIndex: number,
    toIndex: number
  ) {
    this.vmSubj.next(vm => {
      const targetGroups = vm._targetGroups.map(group => {
        if (group.index === groupIndex) {
          const items = group.items.slice(0);
          const item = items.splice(fromIndex, 1)[0];
          items.splice(toIndex, 0, item);
          return {
            ...group,
            items,
          };
        }
        return group;
      });
      return {
        ...vm,
        ...this._updateTargetGroupsData(targetGroups, vm.searchTermTarget),
      };
    });
  }

  public dropItemIntoTargetGroup(
    fromList: MultiselectDataModel[],
    groupIndex: number,
    fromIndex: number,
    toIndex: number
  ) {
    this.vmSubj.next(vm => {
      const {sourceData, targetData} = vm;
      switch (fromList) {
        case sourceData:
          return this._dropItemFromSourceIntoTargetGroup(
            vm,
            groupIndex,
            fromIndex,
            toIndex
          );
        case targetData:
          return this._dropItemFromTargetIntoTargetGroup(
            vm,
            groupIndex,
            fromIndex,
            toIndex
          );
        default:
          return this._dropItemFromTargetGroupIntoTargetGroup(
            vm,
            groupIndex,
            fromList,
            fromIndex,
            toIndex
          );
      }
    });
  }

  private _dropItemFromSourceIntoTargetGroup(
    vm: IMultiselectVMInternal,
    groupIndex: number,
    fromIndex: number,
    toIndex: number
  ): IMultiselectVMInternal {
    const droppedItems = [];
    const sourceData = vm._sourceData.map(item => {
      if (item.selected || item.sourceIndex === fromIndex) {
        item.hidden = true;
        item.selected = false;
        droppedItems.push({...item});
      }
      return item;
    });
    const targetGroups = vm._targetGroups.map(_group => {
      if (_group.index === groupIndex) {
        const group = vm.targetGroups.find(g => g.index === _group.index);
        return {
          ..._group,
          items: this._insertItemIntoList(
            droppedItems,
            group.items,
            _group.items,
            toIndex
          ),
        };
      }
      return _group;
    });
    return {
      ...vm,
      ...this._updateSourceData(sourceData, vm.searchTermSource),
      ...this._updateTargetGroupsData(targetGroups, vm.searchTermTarget),
    };
  }

  private _dropItemFromTargetIntoTargetGroup(
    vm: IMultiselectVMInternal,
    groupIndex: number,
    fromIndex: number,
    toIndex: number
  ): IMultiselectVMInternal {
    const droppedItems = [];
    const targetData = [];
    vm._targetData.forEach(item => {
      if (item.selected || item.sourceIndex === fromIndex) {
        item.selected = false;
        droppedItems.push(item);
      } else {
        targetData.push(item);
      }
    });
    const targetGroups = vm._targetGroups.map(_group => {
      if (_group.index === groupIndex) {
        const group = vm.targetGroups.find(g => g.index === _group.index);
        return {
          ..._group,
          items: this._insertItemIntoList(
            droppedItems,
            group.items,
            _group.items,
            toIndex
          ),
        };
      }
      return _group;
    });
    return {
      ...vm,
      ...this._updateTargetData(targetData, vm.searchTermTarget),
      ...this._updateTargetGroupsData(targetGroups, vm.searchTermTarget),
    };
  }

  private _dropItemFromTargetGroupIntoTargetGroup(
    vm: IMultiselectVMInternal,
    groupIndex: number,
    fromGroupItems: MultiselectDataModel[],
    fromIndex: number,
    toIndex: number
  ): IMultiselectVMInternal {
    const droppedItems = fromGroupItems.filter(
      item => item.selected || item.sourceIndex === fromIndex
    );
    const targetGroups = vm._targetGroups.map(_group => {
      if (_group.index === groupIndex) {
        const group = vm.targetGroups.find(g => g.index === _group.index);
        return {
          ..._group,
          items: this._insertItemIntoList(
            droppedItems,
            group.items,
            _group.items,
            toIndex
          ),
        };
      }
      if (_group.items === fromGroupItems) {
        return {
          ..._group,
          items: _group.items.filter(item => !droppedItems.includes(item)),
        };
      }
      return _group;
    });
    return {
      ...vm,
      ...this._updateTargetGroupsData(targetGroups, vm.searchTermTarget),
    };
  }
}
