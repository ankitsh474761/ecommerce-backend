import JWT from "jsonwebtoken"
import User from "../models/userModel.js"

// protected routes token base

export const requireSignIn = async(req,res,next)=>{
    try{
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    )
    // console.log(req.user);   undefined
    req.user = decode;
    next()
    }catch(error){
        console.log(error)
    }
}


export const isAdmin = async(req,res,next)=>{
    try{
        const user = await User.findById(req.user._id)
        if(user.role !==1 ){
            return res.status(401).send({
                success:false,
                message:"Unauthorized Access",
            })
        }else{
            next()
        }
    }catch(err){
        console.log(err)
        res.status(401).send({
            success:false,
            err,
            message:"error in admin middleware"
        })
    }

}