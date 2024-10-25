import { Router } from "express";
import { register, login, logout, google_signup, google_signin } from "../controllers/auth.controller";
import { validateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/signin", login);
router.post("/google_signup", google_signup);
router.post("/google_signin", google_signin);
router.post("/logout", validateUser, logout);

export default router;