import mongoose from "mongoose";

const connectDB = async () => {

    try{

        const conn = await mongoose.connect(process.env.MONGO_URI as string ,{
            dbName:"FoodFlow",
        });

        console.log("connected to mongoDB")

    }catch(error){
        console.log(error)
    }

}

export default connectDB;