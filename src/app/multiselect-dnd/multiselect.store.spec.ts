import {TestBed} from '@angular/core/testing';
import {IMultiselectVM, MultiselectStore} from './multiselect.store';
import {MultiselectComponent} from './multiselect.component';
import {Observable} from 'rxjs';

const data = [
  'dolore possimus eos',
  'ipsum doloribus voluptatem',
  'dolores veniam perferendis',
  'fuga illo tempore',
  'eius beatae perferendis',
  'totam inventore ut',
  'expedita et ea',
  'est ut illo',
  'est aut voluptas',
  'culpa enim quia',
  'et sit fugiat',
  'vel suscipit id',
  'voluptatibus voluptates dolorum',
  'dicta necessitatibus similique',
  'sequi ut magni',
  'voluptatem non illum',
  'recusandae et possimus',
  'dolor reiciendis tempora',
  'sint cum perferendis',
  'ipsa magni omnis',
];

describe('MultiselectService', () => {
  let service: MultiselectStore;
  let vm: IMultiselectVM;

  const helpers = {
    get targetIndexes() {
      return vm.targetData.map(i => i.sourceIndex);
    },
    get targetSelectedIndexes() {
      return vm.targetData.filter(i => i.selected).map(i => i.sourceIndex);
    },
    get sourceIndexes() {
      return vm.sourceData.map(i => i.sourceIndex);
    },
    get sourceSelectedIndexes() {
      return vm.sourceData.filter(i => i.selected).map(i => i.sourceIndex);
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MultiselectComponent],
      providers: [MultiselectStore],
    });
    service = TestBed.inject(MultiselectStore);
    service.vm$.subscribe(_vm => (vm = _vm));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.vm$).toBeInstanceOf(Observable);
  });

  it('should initiate data w/o selected indexes', () => {
    service.updateData(data);
    expect(vm.sourceData.length).toBe(20);
    expect(vm.targetData.length).toBe(0);
    expect(vm.isDisabledMoveSelectedFromS2T).toBe(true);
    expect(vm.isDisabledMoveSelectedFromT2S).toBe(true);
    expect(vm.isDisabledMoveAllFromS2T).toBe(false);
    expect(vm.isDisabledMoveAllFromT2S).toBe(true);

    service.updateData(data, [0, 5, 10, 15]);
    expect(vm.sourceData.length).toBe(16);
    expect(vm.targetData.length).toBe(4);
    expect(vm.isDisabledMoveSelectedFromS2T).toBe(true);
    expect(vm.isDisabledMoveSelectedFromT2S).toBe(true);
    expect(vm.isDisabledMoveAllFromS2T).toBe(false);
    expect(vm.isDisabledMoveAllFromT2S).toBe(false);
  });

  it('should order target data', () => {
    service.updateData(data, [0, 1, 2, 3, 4]);
    expect(helpers.targetIndexes).toEqual([0, 1, 2, 3, 4]);
    service.orderTargetData(2, 3);
    expect(helpers.targetIndexes).toEqual([0, 1, 3, 2, 4]);
    service.orderTargetData(0, 4);
    expect(helpers.targetIndexes).toEqual([1, 3, 2, 4, 0]);
    service.orderTargetData(2, 0);
    expect(helpers.targetIndexes).toEqual([2, 1, 3, 4, 0]);
  });

  it('should drop from source to target', () => {
    service.updateData(data);
    service.dropItemFromSourceToTarget(7, 0);
    expect(vm.sourceData.length).toBe(19);
    expect(vm.targetData.length).toBe(1);
    expect(helpers.targetIndexes).toEqual([7]);
    service.updateData(data, [0, 1, 2, 3, 4]);
    expect(vm.sourceData.length).toBe(15);
    expect(vm.targetData.length).toBe(5);
    expect(helpers.targetIndexes).toEqual([0, 1, 2, 3, 4]);
    service.dropItemFromSourceToTarget(7, 3);
    expect(vm.sourceData.length).toBe(14);
    expect(vm.targetData.length).toBe(6);
    expect(helpers.targetIndexes).toEqual([0, 1, 2, 7, 3, 4]);
    service.dropItemFromSourceToTarget(15, 0);
    expect(vm.sourceData.length).toBe(13);
    expect(vm.targetData.length).toBe(7);
    expect(helpers.targetIndexes).toEqual([15, 0, 1, 2, 7, 3, 4]);
  });

  it('should select source item', () => {
    service.updateData(data, [0, 1, 2, 3, 4]);
    service.selectSourceItem(10);
    expect(vm.isDisabledMoveSelectedFromS2T).toBe(false);
    expect(helpers.sourceSelectedIndexes).toEqual([10]);
    service.selectSourceItem(15);
    expect(helpers.sourceSelectedIndexes).toEqual([10, 15]);
    service.selectSourceItem(10);
    expect(helpers.sourceSelectedIndexes).toEqual([15]);
    service.selectSourceItem(15);
    expect(vm.isDisabledMoveSelectedFromS2T).toBe(true);
    expect(helpers.sourceSelectedIndexes).toEqual([]);
  });

  it('should select target item', () => {
    service.updateData(data, [0, 1, 2, 3, 4]);
    service.selectTargetItem(2);
    expect(vm.isDisabledMoveSelectedFromT2S).toBe(false);
    expect(helpers.targetSelectedIndexes).toEqual([2]);
    service.selectTargetItem(3);
    expect(helpers.targetSelectedIndexes).toEqual([2, 3]);
    service.selectTargetItem(2);
    expect(helpers.targetSelectedIndexes).toEqual([3]);
    service.selectTargetItem(3);
    expect(vm.isDisabledMoveSelectedFromT2S).toBe(true);
    expect(helpers.targetSelectedIndexes).toEqual([]);
  });

  it('should move selected from source to target', () => {
    service.updateData(data, [0, 1, 2, 3, 4]);
    service.selectSourceItem(10);
    service.selectSourceItem(15);
    expect(vm.isDisabledMoveSelectedFromS2T).toBe(false);
    expect(helpers.sourceSelectedIndexes).toEqual([10, 15]);

    service.moveSelectedFromSourceToTarget();
    expect(vm.sourceData.length).toBe(13);
    expect(vm.targetData.length).toBe(7);
    const indexes = [0, 1, 2, 3, 4, 10, 15];
    expect(helpers.targetIndexes).toEqual(indexes);
    expect(vm.isDisabledMoveSelectedFromS2T).toBe(true);
    expect(helpers.sourceSelectedIndexes).toEqual([]);
  });

  it('should move selected from target to source', () => {
    service.updateData(data, [0, 1, 2, 3, 4]);
    service.selectTargetItem(2);
    service.selectTargetItem(4);
    expect(vm.isDisabledMoveSelectedFromT2S).toBe(false);
    expect(helpers.targetSelectedIndexes).toEqual([2, 4]);
    service.moveSelectedFromTargetToSource();
    expect(vm.sourceData.length).toBe(17);
    expect(vm.targetData.length).toBe(3);
    expect(helpers.targetIndexes).toEqual([0, 1, 3]);
    expect(vm.isDisabledMoveSelectedFromT2S).toBe(true);
    expect(helpers.targetSelectedIndexes).toEqual([]);
  });

  it('should move all from source to target', () => {
    service.updateData(data, [0, 1, 2, 3, 4]);
    service.moveAllFromSourceToTarget();
    expect(vm.sourceData.length).toBe(0);
    expect(vm.targetData.length).toBe(20);
  });

  it('should move all from target to source', () => {
    service.updateData(data, [0, 1, 2, 3, 4]);
    service.moveAllFromTargetToSource();
    expect(vm.sourceData.length).toBe(20);
    expect(vm.targetData.length).toBe(0);
  });

  describe('filtering', () => {
    describe('source data', () => {
      it('should work', () => {
        service.updateData([
          'dolore possimus eos',
          'ipsum doloribus voluptatem',
          'dolores veniam perferendis',
        ]);
        service.filterSourceData('');
        expect(vm.sourceData.length).toBe(3);
        service.filterSourceData('dolore');
        expect(vm.sourceData.length).toBe(2);
        service.filterSourceData('qwert!@#');
        expect(vm.sourceData.length).toBe(0);
        service.filterSourceData('');
        expect(vm.sourceData.length).toBe(3);
      });

      it('should select the correct item', () => {
        service.updateData([
          'dolore possimus eos',
          'ipsum doloribus voluptatem',
          'dolores veniam perferendis',
        ]);
        service.filterSourceData('dolore');
        service.selectSourceItem(2);
        expect(helpers.sourceSelectedIndexes).toEqual([2]);
      });

      it('should move selected from source to target', () => {
        service.updateData(data, []);
        service.filterSourceData('dolor');
        service.selectSourceItem(0);
        service.selectSourceItem(1);
        service.moveSelectedFromSourceToTarget();
        expect(vm.sourceData.length).toBe(3);
        expect(vm.targetData.length).toBe(2);
        expect(helpers.targetIndexes).toEqual([0, 1]);
      });

      it('should move all from source to target', () => {
        service.updateData(data, []);
        service.filterSourceData('dolor');
        service.moveAllFromSourceToTarget();
        expect(vm.sourceData.length).toBe(0);
        expect(vm.targetData.length).toBe(5);
        service.filterSourceData('');
        expect(vm.sourceData.length).toBe(15);
      });

      it('should drop from source to target', () => {
        service.updateData(data, [10, 11, 12, 13, 14]);
        service.filterTargetData('culpa');
        service.dropItemFromSourceToTarget(9, 0);
        expect(vm.targetData.length).toBe(1);
        expect(helpers.targetIndexes).toEqual([9]);
        service.filterTargetData('');
        expect(helpers.targetIndexes).toEqual([10, 11, 12, 13, 14, 9]);
        service.updateData(data, [10, 11, 12, 13, 14]);
        service.filterSourceData('dolor');
        service.dropItemFromSourceToTarget(0, 3);
        expect(vm.sourceData.length).toBe(3);
        expect(vm.targetData.length).toBe(6);
        expect(helpers.targetIndexes).toEqual([10, 11, 12, 0, 13, 14]);
        service.filterTargetData('dolor');
        service.dropItemFromSourceToTarget(2, 2);
        expect(vm.sourceData.length).toBe(2);
        expect(vm.targetData.length).toBe(3);
        expect(helpers.targetIndexes).toEqual([12, 0, 2]);
      });
    });

    describe('target data', () => {
      it('should work', () => {
        service.updateData([
          'dolore possimus eos',
          'ipsum doloribus voluptatem',
          'dolores veniam perferendis',
        ], [0, 1, 2]);
        service.filterTargetData('');
        expect(vm.targetData.length).toBe(3);
        service.filterTargetData('dolore');
        expect(vm.targetData.length).toBe(2);
        service.filterTargetData('qwert!@#');
        expect(vm.targetData.length).toBe(0);
        service.filterTargetData('');
        expect(vm.targetData.length).toBe(3);
      });

      it('should select the correct item', () => {
        service.updateData([
          'dolore possimus eos',
          'ipsum doloribus voluptatem',
          'dolores veniam perferendis',
        ], [0, 1, 2]);
        service.filterTargetData('dolore');
        service.selectTargetItem(2);
        expect(helpers.targetSelectedIndexes).toEqual([2]);
      });

      it('should move selected from target to source', () => {
        service.updateData(data, []);
        service.moveAllFromSourceToTarget();
        service.filterTargetData('dolor');
        service.selectTargetItem(0);
        service.selectTargetItem(1);
        service.moveSelectedFromTargetToSource();
        expect(vm.sourceData.length).toBe(2);
        expect(vm.targetData.length).toBe(3);
        expect(helpers.sourceIndexes).toEqual([0, 1]);
      });

      it('should move all from to target source', () => {
        service.updateData(data, []);
        service.moveAllFromSourceToTarget();
        service.filterTargetData('dolor');
        service.moveAllFromTargetToSource();
        expect(vm.sourceData.length).toBe(5);
        expect(vm.targetData.length).toBe(0);
        service.filterTargetData('');
        expect(vm.targetData.length).toBe(15);
      });

      it('should drop from source to target', () => {
        service.updateData(data, []);
        service.moveAllFromSourceToTarget();
        service.filterTargetData('dolor');
        expect(helpers.targetIndexes).toEqual([0, 1, 2, 12, 17]);
        service.orderTargetData(1, 3);
        expect(helpers.targetIndexes).toEqual([0, 2, 12, 1, 17]);
        service.orderTargetData(0, 4);
        expect(helpers.targetIndexes).toEqual([2, 12, 1, 17, 0]);
        service.orderTargetData(2, 0);
        expect(helpers.targetIndexes).toEqual([1, 2, 12, 17, 0]);
      });
    });
  });
});
