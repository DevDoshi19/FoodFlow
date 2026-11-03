import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
    try{
        const {buffer} = req.body;
        const cloud = await cloudinary.v2.uploader.upload(buffer);

        res.json({
            url: cloud.secure_url,
        })
        
    }catch(err){
        console.error("Error uploading to Cloudinary:", err);
        res.status(500).json({ error: "Failed to upload image" });
    }
});

export default router;