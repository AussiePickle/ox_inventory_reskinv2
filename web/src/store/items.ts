import { ItemData } from '../typings/item';

export const Items: {
  [key: string]: ItemData | undefined;
} = {
  water: {
    name: 'water',
    close: false,
    label: 'Water',
    stack: true,
    usable: true,
    count: 0,
  },
  burger: {
    name: 'burger',
    close: false,
    label: 'Burger',
    stack: false,
    usable: false,
    count: 0,
  },
  backwoods: {
    name: 'backwoods',
    close: false,
    label: 'Russian Cream',
    stack: true,
    usable: false,
    count: 0,
  },
};
