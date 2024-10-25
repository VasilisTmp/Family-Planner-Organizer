import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: {type: String, required: true},
  adminId: {type: String, required: true},
  members: [
    {
      userId: {type: String, required: true},
      nickname: {type: String, required: true},
      color: {type: String, required: true},
      originalname: {type: Boolean, default: true},
      birthdate: {type: String, required: true},
      lastRead: {type: String, default: ''},
    },
  ],
  events: [
    {
      userId: {type: String, required: true},
      title: {type: String, required: true},
      date: {type: String, required: true},
      repeat: {type: Boolean, required: true},
      every: {type: Number, required: true},
      everyType: {
        type: String,
        enum: ['d', 'w', 'm', ''],
        required: true,
      },
      on: {type: String, required: true},
      until: {type: String, required: true},
      monthDay: {type: Number, required: true},
      timeFrom: {type: String, required: true},
      timeTo: {type: String, required: true},
      todo: {type: Boolean, required: true},
      forId: {type: String, required: true},
      done: {type: Boolean, default: false},
      notifications: {type: Boolean, required: true},
    },
  ],
  items: [
    {
      userId: {type: String, required: true},
      name: {type: String, required: true},
      purchased: {type: Boolean, default: false},
      image: {type: String, required: true},
    },
  ],
  meals: [
    {
      userId: {type: String, required: true},
      name: {type: String, required: true},
      type: {
        type: String,
        enum: ['Breakfast', 'Brunch', 'Lunch', 'Dinner'],
        required: true,
      },
      day: {
        type: String,
        enum: [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        required: true,
      },
      image: {type: String, required: true},
    },
  ],
  albums: [
    {
      userId: {type: String, required: true},
      name: {type: String, required: true},
    },
  ],
  photos: [
    {
      userId: {type: String, required: true},
      image: {type: String, required: true},
      album: {type: String, required: true},
    },
  ],
  notes: [
    {
      userId: {type: String, required: true},
      title: {type: String, required: true},
      text: {type: String, required: true},
      pinned: {type: Boolean, required: true},
    },
  ],
  messages: [
    {
      userId: {type: String, required: true},
      text: {type: String, required: true},
      date: {type: Date, required: true},
    },
  ],
});

const Group = mongoose.model('Group', GroupSchema, 'groups');

export default Group;
