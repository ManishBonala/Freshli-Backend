import { Router } from "express";
import { validateAdmin } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { createBanner, deleteBanner, getAllBanners, updateBanner } from "../controllers/banner.controller";

const router = Router();

router.get("/", getAllBanners);
router.post("/add", validateAdmin, upload.single("image"), createBanner);
router.put("/update/:id", validateAdmin, upload.single("image"), updateBanner);
router.delete("/delete/:id", validateAdmin, deleteBanner);

export default router;