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

export interface IMultiselectVM {
  sourceData: MultiselectDataModel[];
  targetData: MultiselectDataModel[];
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
        targetData.push({...item});
      }
      return item;
    });
    this.vmSubj.next(vm => {
      return {
        ...vm,
        ...this.updateSourceData(sourceData, vm.searchTermSource),
        ...this.updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  private updateSourceData(
    _sourceData: MultiselectDataModel[],
    searchTerm?: string
  ): Partial<IMultiselectVMInternal> {
    const sourceData = _sourceData.filter(
      item => !item.hidden && (!searchTerm || item.value.includes(searchTerm))
    );
    return {
      _sourceData,
      sourceData,
      searchTermSource: searchTerm,
      isDisabledMoveSelectedFromS2T: !sourceData.some(i => i.selected),
      isDisabledMoveAllFromS2T: sourceData.length === 0,
    };
  }

  private updateTargetData(
    _targetData: MultiselectDataModel[],
    searchTerm?: string
  ): Partial<IMultiselectVMInternal> {
    const targetData = searchTerm
      ? _targetData.filter(item => item.value.includes(searchTerm))
      : _targetData;
    return {
      _targetData,
      targetData,
      searchTermTarget: searchTerm,
      isDisabledMoveSelectedFromT2S: !targetData.some(i => i.selected),
      isDisabledMoveAllFromT2S: targetData.length === 0,
    };
  }

  public filterSourceData(searchTerm: string) {
    this.vmSubj.next(vm => {
      return {...vm, ...this.updateSourceData(vm._sourceData, searchTerm)};
    });
  }

  public filterTargetData(searchTerm: string) {
    this.vmSubj.next(vm => {
      return {...vm, ...this.updateTargetData(vm._targetData, searchTerm)};
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
        ...this.updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  public dropItemFromSourceToTarget(fromIndex: number, toIndex: number) {
    this.vmSubj.next(vm => {
      const sourceData = vm._sourceData.map(item => {
        if (item.sourceIndex === fromIndex) {
          item.hidden = true;
          item.selected = false;
        }
        return item;
      });
      const droppedItem = vm._sourceData[fromIndex];
      if (toIndex > 0) {
        const toSourceIndex = vm.targetData[toIndex - 1].sourceIndex;
        const _toIndex = vm._targetData.findIndex(
          i => i.sourceIndex === toSourceIndex
        );
        toIndex = _toIndex + 1;
      } else if (vm.targetData.length > 0) {
        const toSourceIndex = vm.targetData[0].sourceIndex;
        toIndex = vm._targetData.findIndex(
          i => i.sourceIndex === toSourceIndex
        );
      } else if (vm._targetData.length > 0) {
        toIndex = vm._targetData.length;
      }
      const targetData = [
        ...vm._targetData.slice(0, toIndex),
        {...droppedItem},
        ...vm._targetData.slice(toIndex),
      ];
      return {
        ...vm,
        ...this.updateSourceData(sourceData, vm.searchTermSource),
        ...this.updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  public selectSourceItem(index: number) {
    this.vmSubj.next(vm => {
      return {
        ...vm,
        ...this.updateSourceData(
          this.markSelected(index, vm._sourceData),
          vm.searchTermSource
        ),
      };
    });
  }

  public selectTargetItem(index: number) {
    this.vmSubj.next(vm => {
      return {
        ...vm,
        ...this.updateTargetData(
          this.markSelected(index, vm._targetData),
          vm.searchTermTarget
        ),
      };
    });
  }

  private markSelected(index: number, list: MultiselectDataModel[]) {
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
      const sourceData = vm._sourceData.map(item => {
        if (item.selected) {
          item.hidden = true;
          item.selected = false;
          selectedItems.push({...item});
        }
        return item;
      });
      const targetData = [...vm._targetData, ...selectedItems];
      return {
        ...vm,
        ...this.updateSourceData(sourceData, vm.searchTermSource),
        ...this.updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  public moveSelectedFromTargetToSource() {
    this.vmSubj.next(vm => {
      const selectedItems: number[] = [];
      const targetData = vm._targetData.filter(t => {
        if (t.selected) {
          selectedItems.push(t.sourceIndex);
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
        ...this.updateSourceData(sourceData, vm.searchTermSource),
        ...this.updateTargetData(targetData, vm.searchTermTarget),
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
          item.hidden = true;
          selectedItems.push({...item});
        }
        return item;
      });
      const targetData = [...vm._targetData, ...selectedItems];
      return {
        ...vm,
        ...this.updateSourceData(sourceData, vm.searchTermSource),
        ...this.updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }

  public moveAllFromTargetToSource() {
    this.vmSubj.next(vm => {
      const targetSourceIndexes = vm.targetData.map(item => item.sourceIndex);
      const targetData = vm._targetData.filter(
        item => !targetSourceIndexes.includes(item.sourceIndex)
      );
      const sourceData = vm._sourceData.map(item => {
        if (targetSourceIndexes.includes(item.sourceIndex)) {
          item.hidden = false;
        }
        return item;
      });
      return {
        ...vm,
        ...this.updateSourceData(sourceData, vm.searchTermSource),
        ...this.updateTargetData(targetData, vm.searchTermTarget),
      };
    });
  }
}
