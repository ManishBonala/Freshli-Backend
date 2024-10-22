import mongoose, { Schema, Document } from 'mongoose';

interface ICoupon extends Document {
  name: string;
  icon: string;
  description1: string;
  description2: string;
  code: string;
  discountType: string;
  discountValue: number;
  minPurchaseAmount: number;
  discountCap: number;
  startDate: Date;
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  termsAndConditions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description1: {
    type: String,
    required: true,
    trim: true
  },
  description2: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'], // Can be 'percentage' or 'fixed' amount
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minPurchaseAmount: {
    type: Number,
    default: 0 // Minimum purchase amount to apply the coupon
  },
  discountCap: {
    type: Number,
    default: null // Optional: Maximum discount that can be applied
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    // required: true,
    default: function() {
      const now = new Date();
      return new Date(now.setMonth(now.getMonth() + 24));
    }
  },
  usageLimit: {
    type: Number,
    default: null // Optional: Limit on the number of times this coupon can be used
  },
  usedCount: {
    type: Number,
    default: 0 // Tracks how many times the coupon has been used
  },
  termsAndConditions: {
    type: [String],
    default: [] // Array of terms and conditions
  },
  active: {
    type: Boolean,
    default: true // Coupon is active or inactive
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

couponSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);

export default Coupon;