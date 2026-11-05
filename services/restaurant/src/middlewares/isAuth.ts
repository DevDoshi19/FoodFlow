import { Request,Response , NextFunction } from "express";
import jwt,{JwtPayload} from "jsonwebtoken";

export interface IUser {
    _id:string;
    name:string;
    email:string;
    image:string;
    role:string;
    restaurantId:string;
}

export interface AuthenticatedRequest extends Request {
    user?:IUser  ; 
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) : Promise<void> => {

    try{

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized, Please login!" });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Token not found, Please login!" });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload; // Adjust the type as needed
        if (!decoded || !decoded.user) {
            res.status(401).json({ message: "Invalid token!" });
            return;
        }
        req.user = decoded.user;
         next();
    }catch(error){
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                message: "Token expired. Please login again."
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                message: "Invalid authentication token."
            });
            return;
        }

        console.error("Authentication middleware error:", error);

        res.status(500).json({
            message: "Internal server error"
        });

    }

}

export const isSeller = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;

    if (!user || user.role !== "seller") {
        res.status(403).json({ message: "Access denied. Only sellers can perform this action." });
        return;
    }

    next();
};