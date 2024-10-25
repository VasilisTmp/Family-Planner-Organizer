export interface groupEventsType {
  _id: string;
  userId: string;
  title: string;
  date: string;
  repeat: boolean;
  every: number;
  everyType: string;
  on: string;
  until: string;
  timeFrom: string;
  timeTo: string;
  todo: boolean;
  forId: string;
  done: boolean;
  notifications: boolean;
}

export interface groupNotesType {
  _id: string;
  userId: string;
  title: string;
  text: string;
  pinned: boolean;
}

export interface groupAlbumsType {
  _id: string;
  userId: string;
  name: string;
}

export interface groupPhotosType {
  _id: string;
  userId: string;
  image: string;
  album: string;
}

export interface groupMealsType {
  _id: string;
  userId: string;
  name: string;
  type: string;
  day: string;
  image: string;
}

export interface groupItemsType {
  _id: string;
  userId: string;
  name: string;
  purchased: boolean;
  image: string;
}

export interface userGroupsType {
  _id: string;
  name: string;
  adminId: string;
}

export interface groupMembersType {
  userId: string;
  nickname: string;
  color: string;
  originalname: boolean;
  birthdate: string;
  lastRead: string;
}

export interface groupMessagesType {
  _id: string;
  userId: string;
  text: string;
  date: Date;
}

export const mealTypes = ['Breakfast', 'Brunch', 'Lunch', 'Dinner'];
