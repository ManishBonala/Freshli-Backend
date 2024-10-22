import { Router } from "express";
import { register, login, logout, loadAdmin, getAllUsers, updateUserStatus, deleteUser} from "../controllers/admin.controller";
import { validateAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", validateAdmin, logout);
router.get("/me", validateAdmin, loadAdmin);
router.get("/getUsers", validateAdmin, getAllUsers);
router.put("/updateUserStatus/:id", validateAdmin, updateUserStatus);
router.delete("/deleteUser/:id", validateAdmin, deleteUser);

export default router;