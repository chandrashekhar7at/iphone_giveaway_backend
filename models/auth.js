import mongoose from "mongoose";

const userInfoIdSchema = new mongoose.Schema({
    boxno: {
        type: String,
        required: true
    },
    detailsinfoid: {
        type: String,
        required: true
    }
}, { _id: false }); // _id: false prevents Mongoose from creating an _id for each subdocument

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    userinfoids: {
        type: [userInfoIdSchema], // Array of pairs (boxno, detailsinfoid)
        default: []
    }
}, { timestamps: true });

const usermodel = mongoose.model('user', userSchema);

export default usermodel;
