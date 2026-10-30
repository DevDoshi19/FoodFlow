import {Request,Response,RequestHandler,NextFunction} from 'express';

const tryCatch = (handler:RequestHandler) : RequestHandler => {
    return async(req:Request,res:Response,next:NextFunction) => {
        try{
            await handler(req,res,next);
        } catch (error:unknown) {
            res.status(500).json({message:"Internal server error", error});
        }
    }
};

export default tryCatch;