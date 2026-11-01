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
import cors from "cors";

dotenv.config();

const app = express();
app.use((req, res, next) => {
    res.setHeader(
        "Cross-Origin-Opener-Policy",
        "same-origin-allow-popups"
    );

    next();
});
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());

app.use("/api/auth",authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Auth service is running on port ${PORT}`);
    connectDB();
})
