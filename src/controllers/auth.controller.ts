import User from "../models/user.model";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const JWT_KEY : string  = process.env.JWT_USER_KEY as string;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const google_signin = async (req: Request, res: Response) => {
    const { token } = req.body; //idToken from frontend

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (payload) {
            const { email, name } = payload;
            // Check if user already exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({message : "User not found"});
            }
            // Create JWT token
            const jwtToken = jwt.sign({ id: user._id }, JWT_KEY);
            res.status(200).json({ user, token: jwtToken });
        } else {
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

const google_signup = async (req: Request, res: Response) => {
    const { token } = req.body; //idToken from frontend

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if(payload){
            const { email, name} = payload;
    
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                //signin if the user already exists
                const jwtToken = jwt.sign({ id: existingUser._id }, JWT_KEY);
                return res.status(201).json({ user: existingUser, token: jwtToken });
            }
    
            // Create a new user
            const newUser = await User.create({ name, email});
            const jwtToken = jwt.sign({ id: newUser._id }, JWT_KEY);
    
            res.status(201).json({ user: newUser, token: jwtToken });
        }
        else{
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};


const register = async (req: Request, res: Response) => {
    const { name, phone, password } = req.body;
    console.log("req body",req.body);
    try {
        if(!name || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if(phone.length != 10){
            return res.status(400).json({message : "Enter a valid 10 digit mobile number"})
        }
        
        const user = await User.findOne({ phone });
        if(user){
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, phone, password : hashedPassword });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}

const login = async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    console.log("req body",req.body);
    
    try {
        if(!phone || !password){
            return res.status(400).json({message : "Missing Required fileds"});
        }
        const user = await User.findOne({ phone });
        if(!user){
            return res.status(400).json({message : "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            console.log("password not matched");
            
            return res.status(400).json({message : "Invalid Password"});
        }
    
        const token = jwt.sign({id : user._id}, JWT_KEY);
        console.log("token", token);
        
        res.status(200).json({user : user, token : token});
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}

const logout = async (req: Request, res: Response) => {
    console.log("Logging out user");
    const userId = req.userId;
    if(!userId){
        return res.status(401).json({message : "Unauthorized"});
    }
    res.status(200).json({ message: "Logout successful" });
}   

export { register, login, logout, google_signin, google_signup};