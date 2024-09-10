import userinfomodel from "../models/userinfo.js";
import usermodel from "../models/auth.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const signup = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const isPhoneExist = await usermodel.findOne({ phone });
        if (isPhoneExist) {
            return res.status(201).json({ status: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new usermodel({ phone, password: hashedPassword });
        const result = await newUser.save();
        if (result) {
            const token = jwt.sign(
                { id: result._id, phone: result.phone },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION }
            );

            res.cookie('sessionid', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', // true if in production, false otherwise
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
            });
            
            return res.status(201).json({ status: true, message: "User created and signed in successfully", data: { phone: result.phone, _id: result._id } });
        } else {
            return res.status(500).json({ status: false, message: "User creation failed" });
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
            return res.status(400).json({ status: false, message: "Invalid phone number or password" });
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


const updateinfoid = async (req, res) => {
    try {
        const { id } = req.params; // Extract the user ID from the request parameters
        const { infoid } = req.body; // Extract the infoid from the request body

        // Find the user by their ID and update the infoid field
        const updatedUser = await usermodel.findByIdAndUpdate(
            id, // The user ID to search for
            { userinfoid: infoid }, // The new infoid to set
            { new: true } // Return the updated document
        ).select('-password'); // Exclude the password field

        if (!updatedUser) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Return the updated user data in the response
        return res.status(200).json({ status: true, message: "User infoid updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};


const logout = async (req, res) => {
    try {
        res.cookie('sessionid', '', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 0 
        });
        return res.status(200).json({ status: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};

const saveuserinfo = async (req, res) => {
    try {
        const { formData, boxId, id } = req.body;
        const { fullname, instaId, email, phone, utr } = formData; // Extract utr from formData

        // Validate required fields
        if (!id || !fullname || !instaId) {
            return res.status(400).json({ status: false, message: 'ID, fullname, and Instagram ID are required' });
        }

        // Find existing user by ID
        const existingUser = await userinfomodel.findOne({ userid: id });

        if (existingUser) {
            // Update existing user details
            existingUser.fullname = fullname;
            existingUser.instaid = instaId;
            existingUser.email = email || existingUser.email;

            // Handle utr field
            if (utr) {
                // Ensure utr is an array and push new UTR values (convert if it's a single value)
                const utrValues = Array.isArray(utr) ? utr : [utr];

                if (!Array.isArray(existingUser.utr)) {
                    existingUser.utr = [];
                }

                // Merge new utr values, avoiding duplicates
                const newUtr = [...new Set([...existingUser.utr, ...utrValues])];
                existingUser.utr = newUtr;
            }

            // Handle boxId separately if provided
            if (boxId && !existingUser.utr.includes(boxId)) {
                existingUser.utr.push(boxId);
            }

            // Save updated user
            await existingUser.save();
            return res.status(200).json({ status: true, message: 'User updated successfully', user: existingUser });
        } else {
            // Create a new user
            const newUser = new userinfomodel({
                userid: id,
                fullname,
                instaid: instaId,
                email: email || 'default@example.com',
                utr: utr ? (Array.isArray(utr) ? utr : [utr]) : (boxId ? [boxId] : []), // Initialize utr as an array
            });

            // Save the new user
            await newUser.save();
            return res.status(201).json({ status: true, message: 'User created successfully', user: newUser });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error: error.message });
    }
};



const getAllUtrValues = async (req, res) => {
    try {
        const utrValues = await userinfomodel.aggregate([
            { $unwind: '$utr' },
            { $group: { _id: '$utr' } },
            { $project: { _id: 0, utr: '$_id' } }
        ]);

        res.status(200).json({ status: true, message: "All UTR values found", utrValues });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error: error.message });
    }
};


const getUtrValuesById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: false, message: 'User ID is required' });
        }

        const user = await userinfomodel.findById(id, 'utr');

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        return res.status(200).json({ status: true, utrValues: user.utr });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server error', error: error.message });
    }
};

export { getAllUtrValues, getUtrValuesById, logout, saveuserinfo, signin, signup, updateinfoid }
