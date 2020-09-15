import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  uuid: { type: String },
  firstname: { type: String, required: [true, 'we need to kwon who you are'] },
  lastname: { type: String, required: [true, 'we need to kwon who you are'] },
  email: { type: String, required: [true, 'we need to kwon who you are'] },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

export const User = mongoose.model('User', UserSchema, 'users');
