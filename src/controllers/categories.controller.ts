import { Request, Response } from "express";
import Category from "../models/categories.model";
import slugify from 'slugify';

// CREATE a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : "";
    
    // Check if category already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Generate slug
    const slug = slugify(name, { lower: true, strict: true });

    // Create a new category
    const newCategory = await Category.create({
      name,
      image,
      slug
    });

    res.status(201).json(newCategory);
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: "Error creating category", error: error.message });
  }
};

// GET all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({createdAt : -1});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// GET a single category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

// UPDATE a category by ID
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, image } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if(!image){
      category.image = `uploads/${req.file?.filename}`;
    }
    else{
      category.image = image;
    }

    // Update category details
    category.name = name || category.name;
    category.slug = slugify(name, { lower: true, strict: true });

    await category.save();
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

// DELETE a category by ID
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};
