import { Router } from "express";
import { getUser } from "../controllers/user.controller";
import { validateUser } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getUser", validateUser, getUser);

export default router;