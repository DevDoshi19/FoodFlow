import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
dns.setServers([
  '8.8.8.8',
  '8.8.4.4'
]);

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/auth",authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Auth service is running on port ${PORT}`);
    connectDB();
})
