import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  instaid: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: 'abc@gmail.com'
  },
  phone: {
    type: String,
    trim: true,
    default: '0'
  },
  winner:{
    type:Boolean,
    default:false
  },
  boxno:{
    type:String,
    required:true
  }
}, { timestamps: true });

const userinfomodel = mongoose.model('userinfos', userSchema);

export default userinfomodel;
