import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    phone:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    userinfoid:{
        type:String,
        trim:true,
        default:null
    }
},{timestamps:true})

const usermodel = mongoose.model('user',userSchema)

export default usermodel
