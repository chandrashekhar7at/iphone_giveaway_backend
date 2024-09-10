import express from "express"
import { getAllUtrValues, getUtrValuesById, logout, saveuserinfo, signin, signup, updateinfoid } from "../controller/authController.js"
import authenticate from "../middleware/checkAuth.js"
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/signup',signup)
router.post('/signin',signin)
router.get('/checkUserAuth',(req,res)=>{
    try {
        const token = req.cookies.sessionid;

        if (!token) {
            return res.status(201).json({status:false,message:'1not a valid user'})
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(201).json({status:false,message:'2not a valid user'})
            }
            
            req.user = decoded;
            return res.status(201).json({status:true,message:'valid user'})
        });
    } catch (error) {
        return res.status(201).json({status:false,message:'3not a valid user'})
    }
})
router.get('/checkpoint',(req,res)=>{
    res.status(201).json({status:true,message:'ok'})    
})

router.post('/logout',authenticate,logout)

// save user info boxes

router.post('/saveuserinfo/:id',saveuserinfo)
router.post('/getAllUtrValues',getAllUtrValues)
router.post('/getUtrValuesbyid/:id',getUtrValuesById)
router.post('/updateinfoid/:id',updateinfoid)

export default router