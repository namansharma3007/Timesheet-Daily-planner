import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

userSchema.methods['comparePassword'] = async function (
  this: IUser,
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

// Never send passwordHash in JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret['passwordHash'];
    delete ret['__v'];
    return ret;
  },
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
