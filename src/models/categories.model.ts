import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

// Define the interface for the Category document
export interface ICategory extends Document {
  name: string;
  image: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new schema for the Category
const categorySchema: Schema<ICategory> = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name must not exceed 100 characters'],
  },
  image: {
    type: String,
    required: [true, 'Category image is required'],
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Category model
const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;