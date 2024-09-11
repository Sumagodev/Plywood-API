import mongoose, { model, Schema, Types } from "mongoose";

export interface IFlashSale {
  userId: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  price: Number;
  salePrice: Number;
  discountType: string;
  description: string;
  pricetype: string;
  discountValue: Number;
  endDate: Date;
  startDate: Date;
  createdAt: Date;
  updateAt: Date;
}

const flashSale = new Schema<IFlashSale>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
    },
    price: Number,
    salePrice: Number,
    description: String,
    pricetype: String,
    discountType: String,
    discountValue: Number,
    endDate: { type: Date, default: new Date() },
    startDate: { type: Date, default: new Date() },
  },
  { timestamps: true }
);

export const FlashSale = model<IFlashSale>("FlashSale", flashSale);
