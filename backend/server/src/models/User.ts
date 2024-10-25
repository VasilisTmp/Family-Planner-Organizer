import mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => v != null);

const UserSchema = new Schema({
  username: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  birthdate: {type: String, required: true},
});
const User = mongoose.model('User', UserSchema, 'users');

export default User;
