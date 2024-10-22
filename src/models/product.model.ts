import mongoose, { Document, Schema } from "mongoose";
import { ICategory } from "./categories.model"; 

// Type definitions
type UnitType = "piece" | "gm" | "kg" | "ml" | "ltr" | "kl";
type DiscountType = "fixed" | "percentage";

// Interface for the Product model
interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string; 
  category: ICategory['_id']; // Reference to Category
  units: UnitType;
  stock: number;
  discount: number;
  discountType: DiscountType;
  isPopular: boolean;
}

// Mongoose Schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default : ""
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    units: {
        type: String,
        enum : ["piece", "gm", "kg", "ml", "ltr", "kl"],
        required: true,
    },
    discount : {
        type : Number,
        default : 0
    },
    discountType:{
        type : String,
        enum : ["fixed","percentage"],
        default : "percentage"
    },
    stock: {
      type : Number,
      required : true
    },
    isPopular : {
        type : Boolean, 
        default : false
    }
  },
  {
    timestamps: true,
  }
);

// Create and export the Product model
const Product = mongoose.model<IProduct>("Product", productSchema); 

export default Product;
