import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import User from "../models/userModel.js";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";

export const registerController = async(req,res)=>{
    try{
        const {name,email,password,phone,address,answer} = req.body;
        // validations
        if(!name){
            return res.send({message:"Name is Required"})
        }
         if (!email) {
           return res.send({ message: "Email is Required" });
         }
          if (!password) {
            return res.send({ message: "Password is Required" });
          }
           if (!phone) {
             return res.send({ message: "Phone is Required" });
           }
            if (!address) {
              return res.send({ message: "Address is Required" });
            }

            // check user
            const existingUser = await User.findOne({email : email});
            // existing user
            if(existingUser){
                return res.status(200).send({
                    success:false,
                    message: "Already Register Please Login"
                })
            }

            // REgister user
            const hashedPassword = await hashPassword(password);
            // save
            const user = await new User({name,email,phone,address,password:hashedPassword,answer}).save()
            res.status(201).send({
                success:true,
                message:"User Registered Successfully",
                user 
            })
    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:"error in registration",
            error
        });
    }
}


// POSt LOGIN 
export const loginController = async(req,res)=>{
  try{
    const {email,password} = req.body;
    // validation
    if(!email || !password){
      return res.status(404).send({
        success:false,
        message:"Invalid Email or Password",
      })
    }
    // check user
    const user = await User.findOne({email})
    if(!user){
      return res.status(404).send({
        message:"Email is not registered",
        success:false
      })
    }
    const match = await comparePassword(password,user.password);
    if(!match){
      return res.status(200).send({
        success:false,
        message:"Invalid Password"
      })
    }
    // token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).send({
      success:true,
      message:"Login Successfully",
      user:{
        name:user.name,
        email:user.email,
        phone:user.phone,
        address:user.address,
        role : user.role,
      },
      token
    })
  }catch(error){
    console.log(error)
    res.status(500).send({
      message:"Error in login",
      success:false,
      error 
    })
  }
}

export const testController = (req, res) => {
  res.send("protected router");
};


// forgot password controller 
export const forgotPasswordController  = async(req,res)=>{
try{
  const {email,answer,newpassword} = req.body;
  // console.log(email,answer,newpassword);
  if(!email) {
    res.status(400).send({
      message:"Email is required"
    })
  }
  if (!answer) {
    res.status(400).send({
      message: "Answer is required",
    });
  }if (!newpassword) {
    res.status(400).send({
      message: "New password  is required",
    });
  }

  // check
  const user  = await User.findOne({email,answer});
  // validation
  if(!user){
   return res.status(404).send({
      success:false,
      message:"Wrong Email or Answer"
    })
  }

  const hashed = await hashPassword(newpassword);
  await User.findByIdAndUpdate(user._id,{password:hashed})
  res.status(200).send({
    success:true,
    message:"Password Reset Successfully",

  })
}catch(error){
  console.log(error);
  res.status(500).send({
    message: "Something went wrong",
    success: false,
    error,
  });
}

}

// update profile controller
export const updateProfileController = async(req,res)=>{
  try{
    const {name,password,email,address,phone} = req.body;
    const user = await User.findById(req.user._id);
    console.log(name);
  
    const hashedPassword = password ? await hashPassword(password) : undefined;
    let data = {};
    // password 
    if(password){
        data = {
        name: name || user.name,
        password: hashedPassword || user.password,
        email: email || user.email,
        phone: phone || user.phone,
        address: address || user.address,
      }
    }else{
      data = {
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone,
        address: address || user.address,
      };
    }
    console.log(data);
    const updatedUser = await User.findByIdAndUpdate(req.user._id,data,{new:true});
    console.log(updatedUser)
    res.status(200).send({
      success:true,
      message:"Profile Updated Successfully",
      updatedUser
    })
  }catch(error){
    console.log(error);
    res.status(400).send({
      success:false,
      message:"Error While Updating Profile",
      error
    })
  }
}

export const getOrdersController = async (req, res) => {
  try {
    // console.log(req.user._id);
    const orders = await orderModel.find({ buyer: req.user._id}).populate("products","-slug").populate("buyer","name");
    res.json(orders);


  } catch (error) {
    console.log(error);
    res.status(404).send({
      message: "Orders are not fetched",
      success: false,
      error,
    });
  }
};

// get all orders
export const getAllOrderController= async(req,res)=>{
   try {
    //  console.log(req.user._id);
     const orders = await orderModel
       .find({})
       .populate("products", "-slug")
       .populate("buyer", "name").sort({createdAt:-1});
       res.json(orders);
   } catch (error) {
     console.log(error);
     res.status(404).send({
       message: "Orders are not fetched",
       success: false,
       error,
     });
   }
}

export const usersController = async(req,res)=>{
  try{
    const users = await User.find({});
    res.status(200).send({
      success:true,
      users
    })
  }catch(error){
    console.log(error);
    res.status(404).send({
      success: false,
      error
    });
  }
}