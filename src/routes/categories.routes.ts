import { Router } from "express";
import { validateAdmin } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/categories.controller";

const router = Router();

router.post("/add", validateAdmin, upload.single("image"), createCategory);

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.put("/update/:id", validateAdmin, upload.single("image"), updateCategory);

router.delete("/delete/:id", validateAdmin, deleteCategory);

export default router;