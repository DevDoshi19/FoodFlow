// import dns from 'dns';

// dns.setDefaultResultOrder('ipv4first');
// dns.setServers([
//   '8.8.8.8',
//   '8.8.4.4'
// ]);

import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cors from "cors";
import uploadRoutes from "./routes/cloudinary.js";

dotenv.config();

console.log("Cloudinary configuration:", {
    cloudName: process.env.CLOUD_NAME,
    apiKeyLoaded: !!process.env.CLOUD_API_KEY,
    secretLoaded: !!process.env.CLOUD_SECRET_KEY
});

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' })); // Increase the limit to 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase the limit to 50MB

if (!process.env.CLOUD_API_KEY || !process.env.CLOUD_NAME || !process.env.CLOUD_SECRET_KEY) {
    throw new Error("Missing Cloudinary configuration in environment variables");
}

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_SECRET_KEY
});

app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5002;


app.listen(PORT,()=>{
    console.log(`Utils Service is running on port ${PORT}`);
})
