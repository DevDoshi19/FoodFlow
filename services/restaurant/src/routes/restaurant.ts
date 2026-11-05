import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addRestaurant, featchMyRestaurant } from "../controllers/restaurant.js";

const router = express.Router();

router.post("/new",isAuth,isSeller,addRestaurant);
router.post("/myrestaurant",isAuth,isSeller,featchMyRestaurant);

export default router;