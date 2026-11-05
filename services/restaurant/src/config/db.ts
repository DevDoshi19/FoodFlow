import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI as string,{
            dbName : "FoodFlow",
        })
        console.log("Connected to MongoDB");

    }catch(error){
        console.log("Failed to connect to MongoDB",error);
    }
};

export default connectDB;
