import userinfomodel from "../models/userinfo.js";
import usermodel from "../models/auth.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const signup = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Check if phone number already exists
        const isPhoneExist = await usermodel.findOne({ phone });
        if (isPhoneExist) {
            return res.status(201).json({ status: false, message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user with empty userinfoids
        const newUser = new usermodel({
            phone,
            password: hashedPassword,
            userinfoids: []  // Ensuring userinfoids starts empty
        });

        // Save the new user
        const result = await newUser.save();
        if (result) {
            // Create JWT token
            const token = jwt.sign(
                { id: result._id, phone: result.phone },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION }
            );

            // Set the cookie with the JWT
            res.cookie('sessionid', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', // Secure in production
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            // Return success response
            return res.status(200).json({ 
                status: true, 
                message: "User created and signed in successfully", 
                data: { phone: result.phone, _id: result._id } 
            });
        } else {
            return res.status(201).json({ status: false, message: "User creation failed" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};



const signin = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const user = await usermodel.findOne({ phone });
        if (!user) {
            return res.status(201).json({ status: false, message: "Invalid phone number or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(201).json({ status: false, message: "Invalid phone number or password" });
        }

        const token = jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
        res.cookie('sessionid', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // true if in production, false otherwise
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
        });

        // Exclude the password field from the user object
        const { password: _, ...userWithoutPassword } = user.toObject(); 

        return res.status(200).json({ status: true, message: "Signin successful", data: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        res.cookie('sessionid', '', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // true if in production, false otherwise
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 0
        });
        return res.status(200).json({ status: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};


const saveuserinfo = async (req, res) => {
    console.log('working')
    try {
        const { userid, fullname, instaid, email, phone, boxno } = req.body;

        // Check if the user exists
        const user = await usermodel.findById(userid);
        if (!user) {
            return res.status(201).json({ status: false, message: "User not found" });
        }

        // Create a new user info document
        const newUserInfo = new userinfomodel({
            fullname,
            instaid,
            email,
            phone,
            boxno
        });
        
        // Save the new user info document
        const userInfoResult = await newUserInfo.save();
        
        // Update the user's userinfoids with the new info ID and boxno
        const userInfoId = {
            boxno,
            detailsinfoid: userInfoResult._id.toString() // Convert ObjectId to string
        };
        
        user.userinfoids.push(userInfoId);
        await user.save();
        
        // Return success response
        return res.status(200).json({
            status: true,
            message: "User info saved successfully",
            data: userInfoResult
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};
const fetchAllusers = async(req,res)=>{
    try {
        const fetcheddata = await usermodel.find({}).select('userinfoids')
        const Alldata = fetcheddata
        if(!fetcheddata){
            return res.status(201).json({status:false,message:"can not fetch data"})
        }
        return res.status(201).json({status:true,message:"All data fetched",Alldata})
    } catch (error) {
        return res.status(500).json({status:false,message:"server error",error:error.message})
    }
}
const fetchuserbyid = async(req,res)=>{
    try {
        const {userid} = req.params
        const fetcheddata = await usermodel.findById({_id:userid}).select('userinfoids')
        if(!fetcheddata){
            return res.status(201).json({status:false,message:"can not fetch data"})
        }
        return res.status(201).json({status:true,message:"All data fetched",fetcheddata})
    } catch (error) {
        return res.status(500).json({status:false,message:"server error",error:error.message})
    }
}
const fetchuserdetails = async(req,res)=>{
    console.log('first')
    try {
        const fetchdata = await userinfomodel.find({})
        if(!fetchdata){
            return res.status(201).json({status:false,message:"can not fetch data"})
        }
        return res.status(201).json({status:true,message:"All data fetched",fetchdata})
    } catch (error) {
        return res.status(201).json({status:false,message:"can not fetch data",error:error.message})
    }
}

export { fetchuserdetails,logout, saveuserinfo, signin, signup,fetchAllusers,fetchuserbyid }