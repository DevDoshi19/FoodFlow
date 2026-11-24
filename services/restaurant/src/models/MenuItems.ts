import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItems extends Document{
    restaurantId: mongoose.Types.ObjectId;
    name:string;
    description:string;
    image?:string;
    price:number;
    isAvailable:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const schema = new Schema<IMenuItems>({
    restaurantId:{
        type:Schema.Types.ObjectId,
        ref:'Restaurant',
        required:true,
        index:true,
    },
    name:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    image:{
        type:String,
        required:false,
        trim:true,
    },
    price:{
        type:Number,
        required:true,
        min:0,
    },
    isAvailable:{
        type:Boolean,
        required:true,
        default:true,
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        required:true,
        default:Date.now,
    }
})