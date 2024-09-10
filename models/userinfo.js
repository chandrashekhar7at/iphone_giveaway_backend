import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true
  },
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
  utr: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const userinfomodel = mongoose.model('userinfos', userSchema);

export default userinfomodel;
