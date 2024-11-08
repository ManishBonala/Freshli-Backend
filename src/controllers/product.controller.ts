import { Request, Response } from "express";
import Product from "../models/product.model";
import Category from "../models/categories.model";

interface QueryParams {
  category?: string;
  searchParm?: string;
  searchParam?: string;
  page?: string; // These will be strings as they come from the query string
  limit?: string;
  offset?: string;
  filters?: string;
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      categorySlug,
      units,
      stock,
      discount,
      discountType,
      isPopular,
    } = req.body;
    if (!name || !price || !categorySlug || !units || !stock) {
      return res
        .status(400)
        .json({ message: "Some required fields are missing" });
    }

    // Find the category by slug
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    const ProductExists = await Product.findOne({
      name,
      category: category._id,
    }).populate("category", "name");
    if (ProductExists) {
      return res
        .status(400)
        .json({
          message:
            "Product already exists in this category. Please update it if you want.",
        });
    }

    const image = req.file ? `uploads/${req.file.filename}` : "";
    const newProduct = await Product.create({
      name,
      description,
      price,
      image,
      category: category._id,
      units,
      discount,
      discountType,
      isPopular,
      stock,
    });
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res
      .status(404)
      .json({
        message: "Product not created",
        error: (error as Error).message,
      });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate(
      "category",
      "name slug"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Product not found", error: (error as Error).message });
  }
};

export const getPopularProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isPopular: true }).populate(
      "category",
      "name slug"
    );
    res.status(200).json({ products });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Products not found", error: (error as Error).message });
  }
};

export const getAllProducts = async (
  req: Request<{}, {}, {}, QueryParams>,
  res: Response
) => {
  try {
    const {
      category: categorySlug,
      searchParm,
      page = "1",
      limit = "10",
    } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const query: any = {};
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      }
    }
    if (searchParm) {
      query.$or = [{ name: { $regex: new RegExp(searchParm, "i") } }];
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    const filters = {
      category: categorySlug ? categorySlug : "All",
    };

    res
      .status(200)
      .json({
        products,
        totalPages,
        totalProducts,
        page: pageNumber,
        limit: limitNumber,
        filters,
      });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Products not found", error: (error as Error).message });
  }
};

export const getClientProducts = async (
  req: Request<{}, {}, {}, QueryParams>,
  res: Response
) => {
  try {
    const {
      filters,
      searchParam,
      limit = "5",
      offset = "0",
    } = req.query;

    const query: any = {};

    console.log(req.query.filters);
    
    
    // Parse filters if they exist
    if (filters) {
      const parsedFilters = JSON.parse(filters as string);
      
      // Category filter
      if (parsedFilters.category) {
        const category = await Category.findOne({ slug: parsedFilters.category });
        if (category) {
          query.category = category._id;
        }
      }
      
      // Price filter
      if (parsedFilters.price) {
        console.log("parsedFilters.price",parsedFilters.price);
        const priceString = (parsedFilters.price as string).replace(/\$/g, "");
        console.log("priceString",priceString);
        
        if (priceString.endsWith('+')) {
          // Handle cases like "$200+"
          const minPrice = parseInt(priceString.replace('+', ''));
          query.price = { $gte: minPrice };
        } else if (priceString.includes('-')) {
          // Handle range cases like "$100-$200"
          const [min, max] = priceString.split('-');
          query.price = { $gte: parseInt(min), $lte: parseInt(max) };
        }
      }
      
      // Rating filter
      if (parsedFilters.rating) {
        query.rating = { $gte: parseInt(parsedFilters.rating) };
      }
      
      // Discount filter
      if (parsedFilters.discount) {
        query.discount = { $gte: parseInt(parsedFilters.discount) };
      }
    }

    // Search parameter
    if (searchParam) {
      query.$or = [{ name: { $regex: new RegExp(searchParam, "i") } }];
    }

    console.log("query",query);
    

    const products = await Product.find(query)
      .populate("category", "name slug")
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const totalCount = await Product.countDocuments(query);
    res.status(200).json({ products, totalCount });
  } catch (error) {
    res.status(404).json({ 
      message: "Products not found", 
      error: (error as Error).message 
    });
  }
};

// export const getClientProducts = async (
//   req: Request<{}, {}, {}, QueryParams>,
//   res: Response
// ) => {
//   try {
//     const {
//       category: categorySlug,
//       searchParam,
//       limit = "5",
//       offset = "0",
//     } = req.query;
//     const query: any = {};

//     console.log(req.query);
    
//     if (categorySlug) {
//       const category = await Category.findOne({ slug: categorySlug });
//       if (category) {
//         query.category = category._id;
//       }
//     }
//     if (searchParam) {
//       query.$or = [{ name: { $regex: new RegExp(searchParam, "i") } }];
//     }
//     const products = await Product.find(query)
//       .populate("category", "name slug")
//       .skip(parseInt(offset))
//       .limit(parseInt(limit));

//     const totalCount = await Product.countDocuments(query);
//     res
//       .status(200)
//       .json({
//         products,
//         totalCount,
//       });
//   } catch (error) {
//     res
//       .status(404)
//       .json({ message: "Products not found", error: (error as Error).message });
//   }
// };

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    categorySlug,
    units,
    stock,
    discount,
    discountType,
    isPopular,
  } = req.body;
  let image = req.body.image;
  try {
    if (!image) {
      image = `uploads/${req.file?.filename}`;
    }

    // Find the category by slug
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category: category._id,
        units,
        stock,
        discount,
        discountType,
        image,
        isPopular,
      },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product updated successfully", product: product });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Product not found", error: (error as Error).message });
  }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting product: " + error.message });
  }
};