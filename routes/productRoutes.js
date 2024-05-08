import express from "express"
import { isAdmin, requireSignIn } from './../middlewares/authMiddleware.js';
import {
  createProductController,
  getProductController,
  getSingleProductController,
  deleteProductController,
  updateProductController,
  productFilterController,
  productCountController,
  productListController,
  searchProductController,
  orderController,
  orderValidateController,
  relatedProductController,
  successfullPaymentController,
} from "../controllers/productController.js";
import multer from "multer";


const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/upload/`);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });
// upload.single("file");
// routes
router.post('/create-product',requireSignIn,isAdmin, upload.single('file') ,createProductController);

// router.post("/create-product", requireSignIn, isAdmin, createProductController);

// update product
router.put( "/update-product/:id", requireSignIn, isAdmin, upload.single('file'), updateProductController);

// get product
router.get("/get-product",getProductController);

router.get("/get-product/:id", getSingleProductController);


// delete product
router.delete('/delete-product/:pid',deleteProductController);



// filter product
router.post('/product-filters',productFilterController);

// product count
router.get("/product-count",productCountController);

// product per page
router.get('/product-list/:page',productListController);

// search product
router.get("/search/:keyword",searchProductController);

// similar product
router.get('/related-product/:pid/:cid',relatedProductController);


router.post('/order',orderController);

router.post('/order/validate',orderValidateController);
router.post("/orderDone",successfullPaymentController);

// order status update
// router.put(
//   "/order-status/:orderid",
//   requireSignIn,
//   isAdmin,
//   orderStatusController
// );




export default router;