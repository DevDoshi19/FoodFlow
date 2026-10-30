import mongoose, { Schema, Document } from 'mongoose';

// define the shape of the user document
export interface IUser extends Document {
    name:string;
    email:string;
    image:string;
    role:string | null;
}

// Define the fields,validation rules, and options for the user schema
// The schema defines the structure of the user documents in the MongoDB collection
const schema : Schema<IUser> = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    image:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:null
    }
},{
    timestamps:true
})

// Create a Mongoose model for the user schema
// provide an API to create, query, update, and delete user documents in the MongoDB collection
const User = mongoose.model<IUser>('User', schema);
export default User;