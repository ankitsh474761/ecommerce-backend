import mongoose from "mongoose";
import colors from "colors"
import dotenv from "dotenv"
dotenv.config();

export const connectDb = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected to MongoDb database ${conn.connection.host}`.bgMagenta.white);
    }catch(err){
        console.log(`error in mongodb${err}`.bgRed.white);
        throw err;
    }
}