import mongoose, { Document, Schema } from "mongoose";
import { ICategory } from "./categories.model";

interface IBanner extends Document {
  bannerImage: string;
  category : ICategory['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    bannerImage: {
      type: String,
      required: true,
    },
    category: { 
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model<IBanner>("Banner", bannerSchema);

export default Banner;