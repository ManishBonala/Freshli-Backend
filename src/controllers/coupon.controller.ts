import { Request, Response } from 'express';
import Coupon from '../models/coupon.model';

// Create a new coupon
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const couponData = {...req.body};

    if(couponData.termsAndConditions){
      couponData.termsAndConditions = JSON.parse(couponData.termsAndConditions);
    }

    if(req.file){
      couponData.icon = `uploads/${req.file.filename}`;
    }
    const coupon = new Coupon(couponData);
    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    res.status(400).json({ message: "Coupon not created", error: (error as Error).message });
  }
};

// Get all coupons
export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1, 
      limit = 10,
      minDiscount,
      maxDiscount,
      minPurchaseAmount
    } = req.query;

    // Prepare the query
    let query = Coupon.find();

    // Apply search if provided
    if (search) {
      query = query.or([
        { code: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') }
      ]);
    }

    // Apply discount range filter
    if (minDiscount) {
      query = query.where('discountValue').gte(Number(minDiscount));
    }
    if (maxDiscount) {
      query = query.where('discountValue').lte(Number(maxDiscount));
    }

    // Apply minimum purchase amount filter
    if (minPurchaseAmount) {
      query = query.where('minPurchaseAmount').gte(Number(minPurchaseAmount));
    }

    // Apply sorting
    if (sortBy === 'discountValue') {
      query = query.sort({ discountValue: sortOrder === 'asc' ? 1 : -1 });
    } else if (sortBy === 'expiryDate') {
      query = query.sort({ expiryDate: sortOrder === 'asc' ? 1 : -1 });
    } else if (sortBy === 'minPurchaseAmount') {
      query = query.sort({ minPurchaseAmount: sortOrder === 'asc' ? 1 : -1 });
    } else {
      query = query.sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 });
    }

    // Count total documents for pagination
    const total = await Coupon.countDocuments(query);

    // Apply pagination
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    query = query.skip((pageNumber - 1) * limitNumber).limit(limitNumber);

    // Execute query
    const coupons = await query.exec();

    res.status(200).json({
      message: "Coupons fetched successfully",
      coupons,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Coupons not fetched", error: (error as Error).message });
  }
};

// Get a single coupon by ID
export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404).json({ message: "Coupon not found" });
      return;
    }
    res.status(200).json({ message: "Coupon fetched successfully", coupon });
  } catch (error) {
    res.status(400).json({ message: "Coupon not fetched", error: (error as Error).message });
  }
};

// Update a coupon
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const couponData = {...req.body};

    if(couponData.termsAndConditions){
      couponData.termsAndConditions = JSON.parse(couponData.termsAndConditions);
    }

    if(req.file){
      couponData.icon = `uploads/${req.file.filename}`;
    }
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, couponData);
    if (!coupon) {
      res.status(404).json({ message: "Coupon not found" });
      return;
    }
    res.status(200).json({ message: "Coupon updated successfully", coupon });
  } catch (error) {
    res.status(400).json({ message: "Coupon not updated", error: (error as Error).message });
  }
};

// Delete a coupon
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404).json({ message: "Coupon not found" });
      return;
    }
    res.status(200).json({ message: "Coupon deleted successfully", data: {} });
  } catch (error) {
    res.status(400).json({ message: "Coupon not deleted", error: (error as Error).message });
  }
};

// Validate a coupon code
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, purchaseAmount } = req.body;

    const coupon = await Coupon.findOne({ code, active: true });
    if (!coupon) {
      res.status(400).json({ message: "Invalid or expired coupon" });
      return;
    }

    if (coupon.minPurchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
      res.status(400).json({ message: `Minimum purchase amount is $${coupon.minPurchaseAmount}` });
      return;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (purchaseAmount * coupon.discountValue) / 100;
      if (coupon.discountCap && discountAmount > coupon.discountCap) {
        discountAmount = coupon.discountCap;
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ message: "Coupon usage limit reached" });
      return;
    }

    // Increment the usedCount
    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).json({ message: "Coupon validated successfully", discount: coupon.discountValue, discountAmount });
  } catch (error) {
    res.status(400).json({ message: "Coupon not validated", error: (error as Error).message });
  }
};
