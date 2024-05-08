import express from "express"
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  getOrdersController,
  updateProfileController,
  usersController,
  getAllOrderController,
} from "../controllers/authController.js";
import {isAdmin, requireSignIn} from '../middlewares/authMiddleware.js';

const router = express.Router();

// routing

// REGISTER
router.post("/register",registerController);

// LOGIN 
router.post('/login',loginController);

// forgot password
router.post('/forgot-password',forgotPasswordController);

// test routes for checking  middleware 
router.get('/test',requireSignIn,isAdmin ,testController);


// USER  protected Route
router.get("/user-auth",requireSignIn,(req,res)=>{
    res.status(200).send({
        ok:true
    })
})
//ADMIN  protected Route
router.get("/admin-auth",requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({
        ok:true
    })
})

// update profile
router.put('/profile',requireSignIn,updateProfileController);

// orders
router.get("/orders", requireSignIn, getOrdersController);

// all orders 
router.get("/all-orders",requireSignIn,isAdmin,getAllOrderController);

// fetch all users 
router.get("/users",requireSignIn,isAdmin,usersController);


export default router;