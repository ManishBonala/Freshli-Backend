import Banner from "../models/banner.model";
import Category from "../models/categories.model";
import { Request, Response } from "express";

export const createBanner = async(req : Request, res : Response) => {
    const { categorySlug } = req.body;
    try {
        const image = req.file ? `uploads/${req.file?.filename}` : "";

        // Find the category by slug
        const category = await Category.findOne({ slug: categorySlug });
        if (!category) {
            return res.status(400).json({message : "Category not found"});
        }

        const newBanner = new Banner({            
            category: category._id,
            bannerImage : image 
        });
        await newBanner.save();

        res.status(201).json({message : "Banner created successfully", banner : newBanner}); 
    } catch (error) {
        res.status(404).json({message : "Banner not created", error : (error as Error).message});
    }
};

export const getAllBanners = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const totalBanners = await Banner.countDocuments();
        const banners = await Banner.find()
            .populate('category', 'name slug')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(totalBanners / limit);

        res.status(200).json({
            banners,
            currentPage: page,
            totalPages,
            totalBanners
        });
    } catch (error) {
        res.status(404).json({ message: "Banner not found", error: (error as Error).message });
    }
};

export const deleteBanner = async(req:Request, res:Response) => {
    const {id} = req.params;
    try {
        await Banner.findByIdAndDelete(id);
        res.status(200).json({message : "Banner deleted successfully", id});
    } catch (error) {
        res.status(404).json({message : "Banner not found", error : (error as Error).message});
    }
};

// New function to update a banner
export const updateBanner = async(req : Request, res : Response) => {
    const { id } = req.params;
    const { categorySlug } = req.body;
    try {
        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({message : "Banner not found"});
        }

        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug });
            if (!category) {
                return res.status(400).json({message : "Category not found"});
            }
            banner.category = category._id;
        }

        if (req.file) {
            banner.bannerImage = `uploads/${req.file.filename}`;
        }

        await banner.save();

        res.status(200).json({message : "Banner updated successfully", banner}); 
    } catch (error) {
        res.status(404).json({message : "Banner not updated", error : (error as Error).message});
    }
};
