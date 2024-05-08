import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],
    payment: {
      type: String,
    },
    buyer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: "Processing",
      enum: ["Not Process", "Processing", "Shipped", "delivered", "cancel"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
