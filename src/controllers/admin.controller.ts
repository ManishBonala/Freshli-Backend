import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/admin.model";
import User from "../models/user.model";

dotenv.config();

const JWT_ADMIN_KEY : string  = process.env.JWT_ADMIN_KEY as string;

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await Admin.create({email, password: hashedPassword });
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const jwtToken = jwt.sign({ id: admin._id }, JWT_ADMIN_KEY, { expiresIn: '1h' });
    res.status(200).json({ admin, token: jwtToken });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response) => {
    const userId = req.adminId;
    if(!userId){
        return res.status(401).json({message : "Unauthorized"});
    }
    res.status(200).json({ message: "Logout successful" });
};

export const loadAdmin = async (req: Request, res: Response) => {
  const adminId = req.adminId;
  try {
    const admin = await Admin.findById(adminId);
    res.status(200).json({admin : admin});
  } 
  catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
      // Ensure that query parameters are parsed as numbers, with fallback defaults
      const page: number = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const searchParam: string = req.query.query ? (req.query.query as string) : '';
  
      const skip = (page - 1) * limit;
      let query: { name?: { $regex: RegExp } } = {}; // Optional query object
      if (searchParam.length > 0) {
        query.name = { $regex: new RegExp(`^${searchParam}`, 'i') }; // Case-insensitive regex
      }
  
      // Fetch users with pagination, search, and sorting
      const users = await User.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ registeredAt: -1 });
        
      const totalUsers = await User.countDocuments(); // Total number of users in the database
      const filteredUsers = searchParam.length > 0 ? users.length : totalUsers;
      const totalPages = Math.ceil(filteredUsers / limit);
  
      // Return response with users and pagination details
      res.status(200).json({
        users,
        filteredUsers,
        totalUsers,
        totalPages,
        page,
      });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
};

export const updateUserStatus = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        const user = await User.findById(id);
        if(!user){
            return res.status(401).json({message : "User not found"});
        }
        user.status = status;
        await user.save();
        res.status(200).json({ message: 'User Status Updated', user: user });
    } catch (error : any) {
        res.status(404).json({ error: error?.message });
    }
}

export const deleteUser = async(req:Request, res: Response) =>{
    try {
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(401).json({message : "User not found"});
        }
        return res.status(201).json({message: "user deleted succesfully",user : user})
    } catch (error : any) {
        res.status(404).json({ error: error?.message });
    }
}