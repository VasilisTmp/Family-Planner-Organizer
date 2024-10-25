import {groupEventsType, groupMealsType} from './types';

export const weekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const emptyMeals = {
  sunday: [] as groupMealsType[],
  monday: [] as groupMealsType[],
  tuesday: [] as groupMealsType[],
  wednesday: [] as groupMealsType[],
  thursday: [] as groupMealsType[],
  friday: [] as groupMealsType[],
  saturday: [] as groupMealsType[],
};

export const emptyEvent: groupEventsType = {
  _id: '',
  userId: '',
  title: '',
  date: '',
  repeat: false,
  every: 1,
  everyType: 'w',
  on: '',
  until: '',
  timeFrom: '',
  timeTo: '',
  todo: false,
  forId: '',
  done: false,
  notifications: false,
};
