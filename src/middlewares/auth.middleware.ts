import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const JWT_USER_KEY : string  = process.env.JWT_USER_KEY as string;
const JWT_ADMIN_KEY : string  = process.env.JWT_ADMIN_KEY as string;

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            adminId?: string;
        }
    }
}

export const validateUser = (req : Request, res : Response, next : NextFunction) => {
    const token = req.headers.authorization;
    if(!token  || token.length <= 0){
        return res.status(401).json({message : "Unauthorized"});
    }
    jwt.verify(token, JWT_USER_KEY, (err, decoded) => {
        if(err) return res.status(401).json({message : "Unauthorized"});
        req.userId = (decoded as any).id;
        next();
    })
};

export const validateAdmin = (req : Request, res : Response, next : NextFunction) => {
    const token = req.headers.authorization;
    if(!token  || token.length <= 0){
        return res.status(401).json({message : "Unauthorized"});
    }
    jwt.verify(token, JWT_ADMIN_KEY, (err, decoded) => {
        if(err) return res.status(401).json({message : "Unauthorized"});
        req.adminId = (decoded as any).id;
        next();
    })
};
