import mongoose, { Document, Schema } from "mongoose";

interface IAdmin extends Document {
  email : string;
  password: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    email:{
      type : String,
    },
    password: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


const Admin = mongoose.model<IAdmin>("Admin", adminSchema);

export default Admin;
