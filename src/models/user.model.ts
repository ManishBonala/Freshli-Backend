import mongoose, { Document, Schema } from "mongoose";
import { IAvatar } from "./avatar.model";
interface IUser extends Document {
  name: string;
  phone : string;
  email : string;
  password: string;
  gender : string;
  avatar : IAvatar['_id'];
  status : string;
  profilePicture: string;
  isActive: boolean; 
  lastLogin: Date; 
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    phone: {
      type: String,
    },
    email:{
      type : String,
    },
    password: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: "Avatar",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active","banned"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;