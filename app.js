import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDB from "./db/dbConfig.js"
import webAuth from "./routes/authroutes.js"
import cookieParser from "cookie-parser"
import cors from "cors"

connectDB()

const app = express()
const port =  process.env.PORT || 8080 
app.use(cors({
    origin:['https://iphone-giveaway.vercel.app'],
    credentials:true
}))
app.set("trust proxy",1);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/api',webAuth)


app.listen(port,()=>{
    // console.log(`server is listening at http://localhost:${port}`)
})
