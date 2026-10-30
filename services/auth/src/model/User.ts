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


// SDE takeaway: Keep your application data types conceptually separate from database-specific document behavior when possible.

// | Type | What it describes |
// |---|---|
// | `IUser` | The shape of user data |
// | `Schema<IUser>` | A Mongoose schema configured for that data shape |

// Think of it this way:
// - IUser describes what the data looks like.
// - Schema describes how Mongoose should handle that data structure.

// | Concept | Your code | Purpose |
// |---|---|---|
// | Interface | `IUser` | Describes the data shape |
// | Schema | `schema` | Defines fields, validation, defaults, and other document behavior |
// | Model | `User` | Provides an API to create, query, update, and delete documents |