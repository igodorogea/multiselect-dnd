import {moduleMetadata} from '@storybook/angular';
import {array, text, withKnobs} from '@storybook/addon-knobs';
import {MultiselectComponent} from './multiselect.component';
import {MultiselectDndModule} from './multiselect-dnd.module';

declare const faker: any;

export default {
  title: 'Multiselect',
  decorators: [
    withKnobs,
    moduleMetadata({
      imports: [MultiselectDndModule],
    }),
  ],
};

const items: string[] = Array.from({length: 20}, faker.lorem.words);
export const basic = () => ({
  component: MultiselectComponent,
  props: {
    sourceData: array('sourceData', items),
    sourceLabel: text('sourceLabel', 'Available sub-units'),
    targetLabel: text('targetLabel', 'Selected sub-units'),
  },
});

export const withInitialSelectedItems = () => ({
  component: MultiselectComponent,
  props: {
    sourceData: array('sourceData', items),
    initialSelectedIndexes: array('initialSelectedIndexes', ['0', '1', '2'])
      .filter(Boolean)
      .map(Number),
    sourceLabel: text('sourceLabel', 'Available sub-units'),
    targetLabel: text('targetLabel', 'Selected sub-units'),
  },
});
