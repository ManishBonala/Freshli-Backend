import express, { Request, Response } from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import productRoutes from "./routes/product.routes";
import categoriesRoutes from './routes/categories.routes';
import couponRoutes from "./routes/coupon.routes";
import bannerRoutes from "./routes/banner.routes";

import cors from "cors";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const URI = process.env.MONGODB_URI || '';

mongoose.connect(URI)
  .then(() => console.log("DB connected\nGood to go!"))
  .catch((err) => console.error("DB connection error:", err));

app.use(cors());
app.use(express.json());

//serving the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_, res: Response) => {
  res.send("Freshli Backend");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/product", productRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/banners", bannerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});