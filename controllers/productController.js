import slugify from "slugify";
import productModel from "../models/productModel.js"
import orderModel from "../models/orderModel.js"
import dotenv from "dotenv"
import User from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
dotenv.config();


export const createProductController = async(req,res)=>{
    try{
      // const {name,slug,description,price,category,quantity,shipping} = req.fields;

      const { name, description, price, category, quantity, shipping } =
        req.body;
      console.log(name, description, price, category, quantity, shipping);

      const photo = req.file.filename;
      //  console.dir("consoling photo data "+photo);
      //  console.log(photo[0]);

      // validation
      switch (true) {
        case !name:
          return res.status(500).send({ error: "Name is required" });
        case !description:
          return res.status(500).send({ error: "Description is required" });
        case !price:
          return res.status(500).send({ error: "Price is required" });
        case !category:
          return res.status(500).send({ error: "Category is required" });
        case !quantity:
          return res.status(500).send({ error: "Quantity is required" });
        case photo && photo.size > 10000:
          return res
            .status(500)
            .send({ error: "Photo is required and should be less than 1mb" });
      }

      const products = await new productModel({
        name,
        slug: slugify(name),
        description,
        price,
        category,
        quantity,
        shipping,
        photo
      }).save();

      console.log(products);
      res.status(200).send({
        success: true,
        message: "Product Created Successfully",
        products,
      });
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in creating product"
        })
    }
}


export const getProductController = async(req,res)=>{
  try{
      // console.log("first")
    const products = await productModel.find({}).populate('category').select("-slug");
    // const products = await productModel.find({}).select("-photo");
    // it will return everything except photo
    res.status(201).send({
      success:true,
      totalProducts:products.length,
      products,
      message:"All products fetched Successfully",
    })

  }catch(error){
    console.log(error)
    res.status(500).send({
      success:false,
      error,
      message:"Error in getting products"
    });
  }
}

// get single product 
export const getSingleProductController= async(req,res)=>{
  try{
    console.log("get single product controller")
    const product = await productModel.findOne({_id:req.params?.id}).select("-slug").populate("category");
    console.log(product+"using product");
    if(product === null){
      return res.status(404).send({
        message:"no such product is present",
        success:false,
        productLength:0
      })
    }
     res.status(201).send({
       success: true,
       product,
       productLength: product.length,
       message: "Single Product fetched Successfully",
     });
  }catch(error){
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting single  product",
    });
  }
}



export const deleteProductController = async(req,res)=>{
  try{
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success:true,
      message:"product deleted successfully"
    });
  }catch(error){
     console.log(error);
     res.status(500).send({
       success: false,
       error,
       message: "Error while  deleting  product ",
     });
  }
}

// update controller 
export const updateProductController = async (req, res) => {
  try {
    const {name, description, price, category, quantity, shipping} = req.body;
    const photo = req.file?.filename;
    console.log(photo);
    
    // console.log(name, description, price, category, quantity, shipping);
    // validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is required" });
      case !description:
        return res.status(500).send({ error: "Description is required" });
      case !price:
        return res.status(500).send({ error: "Price is required" });
      case !category:
        return res.status(500).send({ error: "Category is required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is required" });
      case photo && photo.size > 10000:
        return res
          .status(500)
          .send({ error: "Photo is required and should be less than 1mb" });
    }

    const prodDetails = await productModel.findOne({_id:req.params.id}).populate("category");
    // console.log("product details "+prodDetails.category._id);

    const products = await productModel.findByIdAndUpdate(
         prodDetails._id
    ,  {
        name,
        slug: slugify(name),
        description,
        price,
        category: prodDetails.category._id,
        quantity,
        shipping,
        photo,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Product updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating product",
    });
  }
};

// ======================================== filters = =======================
export const productFilterController = async(req,res)=>{
  try{
    const {checked ,radio} = req.body;
    let args = {}
    if(checked.length>0) args.category = checked;
    if(radio.length) args.price = {$gte : radio[0] , $lte : radio[1]};
    const products = await productModel.find(args);
    res.status(200).send({
      success:true,
      products      
    })
  }catch(error){
    console.log(error)
    res.status(400).send({
      success:false,
      message:"Error while filtering products",
      error
    })
  }
}

// ========================================================= product count controller
export const productCountController = async(req,res)=>{
  try{
    const total  = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success:true,
      total
    })
  }catch(error){
    console.log(error);
    res.status(400).send({
      message:"Error in product count",
      error,
      success:false
    })
  }
}

// ======================================================== pagination --- product list controller

export const productListController = async(req,res)=>{
  try{
    const perPage = 9;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel.find({}).select("-slug").skip((page-1) * perPage).limit(perPage).sort({createdAt: -1});
    res.status(200).send({
      success:true,
      products
    })
  }catch(error){
    console.log(error)
    res.status(404).send({
      message:"error in per page control",
      success:true,
      error
    })
  }
}

// search product
export const searchProductController = async(req,res)=>{
  try{
    const {keyword} =  req.params;
    const result = await productModel.find({
      $or:[
        {name:{$regex: keyword,$options:"i"}},
        {description:{$regex: keyword,$options:"i"}}
      ]
    }).select("-slug");
    res.json(result);
  }catch(error){
    console.log(error)
    res.status(404).send({
      success:false,
      message:"Error in Search Product Api",
      error
    })
  }
}

// related product controller =============================================================
export const relatedProductController = async(req,res)=>{
  try{
    const {pid,cid} = req.params;
    const products = await productModel.find({
      category:cid,
      _id:{$ne:pid},
    }).select("-slug").limit(3).populate("category");
    res.status(200).send({
      success:true,
      products
    })
  }catch(error){
    console.log(error);
    res.status(404).send({
      message:"Error while getting the related product",
      success:false,
      error
    })
  }
}

export const orderController = async (req, res) => {
  try {
    const razorapy = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    const { options } = req.body;
    let totalPrice = 0;
    options.map((prod) => {
      totalPrice += prod.price * prod.quantity;
    });
    const amount = totalPrice;
    const razorpayOptions = {
      amount: Number(amount * 100),
      currency: "INR",
    };
    const order = await razorapy.orders.create(razorpayOptions);
    if (!order) {
      res.status(500).send({
        message: "error",
      });
    } else {
      res.status(200).json({ order, totalPrice });
    }
  } catch (error) {
    console.log("Error:-> ", error);
    res.status(404).send({
      message: "error in doing order",
      success: false,
      error,
    });
  }
};

export const orderValidateController = async(req,res)=>{
  try{
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sha = crypto.createHmac("sha256",process.env.RAZORPAY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");
    if(digest !== razorpay_signature){
      return res.status(400).json({msg : "error",success:false});
    }
    res.json({
      msg: "success",
      success:true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  }catch(error){
    console.log(error);
    res.json({
      msg:"error"
    })
  }
}

export const successfullPaymentController = async(req,res)=>{
  try{
    const { email, cart } = req.body;
    // console.log("cart item s ---------"+cart);
    const userId =await User.findOne({email});
    const id = userId._id;
    // console.log(userId._id + " afhkfj" + userId);
    const order = new orderModel({
      products: cart,
      payment: "Successfull",
      buyer: id,
    }).save();
    // buyer: req.user._id, this req.user._id is fetched from requireSignin
    res.status(200).send({
      message: "Data added successfully",
      success: true,
    });
  }catch(error){
    console.log("no success");
  }
}


// export const orderStatusController = async(req,res) => {
//   try {
//     const {orderid} = req.params;
//     console.log(orderid);
//     const {status} = req.body;
//     console.log(status);
//     console.log("first")
//     // const orders = await orderModel.findByIdAndUpdate(orderId,{status},{new:true});
//     res.status(200).send({
//       msg:"hi"
//     })
//   } catch (error) {
//     console.log(error);
//     res.status(404).send({
//       message: "error in updatin order status",
//       success: false,
//       error,
//     });
//   }
// };