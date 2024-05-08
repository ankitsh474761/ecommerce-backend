import express from "express";
import dotenv from "dotenv";
import colors from "colors"
import { connectDb } from "./config/db.js";
import morgan from "morgan";
import authRoutes from './routes/authRoute.js';
import cors from "cors"
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import mongoose from "mongoose";


dotenv.config();

// rest object
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static('public'));


// routes
app.use('/api/v1/auth',authRoutes);

app.use('/api/v1/category',categoryRoutes);
app.use('/api/v1/products',productRoutes);



// rest api
app.get('/',(req,res)=>{
    res.send({
        message:"Welcome to ecommerce app"
    })
})


const port = process.env.PORT || 4000;
connectDb().then(()=>{
app.listen(port, () => {
  console.log(
    `server running on development mode on port ${port}`.bgCyan.white
  );
});
})


