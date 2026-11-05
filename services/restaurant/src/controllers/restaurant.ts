import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js"
import tryCatch from "../middlewares/tryCatch.js"
import Restaurant, { IRestaurant } from "../models/Restaurant.js";

export const addRestaurant = tryCatch(async (req:AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json(
            { 
                message: "Unauthorized, Please login!" 
            }
        );
    }

    const existingRestaurant = await Restaurant.findOne({ownerId:user._id});
    if (existingRestaurant) {
        return res.status(400).json({
            message: "You already have a restaurant!"
        });
    }

    const {name,description,lantitude,longitude,formattedAddress,phone} = req.body;
    if (!name || !lantitude || !longitude || !formattedAddress || !phone) {
        return res.status(400).json({
            message: "Missing required fields!"
        });
    }

    const file = req.file;
    if (!file){
        return res.status(400).json({
            message: "Missing file (Image) !"
        });
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "Failed to create file buffer !!"
        });
    }

    const {data:uploadResult} = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/upload`,
                                {
                                    buffer:fileBuffer.content,
                                }                          
                            )

    const restaurant = await Restaurant.create({
        name,
        description,
        phone,
        image:uploadResult.url,
        ownerId:user._id,
        autoLocation:{
            type:"Point",
            coordinates:[Number(longitude),Number(lantitude)],
            formattedAddress:formattedAddress
        }

    });

    return res.status(201).json({
        message:"Restaurant created successfully!",
        restaurant
    });
                        
});

export const featchMyRestaurant = tryCatch(async (req:AuthenticatedRequest,res)=>{

    const user = req.user;
    if (!user){
        return res.status(401).json(
            {
                message: "Unauthorized, Please login!" 
            }
        );
    };
    const restaurant = await Restaurant.findOne({ownerId:user._id});
    if (!restaurant){
        return res.status(404).json({
            message:"Restaurant not found!"
        })
    };

    if (!user.restaurantId )

    return res.status(200).json({
        message:"Restaurant fetched successfully!",
        restaurant
    });
});
