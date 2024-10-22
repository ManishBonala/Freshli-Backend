import { Router } from "express";
import { validateUser, validateAdmin } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import {createProduct, deleteProduct, getAllProducts, getProductById, updateProduct} from "../controllers/product.controller";

const router = Router();

router.post("/add", validateAdmin, upload.single("image"), createProduct);

router.get("/:id", getProductById);
router.get("/", getAllProducts);

router.put("/update/:id", validateAdmin, upload.single("image"), updateProduct);

router.delete("/delete/:id", validateAdmin, deleteProduct);

export default router;