import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
dns.setServers([
  '8.8.8.8',
  '8.8.4.4'
]);

import express from 'express';
import dotenv from "dotenv";
import connectDB from './config/db.js';
import restaurantRoute from './routes/restaurant.js';
import cors from 'cors';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001 ;

app.use(express.json());
app.use(cors());

app.use("/api/restaurant" ,restaurantRoute)
app.listen(PORT, () => {
  console.log(`Restaurant Service is running on port ${PORT}`);
  connectDB();
});