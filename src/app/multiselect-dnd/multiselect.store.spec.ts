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
    get targetGroupIndexes() {
      return vm.targetGroups[0].items.map(i => i.sourceIndex);
    },
    get targetGroupSelectedIndexes() {
      return vm.targetGroups[0].items
        .filter(i => i.selected)
        .map(i => i.sourceIndex);
    },
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
    service.dropItemIntoTarget(vm.sourceData, 7, 0);
    expect(vm.sourceData.length).toBe(19);
    expect(helpers.targetIndexes).toEqual([7]);
    service.updateData(data, [0, 1, 2, 3, 4]);
    expect(vm.sourceData.length).toBe(15);
    expect(helpers.targetIndexes).toEqual([0, 1, 2, 3, 4]);
    service.dropItemIntoTarget(vm.sourceData, 7, 3);
    expect(vm.sourceData.length).toBe(14);
    expect(vm.targetData.length).toBe(6);
    expect(helpers.targetIndexes).toEqual([0, 1, 2, 7, 3, 4]);
    service.dropItemIntoTarget(vm.sourceData, 15, 0);
    expect(vm.sourceData.length).toBe(13);
    expect(vm.targetData.length).toBe(7);
    expect(helpers.targetIndexes).toEqual([15, 0, 1, 2, 7, 3, 4]);
    service.updateData(data);
    service.selectSourceItem(4);
    service.selectSourceItem(5);
    service.dropItemIntoTarget(vm.sourceData, 7, 0);
    expect(vm.sourceData.length).toBe(17);
    expect(helpers.targetIndexes).toEqual([4, 5, 7]);
    service.selectSourceItem(0);
    service.selectSourceItem(1);
    service.dropItemIntoTarget(vm.sourceData, 3, 2);
    expect(vm.sourceData.length).toBe(14);
    expect(helpers.targetIndexes).toEqual([4, 5, 0, 1, 3, 7]);
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

  it('should select all in list', () => {
    service.updateData(data, [0, 1, 2, 3, 4]);
    service.selectAllItemsInList(vm.sourceData);
    expect(helpers.sourceSelectedIndexes.length).toBe(15);
    service.selectAllItemsInList(vm.sourceData);
    expect(helpers.sourceSelectedIndexes.length).toBe(0);
    service.selectAllItemsInList(vm.targetData);
    expect(helpers.targetSelectedIndexes.length).toBe(5);
    service.selectAllItemsInList(vm.targetData);
    expect(helpers.targetSelectedIndexes.length).toBe(0);
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

      it('should select all in list', () => {
        service.updateData(data);
        service.filterSourceData('dolor');
        service.selectAllItemsInList(vm.sourceData);
        service.filterSourceData('');
        expect(helpers.sourceSelectedIndexes.length).toBe(5);
      });

      it('should move selected from source to target', () => {
        service.updateData(data, []);
        service.selectSourceItem(0);
        service.selectSourceItem(1);
        service.selectSourceItem(10);
        expect(helpers.sourceSelectedIndexes.length).toBe(3);
        service.filterSourceData('dolor');
        expect(helpers.sourceSelectedIndexes.length).toBe(2);
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
        service.dropItemIntoTarget(vm.sourceData, 9, 0);
        expect(vm.targetData.length).toBe(1);
        expect(helpers.targetIndexes).toEqual([9]);
        service.filterTargetData('');
        expect(helpers.targetIndexes).toEqual([10, 11, 12, 13, 14, 9]);
        service.updateData(data, [10, 11, 12, 13, 14]);
        service.filterSourceData('dolor');
        service.dropItemIntoTarget(vm.sourceData, 0, 3);
        expect(vm.sourceData.length).toBe(3);
        expect(vm.targetData.length).toBe(6);
        expect(helpers.targetIndexes).toEqual([10, 11, 12, 0, 13, 14]);
        service.filterTargetData('dolor');
        service.dropItemIntoTarget(vm.sourceData, 2, 2);
        expect(vm.sourceData.length).toBe(2);
        expect(vm.targetData.length).toBe(3);
        expect(helpers.targetIndexes).toEqual([12, 0, 2]);
        service.updateData(data, [3, 4]);
        service.filterTargetData('');
        service.selectAllItemsInList(vm.sourceData);
        service.filterSourceData('dolor');
        service.dropItemIntoTarget(vm.sourceData, 0, 1);
        expect(vm.sourceData.length).toBe(0);
        expect(helpers.targetIndexes).toEqual([3, 0, 1, 2, 12, 17, 4]);
      });
    });

    describe('target data', () => {
      it('should work', () => {
        service.updateData(
          [
            'dolore possimus eos',
            'ipsum doloribus voluptatem',
            'dolores veniam perferendis',
          ],
          [0, 1, 2]
        );
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
        service.updateData(
          [
            'dolore possimus eos',
            'ipsum doloribus voluptatem',
            'dolores veniam perferendis',
          ],
          [0, 1, 2]
        );
        service.filterTargetData('dolore');
        service.selectTargetItem(2);
        expect(helpers.targetSelectedIndexes).toEqual([2]);
      });

      it('should select all in list', () => {
        service.updateData(data);
        service.moveAllFromSourceToTarget();
        service.filterTargetData('dolor');
        service.selectAllItemsInList(vm.targetData);
        service.filterSourceData('');
        expect(helpers.targetSelectedIndexes.length).toBe(5);
      });

      it('should move selected from target to source', () => {
        service.updateData(data, []);
        service.moveAllFromSourceToTarget();
        service.selectTargetItem(0);
        service.selectTargetItem(1);
        service.selectTargetItem(10);
        expect(helpers.targetSelectedIndexes.length).toBe(3);
        service.filterTargetData('dolor');
        expect(helpers.targetSelectedIndexes.length).toBe(2);
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

      it('should order target items', () => {
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

  describe('grouping', () => {
    beforeEach(() => {
      service.updateData(data, [0, 1, 2, 3, 4]);
      service.selectTargetItem(0);
      service.selectTargetItem(1);
      service.selectTargetItem(2);
      service.groupSelectedTargetItems();
    });

    it('should group selected target items', () => {
      expect(helpers.targetSelectedIndexes.length).toBe(0);
      expect(helpers.targetIndexes.length).toBe(2);
      expect(vm.targetGroups.length).toBe(1);
      expect(helpers.targetGroupIndexes).toEqual([0, 1, 2]);
    });

    it('should select item', () => {
      service.selectTargetGroupItem(0, 1);
      expect(
        vm.targetGroups[0].items.filter(i => i.selected).map(i => i.sourceIndex)
      ).toEqual([1]);
    });

    it('should select all in list', () => {
      service.selectAllItemsInList(vm.targetGroups[0].items);
      expect(vm.targetGroups[0].items.filter(i => i.selected).length).toBe(3);
    });

    it('should order target group data', () => {
      service.orderTargetGroupData(0, 2, 0);
      expect(helpers.targetGroupIndexes).toEqual([2, 0, 1]);
      service.orderTargetGroupData(0, 0, 2);
      expect(helpers.targetGroupIndexes).toEqual([0, 1, 2]);
    });

    it('should drop item into target group', () => {
      expect(vm.targetGroups[0].items.length).toBe(3);
      service.dropItemIntoTargetGroup(vm.sourceData, 0, 5, 1);
      expect(vm.targetGroups[0].items.length).toBe(4);
      expect(vm.sourceData.length).toBe(14);
      expect(helpers.targetGroupIndexes).toEqual([0, 5, 1, 2]);
      service.dropItemIntoTargetGroup(vm.targetData, 0, 4, 2);
      expect(vm.targetGroups[0].items.length).toBe(5);
      expect(vm.targetData.length).toBe(1);
      expect(helpers.targetGroupIndexes).toEqual([0, 5, 4, 1, 2]);
      service.selectTargetItem(3);
      service.groupSelectedTargetItems();
      expect(vm.targetGroups.length).toBe(2);
      expect(vm.targetGroups[1].items.length).toBe(1);
      service.dropItemIntoTargetGroup(vm.targetGroups[0].items, 1, 5, 1);
      expect(vm.targetGroups[0].items.length).toBe(4);
      expect(vm.targetGroups[1].items.length).toBe(2);
      expect(helpers.targetGroupIndexes).toEqual([0, 4, 1, 2]);
      expect(vm.targetGroups[1].items.map(i => i.sourceIndex)).toEqual([3, 5]);
    });

    it('should drop from target group to target', () => {
      expect(vm.targetGroups[0].items.length).toBe(3);
      service.selectTargetGroupItem(0, 0);
      service.dropItemIntoTarget(vm.targetGroups[0].items, 1, 1);
      expect(vm.targetGroups[0].items.length).toBe(1);
      expect(helpers.targetIndexes).toEqual([3, 0, 1, 4]);
      expect(helpers.targetSelectedIndexes.length).toBe(0);
    });

    it('should drop selected items into target group', () => {
      expect(helpers.targetGroupIndexes).toEqual([0, 1, 2]);
      service.selectSourceItem(10);
      service.selectSourceItem(11);
      service.dropItemIntoTargetGroup(vm.sourceData, 0, 15, 2);
      expect(helpers.targetGroupIndexes).toEqual([0, 1, 10, 11, 15, 2]);
      expect(helpers.targetGroupSelectedIndexes.length).toBe(0);
    });

    it('should filter target groups', () => {
      service.selectTargetItem(3);
      service.selectTargetItem(4);
      service.groupSelectedTargetItems();
      expect(vm.targetGroups[0].items.length).toBe(3);
      expect(vm.targetGroups[1].items.length).toBe(2);
      service.filterTargetData('dolor');
      expect(vm.targetGroups[0].items.length).toBe(3);
      expect(vm.targetGroups[1].items.length).toBe(0);
      service.filterTargetData('!@#qweer');
      expect(vm.targetGroups[0].items.length).toBe(0);
      expect(vm.targetGroups[1].items.length).toBe(0);
      service.filterTargetData('');
      expect(vm.targetGroups[0].items.length).toBe(3);
      expect(vm.targetGroups[1].items.length).toBe(2);
    });
  });
});
