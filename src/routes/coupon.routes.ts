import { Router } from "express";
import { validateAdmin } from "../middlewares/auth.middleware";
import { createCoupon, getCoupons, getCouponById, updateCoupon, deleteCoupon, validateCoupon } from "../controllers/coupon.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post("/add", validateAdmin, upload.single("icon"), createCoupon);
router.get("/", getCoupons);
router.get("/:id", getCouponById);
router.put("/update/:id", validateAdmin, upload.single("icon"), updateCoupon);
router.delete("/delete/:id", validateAdmin, deleteCoupon);
router.post("/validate", validateCoupon);

export default router;