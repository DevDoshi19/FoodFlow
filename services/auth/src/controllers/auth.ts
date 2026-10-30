import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import tryCatch from '../middlewares/trycatch.js';
import { AuthenticatedRequest } from '../middlewares/isAuth.js';

export const loginUser = tryCatch(async(req,res)=>{
    const {email,name,picture} = req.body;
    // if (!email || !name || !picture) {
    //     return res.status(400).json({message:"Missing required fields"});
    // }

    let user = await User.findOne({email});
    if (!user) {
        user = await User.create(
            {
                email,
                name,
                image:picture
            });
        }
    const token = jwt.sign({user}, process.env.JWT_SECRET as string, {expiresIn: '15d'});
    res.status(200).json(
            { message:"User logged in successfully", 
                user,
                token
            }
    );
});

const allowedRoles = ['customer','rider','seller'] as const ;
type Role = (typeof allowedRoles)[number];

export const addUserRole = tryCatch(async(req:AuthenticatedRequest,res)=>{
    if (!req.user?._id) {
        return res.status(401).json(
            {
                message:"Unauthorized, Please login !"
            }
        );
    }

    const {role} = req.body as {role:Role};
    if (!allowedRoles.includes(role as any)) {
        return res.status(400).json({message:"Invalid role"});
    }

    // By default, Mongoose returns the document before the update was applied. Setting new: true tells Mongoose to return the freshly updated document instead.
    const user = await User.findByIdAndUpdate(req.user._id,{role},{new:true,runValidators: true}); 

    if (!user) {
        return res.status(404).json({message:"User not found"});
    }

    const token = jwt.sign({user}, process.env.JWT_SECRET as string, {expiresIn: '15d'});
    res.status(200).json(
        {
            message:"User role updated successfully",
            user,
            token
        }
    );

});

export const myProfile = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    res.json(user);
})