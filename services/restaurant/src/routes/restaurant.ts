import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addRestaurant, featchMyRestaurant, updateRestaurant, updateStatusRestaurant } from "../controllers/restaurant.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new",isAuth,isSeller,uploadFile,addRestaurant);
router.get("/my",isAuth,isSeller,featchMyRestaurant);
router.put("/status",isAuth,isSeller,updateStatusRestaurant);
router.put("/edit",isAuth,isSeller,updateRestaurant);

export default router;