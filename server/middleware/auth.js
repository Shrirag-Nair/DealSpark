import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();


export const auth=async(req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader?.startsWith("Bearer "))return res.status(401).json({message:"Unauthorized"});
    const token =authHeader.split(" ")[1];
    try{
        const payload=jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findById(payload.userId).select(`-passwordHash`);
        if(!user) return res.status(401).json({message:"Unauthorized"});
        req.user=user;
        next();
    }catch(err){
        return res.status(401).json({message:"Invalid Token"});
    }
};

export const requireOwner=(req,res,next)=>{
    if(req.user.role !== "owner") return res.status(403).json({message:"Owner Access required"});
    next();
};