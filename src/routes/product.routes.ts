import { Router } from "express";
import { validateUser, validateAdmin } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import {createProduct, deleteProduct, getAllProducts, getClientProducts, getPopularProducts, getProductById, updateProduct} from "../controllers/product.controller";

const router = Router();

router.post("/add", validateAdmin, upload.single("image"), createProduct);

router.get("/", getAllProducts);
router.get("/client/all", getClientProducts);
router.get("/popular", getPopularProducts);
router.get("/single/:id", getProductById);

router.put("/update/:id", validateAdmin, upload.single("image"), updateProduct);

router.delete("/delete/:id", validateAdmin, deleteProduct);

export default router;